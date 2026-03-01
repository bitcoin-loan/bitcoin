/* =========================================
   BITCOIN LOAN PLATFORM - STABLE VERSION
========================================= */

const MAX_BORROW_BTC = 10;
const COLLATERAL_RATE = 0.05;

let btcPrice = 0;

/* =========================================
   INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    protectPages();
    initRegister();
    initLogin();
    initProfile();
    initDashboard();
    fetchBTCPrice();
});

/* =========================================
   STORAGE HELPERS
========================================= */

function getUsers() {
    return JSON.parse(localStorage.getItem("bitcoinUsers")) || [];
}

function saveUsers(users) {
    localStorage.setItem("bitcoinUsers", JSON.stringify(users));
}

function getUserByEmail(email) {
    return getUsers().find(user => user.email === email);
}

/* =========================================
   PAGE PROTECTION
========================================= */

function protectPages() {
    const session = localStorage.getItem("bitcoinSession");
    const path = window.location.pathname;

    if ((path.includes("dashboard") || path.includes("profile")) && !session) {
        window.location.href = "login.html";
    }

    if (path.includes("login") && session) {
        window.location.href = "dashboard.html";
    }
}

/* =========================================
   REGISTER
========================================= */

function initRegister() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const fullName = document.getElementById("fullName")?.value.trim();
        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value.trim();
        const country = document.getElementById("country")?.value.trim();
        const btcWallet = document.getElementById("btcWallet")?.value.trim();

        if (!email || !password) {
            alert("Please fill required fields.");
            return;
        }

        const users = getUsers();

        if (users.some(u => u.email === email)) {
            alert("Email already registered.");
            return;
        }

        users.push({
            fullName,
            email,
            password,
            country,
            btcWallet
        });

        saveUsers(users);

        alert("Registration successful!");
        window.location.href = "login.html";
    });
}

/* =========================================
   LOGIN
========================================= */

function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email")?.value.trim();
        const password = document.getElementById("password")?.value.trim();

        const user = getUserByEmail(email);

        if (!user) {
            alert("No account found.");
            return;
        }

        if (user.password !== password) {
            alert("Invalid password.");
            return;
        }

        localStorage.setItem("bitcoinSession", user.email);

        alert("Login successful!");
        window.location.href = "dashboard.html";
    });
}

/* =========================================
   PROFILE
========================================= */

function initProfile() {
    const session = localStorage.getItem("bitcoinSession");
    if (!session) return;

    const user = getUserByEmail(session);
    if (!user) return;

    setText("profileName", user.fullName);
    setText("profileEmail", user.email);
    setText("profileCountry", user.country);
    setText("profileWallet", user.btcWallet);
}

function logout() {
    localStorage.removeItem("bitcoinSession");
    window.location.href = "login.html";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "";
}

/* =========================================
   DASHBOARD
========================================= */

function initDashboard() {
    const session = localStorage.getItem("bitcoinSession");
    if (!session) return;

    const user = getUserByEmail(session);
    if (!user) return;

    setText("welcomeUser", user.fullName || user.email);

    displayLoanHistory();
}

/* =========================================
   BTC PRICE
========================================= */

async function fetchBTCPrice() {
    const priceEl = document.getElementById("btcPrice");
    if (!priceEl) return;

    try {
        const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice/USD.json");
        const data = await res.json();
        btcPrice = data.bpi.USD.rate_float;
        priceEl.innerText = `BTC Price: $${btcPrice.toLocaleString()}`;
    } catch {
        priceEl.innerText = "BTC Price unavailable";
    }
}

/* =========================================
   LOAN SYSTEM
========================================= */

function calculateLoan() {
    const input = document.getElementById("loanAmount");
    if (!input) return;

    const loanBTC = parseFloat(input.value);

    if (!loanBTC || loanBTC <= 0) {
        alert("Enter valid BTC amount.");
        return;
    }

    if (loanBTC > MAX_BORROW_BTC) {
        alert(`Maximum borrow is ${MAX_BORROW_BTC} BTC.`);
        return;
    }

    if (!btcPrice) {
        alert("BTC price not loaded yet.");
        return;
    }

    const usdValue = loanBTC * btcPrice;
    const collateral = usdValue * COLLATERAL_RATE;

    setText("usdValue", `Loan Value: $${usdValue.toLocaleString()}`);
    setText("collateralValue", `Collateral (5%): $${collateral.toLocaleString()}`);

    saveLoan(loanBTC, usdValue, collateral);
}

function saveLoan(btcAmount, usdValue, collateral) {
    const email = localStorage.getItem("bitcoinSession");
    if (!email) return;

    const loans = JSON.parse(localStorage.getItem("loanHistory")) || [];

    loans.push({
        email,
        date: new Date().toLocaleString(),
        btcAmount,
        usdValue,
        collateral,
        status: "Pending"
    });

    localStorage.setItem("loanHistory", JSON.stringify(loans));

    displayLoanHistory();
}

function displayLoanHistory() {
    const container = document.getElementById("loanHistory");
    if (!container) return;

    const email = localStorage.getItem("bitcoinSession");
    const loans = JSON.parse(localStorage.getItem("loanHistory")) || [];

    const userLoans = loans.filter(l => l.email === email);

    if (userLoans.length === 0) {
        container.innerHTML = "<p>No loan history yet.</p>";
        return;
    }

    container.innerHTML = "";

    userLoans.forEach(loan => {
        const div = document.createElement("div");
        div.style.background = "#111827";
        div.style.padding = "12px";
        div.style.marginBottom = "10px";
        div.style.borderRadius = "8px";

        div.innerHTML = `
            <strong>Date:</strong> ${loan.date}<br>
            <strong>BTC:</strong> ${loan.btcAmount} BTC<br>
            <strong>USD:</strong> $${(loan.usdValue || 0).toLocaleString()}<br>
            <strong>Collateral:</strong> $${(loan.collateral || 0).toLocaleString()}<br>
            <strong>Status:</strong> ${loan.status}
        `;

        container.appendChild(div);
    });
}
