// ... [alle eerdere functies blijven zoals je ze had] ...

function updateChart() {
  const ctx = document.getElementById("budget-chart").getContext("2d");
  const data = [
    incomes.reduce((sum, i) => sum + i.amount, 0),
    expenses.reduce((sum, e) => sum + e.amount, 0),
    savings.reduce((sum, s) => sum + s.progress, 0)
  ];

  if (!chart) {
    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Inkomsten", "Uitgaven", "Gespaard"],
        datasets: [{
          data,
          backgroundColor: ["#2a9d8f", "#e76f51", "#f4a261"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  } else {
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

function exportCSV() {
  let csv = "Type,Beschrijving,Bedrag\n";
  incomes.forEach(i => csv += `Inkomen,${i.source},${i.amount}\n`);
  expenses.forEach(e => csv += `Uitgave,${e.category},${e.amount}\n`);
  savings.forEach(s => csv += `Spaardoel,${s.goal},${s.progress}/${s.target}\n`);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `budget_${document.getElementById("month-select").value}.csv`;
  link.click();
}

function updateAll() {
  updateIncomeTable();
  updateExpenseTable();
  updateSavingsTable();
  updateChart();
  document.getElementById("total-balance").textContent =
    `${translations[currentLang].balance}: €${getBalance().toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  generateMonthOptions();
  loadMonthData();
  updateAll();

  document.getElementById("income-btn").addEventListener("click", addIncome);
  document.getElementById("expense-btn").addEventListener("click", addExpense);
  document.getElementById("saving-btn").addEventListener("click", addSaving);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("language-toggle").addEventListener("click", toggleLanguage);
  document.getElementById("export-btn").addEventListener("click", exportCSV);
  document.getElementById("month-select").addEventListener("change", () => {
    loadMonthData();
    updateAll();
  });
});
