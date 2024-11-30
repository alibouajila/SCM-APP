import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import Stock from './models/stock.js';
import  './Database.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const app = express();

    app.use(express.json());
app.use(express.static(path.join(__dirname, '../Frontend')));

// Serve the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend', 'index.html'));
});

// Serve the stock management page
app.get('/stock-system', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend', 'gestiondestock.html'));
});

// API Routes for Stock Management
app.post('/stock-system/add-stock', async (req, res) => {
    const { title, price,quantity,discount, category } = req.body;

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a positive integer.' });
    }

    const total = price - (discount * price / 100); // Apply discount

    const stocks = [];
        stocks.push({
            title,
            price,
            quantity,
            discount,
            category,
            total,
        });

    try {
        const savedStocks = await Stock.insertMany(stocks);
        res.status(201).json(savedStocks);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/stock-system/get-stock', async (req, res) => {
    try {
        const stocks = await Stock.find();
        res.json(stocks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/stock-system/delete-all', async (req, res) => {
    try {
        const result = await Stock.deleteMany({ shipping: false }); // Delete only items not marked for shipping
        res.status(200).json({ message: `${result.deletedCount} stocks deleted.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/stock-system/update-stock/:id', async (req, res) => {
    const { title, price,quantity, discount, category } = req.body;

    try {
        const updatedStock = await Stock.findByIdAndUpdate(req.params.id, {
            title,
            price,
            quantity,
            discount,
            category,
            total: price - (discount * price / 100), // Recalculate total
        }, { new: true });

        res.json(updatedStock);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
app.get('/stock-system/get-stock/:id', async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        res.json(stock);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/stock-system/mark-for-shipping/:id', async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);

        if (!stock) {
            return res.status(404).json({ message: 'Stock item not found.' });
        }

        if (stock.quantity <= 0) {
            return res.status(400).json({ message: 'No stock left to ship.' });
        }

        stock.quantity -= 1;
        stock.demand = (stock.demand || 0) + 1; // Increment demand

        // If quantity is 0, delete the stock item
        if (stock.quantity === 0) {
            await Stock.findByIdAndDelete(stock._id);
        } else {
            await stock.save();
        }

        const shippingStock = new Stock({
            title: stock.title,
            price: stock.price,
            discount: stock.discount,
            category: stock.category,
            total: stock.total,
            quantity: 1, // For shipping
            shipping: true,
            location: 'Shipping',
        });

        const savedShippingStock = await shippingStock.save();

        res.status(200).json({
            message: 'Item marked for shipping.',
            updatedStock: stock.quantity > 0 ? stock : null,
            newShippingStock: savedShippingStock,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});
app.delete('/stock-system/delete-stock/:id', async (req, res) => {
    try {
        await Stock.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Stock deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// serve the expedition page
app.get('/expedition-system', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'suivi_expedition.html'));
});
//API routes for suivi-expedition
app.get('/suivi-expedition/get-shipping-stocks', async (req, res) => {
    try {
        const shippingStocks = await Stock.find({ shipping: true });
        res.json(shippingStocks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/suivi-expedition/delete-received', async (req, res) => {
    try {
        const result = await Stock.deleteMany({ shipping: true, recu: true });
        res.status(200).json({ message: `Deleted ${result.deletedCount} received commands.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.put('/suivi-expedition/cancel-shipping-item/:id', async (req, res) => {
    try {
        // Find the shipping stock item by ID
        const shippingStock = await Stock.findById(req.params.id);

        if (!shippingStock || !shippingStock.shipping) {
            return res.status(400).json({ message: 'Shipping item not found or invalid.' });
        }

        // Try to find the original stock item
        let originalStock = await Stock.findOne({
            title: shippingStock.title,
            price: shippingStock.price,
            category: shippingStock.category,
            shipping: false,
        });

        if (originalStock) {
            // Update the quantity of the original stock
            originalStock.quantity += shippingStock.quantity;
            await originalStock.save();
        } else {
            // If the original stock no longer exists, create a new stock item
            originalStock = new Stock({
                title: shippingStock.title,
                price: shippingStock.price,
                discount: shippingStock.discount,
                category: shippingStock.category,
                total: shippingStock.total,
                quantity: shippingStock.quantity,
                shipping: false,
                location: 'Warehouse', // Default location for returned stock
            });
            await originalStock.save();
        }

        // Delete the shipping stock item
        await Stock.findByIdAndDelete(shippingStock._id);

        res.status(200).json({
            message: 'Shipping canceled and stock restored.',
            updatedOrNewStock: originalStock,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// serve the production planning page
app.get('/production-planning', (req, res) => {
    res.sendFile(path.join(__dirname,'../Frontend','plannification_prod.html'));
});
//API Routes for production planning
app.post('/planning/calculate', async (req, res) => {
    const { budget } = req.body;

    try {
        const stocks = await Stock.find().sort({ demand: -1 }); // Sort by demand

        let remainingBudget = budget;
        const plan = [];

        for (const stock of stocks) {
            if (remainingBudget <= 0) break;

            const maxQuantity = Math.floor(remainingBudget / stock.price);
            if (maxQuantity > 0) {
                const cost = maxQuantity * stock.price;
                plan.push({ product: stock.title, quantity: maxQuantity, cost });
                remainingBudget -= cost;
            }
        }

        res.status(200).json({ plan, remainingBudget });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/production-planning', async (req, res) => {
    try {
        const budget = parseFloat(req.query.budget);

        if (isNaN(budget) || budget <= 0) {
            return res.status(400).json({ message: 'Invalid budget value.' });
        }

        // Fetch all stock items
        const stocks = await Stock.find();

        // Calculate the maximum quantity for each item within the budget
        const results = stocks.map(stock => {
            const maxQuantity = Math.floor(budget / stock.price);
            return {
                title: stock.title,
                price: stock.price,
                maxQuantity: maxQuantity > stock.quantity ? stock.quantity : maxQuantity, // Limited by available stock
            };
        }).filter(item => item.maxQuantity > 0); // Only include items that can be purchased

        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});


app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});
