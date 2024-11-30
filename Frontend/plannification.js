document.getElementById('planning-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const budgetInput = document.getElementById('budget');
    const budget = parseFloat(budgetInput.value);

    if (isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    try {
        // Send the budget to the backend
        const response = await fetch('/planning/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ budget }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

        const { plan, remainingBudget } = await response.json();

        // Populate the table
        const tbody = document.querySelector('#plan-table tbody');
        tbody.innerHTML = '';
        plan.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.product}</td>
                <td>${item.quantity}</td>
                <td>${item.cost.toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });

        // Display remaining budget
        const remainingBudgetDiv = document.getElementById('remaining-budget');
        remainingBudgetDiv.innerHTML = `<h4>Remaining Budget: ${remainingBudget.toFixed(2)} TND</h4>`;

        // Show results section
        document.getElementById('results-section').classList.remove('d-none');

    } catch (error) {
        console.error('Error fetching the plan:', error);
        alert('An error occurred while calculating the plan. Please try again.');
    }
});
