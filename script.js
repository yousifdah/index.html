let incomes = [], expenses = [], savings = [];
let currentLang = "nl";
let chart;

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

function generateMonthOptions(startYear = 2024, yearsAhead = 3) {
  const select = document.getElementById("month-select");
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  for (let y = startYear; y <= startYear + yearsAhead; y++) {
    for (let m = 0; m < 12; m++) {
      const value = `${y}-${String(m + 1).padStart(2, "0")}`;
      const label = new Date(y, m).toLocaleString(currentLang === "nl" ? "nl-NL" : "en-US", {
        month: "long", year: "numeric"
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
    incomes = []; expenses = []; savings = [];
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

function toggleLanguage() {
  currentLang = currentLang === "nl" ? "en" : "nl";
  const t = translations[currentLang];
  document.getElementById("page-title").textContent = t.title;

  const sections = document.querySelectorAll("section");
  sections[1].querySelector("h2").textContent = t.income;
  sections[2].querySelector("h2").textContent = t.expenses;
  sections[3].querySelector("h2").textContent = t.savings;
  sections[7].querySelector("p").textContent = `${t.balance}: €${getBalance().toFixed(2)}`;

  document.getElementById("income-btn").textContent = currentLang === "nl" ? "Toevoegen" : "Add";
  document.getElementById("expense-btn").textContent = currentLang === "nl" ? "Toevoegen" : "Add";
  document.getElementById("saving-btn").textContent = currentLang === "nl" ? "Toevoegen" : "Add";
  document.getElementById("export-btn").textContent = currentLang === "nl" ? "Download als CSV" : "Download CSV";
  document.getElementById("language-toggle").textContent = currentLang === "nl" ? "🇬🇧 Engels" : "🇳🇱 Nederlands";
}

function addIncome() {
  const source = document.getElementById("income-source").value;
  const amount = parseFloat(document.getElementById("income-amount").value);
  if (!source || isNaN(amount)) return alert("Vul een geldige bron en bedrag in.");
  incomes.push({ source, amount });
  document.getElementById("income-source").value = "";
  document.getElementById("income-amount").value = "";
  saveMonthData(); updateAll();
}

function addExpense() {
  const category = document.getElementById("expense-category").value;
  const amount = parseFloat(document.getElementById("expense-amount").value);
  if (!category || isNaN(amount)) return alert("Vul een geldige categorie en bedrag in.");
  expenses.push({ category, amount });
  document.getElementById("expense-category").value = "";
  document.getElementById("expense-amount").value = "";
  saveMonthData(); updateAll();
}

function addSaving() {
  const goal = document.getElementById("saving-goal").value;
  const target = parseFloat(document.getElementById("saving-target").value);
  const progress = parseFloat(document.getElementById("saving-progress").value);
  if (!goal || isNaN(target) || isNaN(progress)) return alert("Vul alle spaarvelden correct in.");
  savings.push({ goal, target, progress });
  document.getElementById("saving-goal").value = "";
  document.getElementById("saving-target").value = "";
  document.getElementById("saving-progress").value = "";
  saveMonthData(); updateAll();
}

function makeEditable(cell, updateCallback) {
  cell.addEventListener("dblclick", () => {
    const old = cell.textContent;
    const input = document.createElement("input");
    input.value = old;
    cell.textContent = "";
    cell.appendChild(input);
    input.focus();
    input.addEventListener("blur", () => {
      const val = input.value;
      cell.textContent = val;
      updateCallback(val);
      saveMonthData(); updateAll();
    });
    input.addEventListener("keydown", e => { if (e.key === "Enter") input.blur(); });
  });
}

function createDeleteButton(onClick) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.textContent = "✕";
  span.classList.add("delete-icon");
  span.addEventListener("click", onClick);
  td.appendChild(span);
  return td;
}

function updateIncomeTable() {
  const table = document.getElementById("income-table").querySelector("tbody");
  table.innerHTML = "";
  incomes.forEach((i, idx) => {
    const row = document.createElement("tr");
    const src = document.createElement("td"), amt = document.createElement("td");
    src.textContent = i.source; amt.textContent = i.amount.toFixed(2);
    makeEditable(src, val => incomes[idx].source = val);
    makeEditable(amt, val => incomes[idx].amount = parseFloat(val) || 0);
    row.appendChild(src); row.appendChild(amt);
    row.appendChild(createDeleteButton(() => { incomes.splice(idx, 1); saveMonthData(); updateAll(); }));
    table.appendChild(row);
  });
}

function updateExpenseTable() {
  const table = document.getElementById("expense-table").querySelector("tbody");
  table.innerHTML = "";
  expenses.forEach((e, idx) => {
    const row = document.createElement("tr");
    const cat = document.createElement("td"), amt = document.createElement("td");
    cat.textContent = e.category; amt.textContent = e.amount.toFixed(2);
    makeEditable(cat, val => expenses[idx].category = val);
    makeEditable(amt, val => expenses[idx].amount = parseFloat(val) || 0);
    row.appendChild(cat); row.appendChild(amt);
    row.appendChild(createDeleteButton(() => { expenses.splice(idx, 1); saveMonthData(); updateAll(); }));
    table.appendChild(row);
  });
}

function updateSavingsTable() {
  const table = document.getElementById("savings-table").querySelector("tbody");
  table.innerHTML = "";
  savings.forEach((s, idx) => {
    const row = document.createElement("tr");

    const goal = document.createElement("td");
    const tgt = document.createElement("td");
    const prg = document.createElement("td");
    const bar = document.createElement("td");

    goal.textContent = s.goal;
    tgt.textContent = s.target.toFixed(2);
    prg.textContent = s.progress.toFixed(2);

    makeEditable(goal, val => savings[idx].goal = val);
    makeEditable(tgt, val => savings[idx].target = parseFloat(val) || 0);
    makeEditable(prg, val => savings[idx].progress = parseFloat(val) || 0);

    const percent = Math.min((s.progress / s.target) * 100, 100);
    bar.innerHTML = `<progress value="${percent}" max="100"></progress>`;

    row.appendChild(goal);
    row.appendChild(tgt);
    row.appendChild(prg);
    row.appendChild(bar);
    row.appendChild(createDeleteButton(() => {
      savings.splice(idx, 1);
      saveMonthData();
      updateAll();
    }));

    table.appendChild(row);
  });
}
