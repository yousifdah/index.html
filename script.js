let incomes = [], expenses = [], savings = [];
let currentLang = "nl";
let chart;

// 🌙 Thema wissel
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

// 🌍 Taal wissel
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

function toggleLanguage() {
  currentLang = currentLang === "nl" ? "en" : "nl";
  const t = translations[currentLang];
  document.getElementById("page-title").textContent = t.title;
  document.querySelectorAll("section").forEach((sec, i) => {
    if (i === 1) sec.querySelector("h2").textContent = t.income;
    if (i === 2) sec.querySelector("h2").textContent = t.expenses;
    if (i === 3) sec.querySelector("h2").textContent = t.savings;
    if (i === 7) sec.querySelector("p").textContent = `${t.balance}: €${getBalance()}`;
  });
  document.getElementById("language-toggle").textContent = currentLang === "nl" ? "🇬🇧 Engels" : "🇳🇱 Nederlands";
}

// 📆 Maandbeheer
function getMonthKey() {
  return "budget_" + document.getElementById("month-select").value;
}

function saveMonthData() {
  const data = { incomes, expenses, savings };
  localStorage.setItem(getMonthKey(), JSON.stringify(data));
}

function loadMonthData() {
  const raw = localStorage.getItem(getMonthKey());
  if (raw) {
    const data = JSON.parse(raw);
    incomes = data.incomes || [];
    expenses = data.expenses || [];
    savings = data.savings || [];
  } else {
    incomes = [];
    expenses = [];
    savings = [];
  }
}

// ➕ Toevoegen functies
function addIncome() {
  const source = document.getElementById("income-source").value;
  const amount = parseFloat(document.getElementById("income-amount").value);
  if (!source || isNaN(amount)) return alert("Vul een geldige bron en bedrag in.");
  incomes.push({ source, amount });
  saveMonthData();
  updateAll();
}

function addExpense() {
  const category = document.getElementById("expense-category").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  if (!category || isNaN(amount)) return alert("Vul een geldige categorie en bedrag in.");
  expenses.push({ category, amount });
  saveMonthData();
  updateAll();
}

function addSaving() {
  const goal = document.getElementById("saving-goal").value;
  const target = parseFloat(document.getElementById("saving-target").value);
  const progress = parseFloat(document.getElementById("saving-progress").value);
  if (!goal || isNaN(target) || isNaN(progress)) return alert("Vul alle spaarvelden correct in.");
  savings.push({ goal, target, progress });
  saveMonthData();
  updateAll();
}

// 📋 Tabellen
function updateIncomeTable() {
  const table = document.getElementById("income-table");
  table.innerHTML = "<tr><th>Bron</th><th>Bedrag (€)</th></tr>";
  incomes.forEach(i => {
    table.innerHTML += `<tr><td>${i.source}</td><td>${i.amount.toFixed(2)}</td></tr>`;
  });
}

function updateExpenseTable() {
  const table = document.getElementById("expense-table");
  table.innerHTML = "<tr><th>Categorie</th><th>Bedrag (€)</th></tr>";
  expenses.forEach(e => {
    table.innerHTML += `<tr><td>${e.category}</td><td>${e.amount.toFixed(2)}</td></tr>`;
  });
}

function updateSavingsTable() {
  const table = document.getElementById("savings-table");
  table.innerHTML = "<tr><th>Doel</th><th>Doelbedrag</th><th>Gespaard</th><th>Voortgang</th></tr>";
  savings.forEach(s => {
    const percent = Math.min((s.progress / s.target) * 100, 100);
    table.innerHTML += `<tr>
      <td>${s.goal}</td>
      <td>€${s.target.toFixed(2)}</td>
      <td>€${s.progress.toFixed(2)}</td>
      <td><progress value="${percent}" max="100"></progress></td>
    </tr>`;
  });
}

// 💰 Saldo
function getBalance() {
  const incomeTotal = incomes.reduce((sum, i) => sum + i.amount, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsTotal = savings.reduce((sum, s) => sum + s.progress, 0);
  return incomeTotal - expenseTotal + savingsTotal;
}

// 📊 Grafiek
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

// 📥 CSV-export
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

// 🔄 Alles updaten
function updateAll() {
  updateIncomeTable();
  updateExpenseTable();
  updateSavingsTable();
  updateChart();
  document.getElementById("total-balance").textContent = `${translations[currentLang].balance}: €${getBalance().toFixed(2)}`;
}

// 🚀 Start
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

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

  loadMonthData();
  updateAll();
});

