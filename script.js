document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("income-btn").addEventListener("click", addIncome);
  document.getElementById("expense-btn").addEventListener("click", addExpense);
  document.getElementById("saving-btn").addEventListener("click", addSaving);
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  document.getElementById("language-toggle").addEventListener("click", toggleLanguage);
  document.getElementById("export-btn").addEventListener("click", exportCSV);
  document.getElementById("month-select").addEventListener("change", handleMonthChange);
});

// 🌙 Thema wisselaar
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// 🇳🇱↔🇬🇧 Taal wisselaar
const translations = {
  nl: {
    title: "Mijn Budgetplanner",
    income: "Inkomsten toevoegen",
    expenses: "Uitgaven toevoegen",
    savings: "Spaardoel toevoegen",
    balance: "Totaal saldo"
  },
  en: {
    title: "My Budget Planner",
    income: "Add Income",
    expenses: "Add Expense",
    savings: "Add Saving Goal",
    balance: "Total Balance"
  }
};

let currentLang = "nl";

document.getElementById("language-toggle").addEventListener("click", () => {
  currentLang = currentLang === "nl" ? "en" : "nl";
  const t = translations[currentLang];
  document.getElementById("page-title").textContent = t.title;
  document.querySelectorAll("section").forEach((sec, i) => {
    if (i === 0) sec.querySelector("h2").textContent = t.income;
    if (i === 1) sec.querySelector("h2").textContent = t.expenses;
    if (i === 2) sec.querySelector("h2").textContent = t.savings;
    if (i === 6) sec.querySelector("p").textContent = `${t.balance}: €${getBalance()}`;
  });
  document.getElementById("language-toggle").textContent = currentLang === "nl" ? "🇬🇧 Engels" : "🇳🇱 Nederlands";
});

// 🧾 Data arrays
let incomes = [], expenses = [], savings = [];

// 💰 Inkomsten toevoegen
function addIncome() {
  const source = document.getElementById("income-source").value;
  const amount = parseFloat(document.getElementById("income-amount").value);
  if (!source || isNaN(amount)) return;

  incomes.push({ source, amount });
  updateIncomeTable();
  updateChart();
}

// 🛒 Uitgaven toevoegen
function addExpense() {
  const category = document.getElementById("expense-category").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  if (!category || isNaN(amount)) return;

  expenses.push({ category, amount });
  updateExpenseTable();
  updateChart();
}

// 🎯 Spaardoel toevoegen
function addSaving() {
  const goal = document.getElementById("saving-goal").value;
  const target = parseFloat(document.getElementById("saving-target").value);
  const progress = parseFloat(document.getElementById("saving-progress").value);
  if (!goal || isNaN(target) || isNaN(progress)) return;

  savings.push({ goal, target, progress });
  updateSavingsTable();
  updateChart();
}

// 🔄 Tabellen updaten
function updateIncomeTable() {
  const table = document.getElementById("income-table");
  table.innerHTML = "<tr><th>Bron</th><th>Bedrag (€)</th></tr>";
  incomes.forEach(i => {
    table.innerHTML += `<tr><td>${i.source}</td><td>${i.amount}</td></tr>`;
  });
}

function updateExpenseTable() {
  const table = document.getElementById("expense-table");
  table.innerHTML = "<tr><th>Categorie</th><th>Bedrag (€)</th></tr>";
  expenses.forEach(e => {
    table.innerHTML += `<tr><td>${e.category}</td><td>${e.amount}</td></tr>`;
  });
}

function updateSavingsTable() {
  const table = document.getElementById("savings-table");
  table.innerHTML = "<tr><th>Doel</th><th>Doelbedrag</th><th>Gespaard</th><th>Voortgang</th></tr>";
  savings.forEach(s => {
    const percent = Math.min((s.progress / s.target) * 100, 100);
    table.innerHTML += `<tr>
      <td>${s.goal}</td>
      <td>€${s.target}</td>
      <td>€${s.progress}</td>
      <td><progress value="${percent}" max="100"></progress></td>
    </tr>`;
  });
}

// 🧮 Saldo berekening
function getBalance() {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSavings = savings.reduce((sum, s) => sum + s.progress, 0);
  return totalIncome - totalExpenses + totalSavings;
}

// 📊 Grafiek updaten
let chart;
function updateChart() {
  const incomeTotal = incomes.reduce((sum, i) => sum + i.amount, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsTotal = savings.reduce((sum, s) => sum + s.progress, 0);

  if (!chart) {
    const ctx = document.getElementById("budget-chart").getContext("2d");
    chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Inkomsten", "Uitgaven", "Gespaard"],
        datasets: [{
          data: [incomeTotal, expenseTotal, savingsTotal],
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
    chart.data.datasets[0].data = [incomeTotal, expenseTotal, savingsTotal];
    chart.update();
  }

  document.getElementById("total-balance").textContent = `${translations[currentLang].balance}: €${getBalance()}`;
}

// 🌅 Thema bij laden toepassen
window.addEventListener("load", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
});
