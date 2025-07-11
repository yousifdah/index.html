// 🌙 Thema-wisselaar
const toggleButton = document.getElementById("toggle-theme");
toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// 💰 Bereken totaal saldo
function calculateBalance() {
  let income = 3000 + 500;       // Salaris + Freelance
  let expenses = 900 + 300;      // Huur + Boodschappen
  let savings = 400;             // Gespaard bedrag

  let balance = income - expenses + savings;

  const balanceElement = document.getElementById("balance");
  balanceElement.textContent = `Totaal beschikbaar saldo: €${balance}`;
}
calculateBalance();

// 📊 Budgetgrafiek met Chart.js
const ctx = document.getElementById("budget-chart").getContext("2d");

new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Inkomsten", "Uitgaven", "Gespaard"],
    datasets: [{
      data: [3500, 1200, 400],
      backgroundColor: ["#2a9d8f", "#e76f51", "#f4a261"],
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      },
      title: {
        display: true,
        text: "Budgetverdeling"
      }
    }
  }
});
