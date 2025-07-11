let incomes = [], expenses = [], savings = [];
let currentLang = "nl";
let chart;

// 🌍 Taal vertaling
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

// 📅 Dynamisch maanddropdown
function generateMonthOptions(startYear = 2024, yearsAhead = 3) {
  const select = document.getElementById("month-select");
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  for (let y = startYear; y <= startYear + yearsAhead; y++) {
    for (let m = 0; m < 12; m++) {
      const value = `${y}-${String(m + 1).padStart(2, "0")}`;
      const label = new Date(y, m).toLocaleString(currentLang === "nl" ? "nl-NL" : "en-US", {
        month: "long",
        year: "numeric"
      });
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      select.appendChild(option);
    }
  }

  const defaultValue = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  select.value = defaultValue;
}

// 📆 Opslag
function getMonthKey() {
  return "budget_" + document.getElementById("month-select").value;
}

function saveMonthData() {
  localStorage.setItem(getMonthKey(), JSON.stringify({ incomes, expenses, savings }));
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

// 🌙 Thema wissel
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

// 🈶 Taal wissel
function toggleLanguage() {
  currentLang = currentLang === "nl" ? "en" : "nl";
  const t = translations[currentLang];
  document.getElementById("page-title").textContent = t.title;
  document.querySelectorAll("section").forEach((sec, i) => {
    if (i === 1) sec.querySelector("h2").textContent = t.income;
    if (i === 2) sec.querySelector("h2").textContent = t.expenses;
    if (i === 3) sec.querySelector("h2").textContent = t.savings;
    if (i === 7) sec.querySelector("p").textContent = `${t.balance}: €${getBalance().toFixed(2)}`;
  });
  document.getElementById("language-toggle").textContent = currentLang === "nl" ? "🇬🇧 Engels" : "🇳🇱 Nederlands";
}

// ✅ Toevoegen functies
function addIncome() {
  const source = document.getElementById("income-source").value;
  const amount = parseFloat(document.getElementById("income-amount").value);
  if (!source || isNaN(amount)) return alert("Vul een geldige bron en bedrag in.");
  incomes.push({ source, amount });
  saveMonthData(); updateAll();
}

function addExpense() {
  const category = document.getElementById("expense-category").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  if (!category || isNaN(amount)) return alert("Vul een geldige categorie en bedrag in.");
  expenses.push({ category, amount });
  saveMonthData(); updateAll();
}

function addSaving() {
  const goal = document.getElementById("saving-goal").value;
  const target = parseFloat(document.getElementById("saving-target").value);
  const progress = parseFloat(document.getElementById("saving-progress").value);
  if (!goal || isNaN(target) || isNaN(progress)) return alert("Vul alle spaarvelden correct in.");
  savings.push({ goal, target, progress });
  saveMonthData(); updateAll();
}

// 🧠 Cellen bewerkbaar maken
function makeEditable(cell, updateCallback) {
  cell.addEventListener("dblclick", () => {
    const oldValue = cell.textContent;
    const input = document.createElement("input");
    input.value = oldValue;
    cell.textContent = "";
    cell.appendChild(input);
    input.focus();

    input.addEventListener("blur", () => {
      const newValue = input.value;
      cell.textContent = newValue;
      updateCallback(newValue);
      saveMonthData(); updateAll();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
    });
  });
}

// 📋 Tabellen
function updateIncomeTable() {
  const table = document.getElementById("income-table");
  table.innerHTML = "<tr><th>Bron</th><th>Bedrag (€)</th></tr>";
  incomes.forEach((i, idx) => {
    const row = document.createElement("tr");
    const sourceCell = document.createElement("td");
    const amountCell = document.createElement("td");

    sourceCell.textContent = i.source;
    amountCell.textContent = i.amount.toFixed(2);

    makeEditable(sourceCell, val => incomes[idx].source = val);
    makeEditable(amountCell, val => incomes[idx].amount = parseFloat(val) || 0);

    row.appendChild(sourceCell); row.appendChild(amountCell);
    table.appendChild(row);
  });
}

function updateExpenseTable() {
  const table = document.getElementById("expense-table");
  table.innerHTML = "<tr><th>Categorie</th><th>Bedrag (€)</th></tr>";
  expenses.forEach((e, idx) => {
    const row = document.createElement("tr");
    const catCell = document.createElement("td");
    const amtCell = document.createElement("td");

    catCell.textContent = e.category;
    amtCell.textContent = e.amount.toFixed(2);

    makeEditable(catCell, val => expenses[idx].category = val);
    makeEditable(amtCell, val => expenses[idx].amount = parseFloat(val) || 0);

    row.appendChild(catCell); row.appendChild(amtCell);
    table.appendChild(row);
  });
}

function updateSavingsTable() {
  const table = document.getElementById("savings-table");
  table.innerHTML = "<tr><th>Doel</th><th>Doelbedrag</th><th>Gespaard</th><th>Voortgang</th></tr>";
  savings.forEach((s, idx) => {
    const row = document.createElement("tr");
    const goalCell = document.createElement("td");
    const targetCell = document.createElement("td");
    const progressCell = document.createElement("td");
    const barCell = document.createElement("td");

    goalCell.textContent = s.goal;
    targetCell.textContent = s.target.toFixed(2);
    progressCell.textContent = s.progress.toFixed(2);

    makeEditable(goalCell, val => savings[idx].goal = val);
    makeEditable(targetCell, val => savings[idx].target = parseFloat(val) || 0);
    makeEditable(progressCell, val => savings[idx].progress = parseFloat(val) || 0);

    const percent = Math.min((s.progress / s.target) * 100, 100);
    barCell.innerHTML = `<progress value="${percent}" max="100"></progress>`;

    row.appendChild(goalCell);
    row.appendChild(targetCell);
    row.appendChild(progressCell);
    row.appendChild(barCell);
    table.appendChild(row);
  });
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
        plugins: { legend: { position
