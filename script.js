/* =========================================
   BITCOIN LOAN PLATFORM - CLEAN VERSION
========================================= */

const MAX_BORROW_BTC = 10;
const COLLATERAL_RATE = 0.05;
const COLLATERAL_WALLET = "bc1qu9d6lv4rvkdkh34t8kk4ge0egc7r2m954tc2jq";

let btcPrice = 0;

/* =========================================
   INIT
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    initRegister();
    initLogin();
    protectPages();
    initDashboard();
    initProfile();
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
    return getUsers().find(u => u.email === email);
}

/* =========================================
   PAGE PROTECTION
========================================= */

function protectPages() {
    const session = localStorage.getItem("bitcoinSession");
    const currentPage = window.location.pathname;

    if ((currentPage.includes("dashboard") || currentPage.includes("profile")) && !session) {
        window.location.href = "login.html";
    }

    if (currentPage.includes("login") && session) {
        window.location.href = "dashboard.html";
    }
}
// ===============================
// PRODUCTION STABLE AUTH SYSTEM
// ===============================

// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please fill all fields");
            return;
        }

        const user = {
            email: email,
            password: password
        };

        localStorage.setItem("bitcoinUser", JSON.stringify(user));

        alert("Registration Successful! Please login.");
        window.location.href = "login.html";
    });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const emailInput = document.getElementById("email").value;
        const passwordInput = document.getElementById("password").value;

        const savedUser = JSON.parse(localStorage.getItem("bitcoinUser"));

        if (!savedUser) {
            alert("No account found. Please register.");
            return;
        }

        if (
            emailInput === savedUser.email &&
            passwordInput === savedUser.password
        ) {
            alert("Login Successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid Email or Password");
        }
    });
}
/* =========================================
   DASHBOARD
========================================= */

function initDashboard() {
    const sessionEmail = localStorage.getItem("bitcoinSession");
    if (!sessionEmail) return;

    const user = getUserByEmail(sessionEmail);
    if (!user) return;

    const welcomeEl = document.getElementById("welcomeUser");
    if (welcomeEl) welcomeEl.innerText = "Welcome, " + user.fullName;

    const walletEl = document.getElementById("userWallet");
    if (walletEl) walletEl.innerText = user.btcWallet;

    const platformWalletEl = document.getElementById("platformWallet");
    if (platformWalletEl) platformWalletEl.innerText = COLLATERAL_WALLET;

    displayLoanHistory();
}

/* =========================================
   PROFILE
========================================= */

function initProfile() {
    const sessionEmail = localStorage.getItem("bitcoinSession");
    if (!sessionEmail) return;

    const user = getUserByEmail(sessionEmail);
    if (!user) return;

    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value;
    };

    setText("profileName", user.fullName);
    setText("profileEmail", user.email);
    setText("profileCountry", user.country);
    setText("profileWallet", user.btcWallet);
}

// LOGOUT
function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
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
    if (!loanBTC || loanBTC <= 0)
        return alert("Enter valid BTC amount.");

    if (loanBTC > MAX_BORROW_BTC)
        return alert(`Max borrow is ${MAX_BORROW_BTC} BTC`);

    if (!btcPrice)
        return alert("BTC price not loaded yet.");

    const usdValue = loanBTC * btcPrice;
    const collateral = usdValue * COLLATERAL_RATE;

    document.getElementById("usdValue").innerText =
        `Loan Value: $${usdValue.toLocaleString()}`;

    document.getElementById("collateralValue").innerText =
        `Collateral (5%): $${collateral.toLocaleString()}`;

    saveLoanRequest(loanBTC, usdValue, collateral);
}

function saveLoanRequest(btcAmount, usdValue, collateral) {
    const email = localStorage.getItem("bitcoinSession");
    if (!email) return;

    const loan = {
        email,
        date: new Date().toLocaleString(),
        btcAmount,
        usdValue,
        collateral,
        status: "Pending"
    };

    const loans = JSON.parse(localStorage.getItem("loanHistory")) || [];
    loans.push(loan);
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
        div.style.background = "#0f172a";
        div.style.marginBottom = "10px";
        div.style.padding = "10px";
        div.style.borderRadius = "6px";

        div.innerHTML = `
            <strong>Date:</strong> ${loan.date}<br>
            <strong>BTC:</strong> ${loan.btcAmount} BTC<br>
            <strong>USD:</strong> $${loan.usdValue.toLocaleString()}<br>
            <strong>Collateral:</strong> $${loan.collateral.toLocaleString()}<br>
            <strong>Status:</strong> ${loan.status}
        `;

        container.appendChild(div);
    });
}
