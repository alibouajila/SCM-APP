let editingStockId = null; // Track which item is being edited
document.getElementById("discount").addEventListener("input",()=>{
    if(parseInt(discount.value)>100)
{
    discount.value=100;
} if(parseInt(discount.value)<0){
    discount.value=0
}

})


document.getElementById("price").addEventListener("input",()=>{

if(parseInt(price.value)<0){    
    price.value=0}
})
// Event listener for price, discount, and count fields to update the total
document.querySelectorAll('#price, #discount, #count').forEach(input => {
    input.addEventListener('input', () => {
        const price = parseFloat(document.getElementById('price').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const quantity = parseInt(document.getElementById('quantity').value) || 1; // Default count to 1
        const total = (price - discount * price / 100) ;
        document.getElementById('total').innerText = `${total.toFixed(2)} TND`;
    });
});

// Handle the submit button event (Create or Update based on state)
document.getElementById('submit').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const price = parseFloat(document.getElementById('price').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const quantity = parseInt(document.getElementById('quantity').value) || 1;
    const category = document.getElementById('category').value;

    const total = (price - discount * price / 100);

    const url = editingStockId
        ? `/stock-system/update-stock/${editingStockId}`
        : `/stock-system/add-stock`;
    const method = editingStockId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title,
            price,
            quantity,
            discount,
            category,
            total,
        }),
    });

    const result = await response.json();
    console.log(result);

    resetForm();
    loadStockData();
});

// Function to load the stock data
async function loadStockData() {
    const response = await fetch('stock-system/get-stock');
    const stocks = await response.json();

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = ''; // Clear the table body

    // Filter stocks with shipping: false and display them
    const nonShippingStocks = stocks.filter(stock => !stock.shipping);

    // Show or hide the "Delete All" button
    const deleteAllButton = document.getElementById('deleteall');
    if (nonShippingStocks.length > 0) {
        deleteAllButton.style.display = 'block'; // Show the button
    } else {
        deleteAllButton.style.display = 'none'; // Hide the button
    }

    nonShippingStocks.forEach((stock, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${stock.title}</td>
            <td>${stock.price}</td>
            <td>${stock.quantity}</td>
            <td>${stock.discount} %</td>
            <td>${stock.category}</td>
            <td>${stock.total} TND</td>
            <td>
                <div class="btn-group">
                    <button onclick="editStock('${stock._id}')">Update</button>
                    <button onclick="deleteStock('${stock._id}')">Delete</button>
                    <button onclick="markForShipping('${stock._id}')">Sell</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}
// Function to mark a product for shipping (sell a product)
async function markForShipping(stockId) {
    try {
        const response = await fetch(`/stock-system/mark-for-shipping/${stockId}`, {
            method: 'PUT',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error from server:', errorData.message);
            return;
        }

        const data = await response.json();
        console.log('Shipping item updated:', data);

        // Refresh the stock data
        loadStockData(); // Reload the table to reflect quantity changes
    } catch (err) {
        console.error('Error in markForShipping function:', err);
    }
}

// Function to add the new shipping item to the "suivi expedition" page dynamically
async function addToShippingPage(shippingStock) {
    const tbody = document.getElementById('shipping-tbody'); // Assuming this is the tbody for the shipping table

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${shippingStock.title}</td>
        <td>${shippingStock.price}</td>
        <td>${shippingStock.quantity}</td>
        <td>${shippingStock.category}</td>
        <td>${shippingStock.total} TND</td>
        <td>${shippingStock.location}</td>
        <td>
            <button onclick="cancelShipping('${shippingStock._id}')">Cancel</button>
        </td>
    `;

    tbody.appendChild(row);
}

// Function to delete an individual stock item
async function deleteStock(stockId) {
    const response = await fetch(`/stock-system/delete-stock/${stockId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        loadStockData();
    }
}

// Function to delete all stock items
async function deleteAll() {
    const response = await fetch('/stock-system/delete-all  ', {
        method: 'DELETE',
    });

    if (response.ok) {
        loadStockData(); // Refresh the table after deletion
    } else {
        console.error('Failed to delete all non-shipping stocks.');
        loadStockData()
    }
}


// Function to edit an existing stock item
function editStock(stockId) {
    editingStockId = stockId;

    fetch(`/stock-system/get-stock/${stockId}`)
        .then(response => response.json())
        .then(stock => {
            document.getElementById('title').value = stock.title;
            document.getElementById('price').value = stock.price;
            document.getElementById('quantity').value = stock.quantity;
            document.getElementById('discount').value = stock.discount;
            document.getElementById('category').value = stock.category;
            document.getElementById('total').innerText = `${stock.total.toFixed(2)} TND`;

            document.getElementById('submit').innerText = 'Update';
        })
        .catch(err => console.error(err));
}

// Function to reset the form
function resetForm() {
    editingStockId = null;

    document.getElementById('title').value = '';
    document.getElementById('price').value = '';
    document.getElementById('discount').value = '0';
    document.getElementById('quantity').value = '1';
    document.getElementById('category').value = '';
    document.getElementById('total').innerText = '0.00 TND';

    document.getElementById('submit').innerText = 'Create';
}
// Initial data load
loadStockData();
