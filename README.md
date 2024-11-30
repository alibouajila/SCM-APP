
# SCM-APP (Stock and Shipment Management)

SCM-APP is a web-based application designed for managing stock, tracking shipments, and calculating the optimal quantity of products to import based on sales data. It provides a seamless solution for shop owners to streamline their inventory management process.

## Features

- **Stock Management**: Track and manage product stock levels in real time.  
- **Shipment Tracking**: Monitor shipments, including status updates and expected delivery times.  
- **Import Calculation**: Automatically calculate the ideal quantity of products to import based on sales data.  
- **Database Integration**: Data is stored and managed using MongoDB for efficient and scalable operations.

## Future Plans

- **Mobile App**: A mobile app will be developed for the delivery personnel (livreur) to:  
  - Mark items as received.  
  - Update the current location of the product during delivery.  
Currently, there is no mobile app, but it will be an upcoming feature. For now, these actions can only be performed directly through the database.

## Tech Stack

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Other**: JavaScript,Html,Css

## Setup

Follow these steps to set up and run the SCM-APP project locally:

### Prerequisites

- Install **Node.js**  
- Have access to a **MongoDB** instance (local or hosted, e.g., MongoDB Atlas)

### Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/SCM.git
   ```

2. Navigate to the project directory:  
   ```bash
   cd SCM
   ```

3. Install dependencies:  
   ```bash
   npm install
   ```

4. Configure the database connection:  
   - Open `backend/Database.js` and update the MongoDB connection string:
     ```javascript
     const URL = "mongodb+srv://username:password@cluster0.cplvw.mongodb.net/your_database_name?retryWrites=true&w=majority";
     ```
   Replace `username`, `password`, and `your_database_name` with your MongoDB credentials.

5. Start the server:  
   ```bash
   npm start
   ```

6. Open the app in your browser at:  
   ```text
   http://localhost:3000
   ```

## Usage

- Manage your stock in real time using the intuitive web interface.  
- Track shipments and monitor updates.  
- Input sales data to calculate the optimal quantity to import and manage inventory effectively.  

## License

This project is licensed under the MIT License.
