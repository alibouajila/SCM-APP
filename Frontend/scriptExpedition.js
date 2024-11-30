// Function to load shipping stock data
async function loadShippingStockData() {
    const response = await fetch('suivi-expedition/get-shipping-stocks');
    const shippingStocks = await response.json();

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = ''; // Clear the table body

    if (shippingStocks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">No items are currently out for shipping.</td></tr>`;
        return;
    }

    shippingStocks.forEach((stock, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${stock.title}</td>
            <td>${stock.category}</td>
            <td>${stock.total} TND</td>
            <td>${stock.location}</td>
            <td>
                <button class="toggle-recu-btn" data-id="${stock._id}">
                    ${stock.recu ? '✅' : '❌'}
                </button>
            </td>
            <td>
                <button onclick="cancelShipping('${stock._id}')" class="cancel-btn">Cancel</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to cancel shipping by deleting the stock item
async function cancelShipping(stockId) {
    const response = await fetch(`suivi-expedition/cancel-shipping-item/${stockId}`, {
        method: 'put',
    });

    if (response.ok) {
        const result = await response.json();
        alert('Shippment has been cancelled !');
        loadShippingStockData(); // Reload the table data
    } else {
        alert('Failed to cancel the shippment !');
    }
}

// Function to delete all received commands
async function deleteAllReceivedCommands() {
    const response = await fetch('suivi-expedition/delete-received', {
        method: 'DELETE',
    });
    if (response.ok) {
        const result = await response.json();
        alert(result.message); // Inform the user how many were deleted
        loadShippingStockData(); // Reload the table data
    } else {
        alert('Failed to delete received commands.');
    }
}

// Add event listener for the "Delete All Received" button
document.getElementById('delete-received').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all received commands?')) {
        deleteAllReceivedCommands();
    }
});

// Initial load of shipping stock data
loadShippingStockData();
