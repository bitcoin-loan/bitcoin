/* =========================================

   BITCOIN LOAN PLATFORM - FULL SCRIPT

   Author: ChatGPT

   ========================================= */


/* ---------- GLOBAL VARIABLES ---------- */

let btcPrice = 0;

const MAX_BORROW_BTC = 10;

const COLLATERAL_RATE = 0.05;

const COLLATERAL_WALLET = "1BitcoinPlatformWalletAddress123"; // Platform wallet

let verificationTimer = null;


/* =========================================

   INITIALIZATION

========================================= */

document.addEventListener("DOMContentLoaded", () => {

    initRegister();

    initLogin();

    initDashboard();

    initProfile();

    fetchBTCPrice();

});


/* =========================================

   HELPER FUNCTIONS

========================================= */

function getUsers() {

    return JSON.parse(localStorage.getItem("bitcoinUsers")) || [];

}


function saveUser(user) {

    const users = getUsers();

    users.push(user);

    localStorage.setItem("bitcoinUsers", JSON.stringify(users));

}


function getUserByEmail(email) {

    const users = getUsers();

    return users.find(u => u.email === email);

}


function startVerificationTimer(expiry, timerEl, onExpire) {

    clearInterval(verificationTimer);

    verificationTimer = setInterval(() => {

        const remaining = expiry - Date.now();

        if (remaining <= 0) {

            clearInterval(verificationTimer);

            timerEl.innerText = "⏰ Code expired. Please resend.";

            if (onExpire) onExpire();

            return;

        }

        const min = Math.floor(remaining / 60000);

        const sec = Math.floor((remaining % 60000) / 1000);

        timerEl.innerText = `Time remaining: ${min}:${sec < 10 ? "0" + sec : sec}`;

    }, 1000);

}


function displaySimulatedEmail(email, code) {

    const emailDiv = document.getElementById("simulatedEmail");

    if (!emailDiv) return;


    emailDiv.innerHTML = `

        <p>From: no-reply@bitcoinloan.com</p>

        <p>To: ${email}</p>

        <p>Subject: Verify your Bitcoin Loan Account</p>

        <hr>

        <p>Hello ${email.split("@")[0]},</p>

        <p>Use the following <strong>verification code</strong> to complete your registration:</p>

        <h2 style="color:#f7931a;">${code}</h2>

        <p>This code expires in <strong>5 minutes</strong>.</p>

        <p>Thank you,<br>Bitcoin Loan Team</p>

    `;

}


/* =========================================

   REGISTRATION

========================================= */

function initRegister() {

    const form = document.getElementById("registerForm");

    if (!form) return;


    const verificationSection = document.getElementById("emailVerificationSection");

    const timerEl = document.getElementById("timerText");

    const verifyBtn = document.getElementById("verifyEmailBtn");

    const resendBtn = document.getElementById("resendCodeBtn");

    const emailCodeInput = document.getElementById("emailCodeInput");


    let currentVerificationCode = "";

    let verificationExpiry = null;


    function generateVerificationCode(email) {

        currentVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        verificationExpiry = Date.now() + 5 * 60 * 1000;

        displaySimulatedEmail(email, currentVerificationCode);

        verificationSection.style.display = "block";

        form.querySelector("button[type='submit']").disabled = true;

        startVerificationTimer(verificationExpiry, timerEl, () => currentVerificationCode = "");

    }


    verifyBtn.addEventListener("click", () => {

        const enteredCode = emailCodeInput.value.trim();

        if (!currentVerificationCode) {

            alert("⏰ Code expired. Please resend.");

            return;

        }


        if (enteredCode === currentVerificationCode) {

            alert("✅ Email verified successfully!");

            form.querySelector("button[type='submit']").disabled = false;

            verificationSection.style.display = "none";

            currentVerificationCode = ""; // invalidate code

        } else {

            alert("❌ Incorrect code. Try again.");

        }

    });


    resendBtn.addEventListener("click", () => {

        const email = document.getElementById("regEmail").value.trim();

        if (!email) {

            alert("Enter your email to resend code.");

            return;

        }

        generateVerificationCode(email);

        alert("📧 Verification code resent!");

    });


    form.addEventListener("submit", (e) => {

        e.preventDefault();


        const fullName = document.getElementById("fullName").value.trim();

        const email = document.getElementById("regEmail").value.trim();

        const country = document.getElementById("country").value;

        const password = document.getElementById("regPassword").value;

        const confirmPassword = document.getElementById("confirmPassword").value;

        const btcWallet = document.getElementById("btcWallet").value.trim();


        // Validation

        if (!fullName || !email || !country || !password || !btcWallet) {

            alert("All fields are required.");

            return;

        }

        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;

        }

        if (password.length < 6) {

            alert("Password must be at least 6 characters.");

            return;

        }

        if (btcWallet.length < 26 || btcWallet.length > 42) {

            alert("Invalid Bitcoin wallet address.");

            return;

        }

        if (!verifyBtn.disabled && !currentVerificationCode) {

            alert("You must verify your email first.");

            return;

        }


        // Check for existing email

        if (getUserByEmail(email)) {

            alert("Email already registered.");

            return;

        }


        const user = {

            fullName,

            email,

            country,

            password,

            btcWallet,

            verified: true

        };


        saveUser(user);

        alert("Registration successful. You can now login.");

        window.location.href = "index.html"; // or "dashboard.html" if auto-login

        <p>Already have an account? <a href="index.html">Login here</a></p>

    });


    // Generate code on email blur

    const emailInput = document.getElementById("regEmail");

    emailInput.addEventListener("blur", () => {

        const email = emailInput.value.trim();

        if (email) generateVerificationCode(email);

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

        const email = document.getElementById("email").value.trim();

        const password = document.getElementById("password").value;


        const user = getUserByEmail(email);

        if (!user) {

            alert("No registered account found.");

            return;

        }


        if (!user.verified) {

            alert("Please verify your email before logging in.");

            return;

        }


        if (password !== user.password) {

            alert("Invalid credentials.");

            return;

        }


        localStorage.setItem("bitcoinSession", email);

        window.location.href = "dashboard.html";

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


    const platformQR = document.getElementById("platformWalletQR");

    if (platformQR) {

        QRCode.toCanvas(platformQR, COLLATERAL_WALLET, { width: 150 });

    }


    const userQRContainer = document.getElementById("userWalletQR");

    if (userQRContainer) {

        QRCode.toCanvas(userQRContainer, user.btcWallet, { width: 150 });

    }


    const maxBorrowUSD = document.getElementById("maxBorrowUSD");

    if (maxBorrowUSD && btcPrice > 0) {

        maxBorrowUSD.innerText = `Approx: $${(btcPrice * MAX_BORROW_BTC).toLocaleString()}`;

    }

}


/* =========================================

   PROFILE PAGE

========================================= */

function initProfile() {

    const sessionEmail = localStorage.getItem("bitcoinSession");

    if (!sessionEmail) return;


    const user = getUserByEmail(sessionEmail);

    if (!user) return;


    const badge = document.getElementById("verifiedBadge");

    if (badge) badge.style.display = user.verified ? "inline" : "none";


    const profileName = document.getElementById("profileName");

    const profileEmail = document.getElementById("profileEmail");

    const profileCountry = document.getElementById("profileCountry");

    const profileWallet = document.getElementById("profileWallet");


    if (profileName) profileName.innerText = user.fullName;

    if (profileEmail) profileEmail.innerText = user.email;

    if (profileCountry) profileCountry.innerText = user.country;

    if (profileWallet) profileWallet.innerText = user.btcWallet;


    const walletQRContainer = document.createElement("div");

    if (profileWallet && profileWallet.parentNode) {

        profileWallet.parentNode.appendChild(walletQRContainer);

        QRCode.toCanvas(walletQRContainer, profileWallet.innerText, { width: 100 });

    }


    // Load Loan History

    const historyEl = document.getElementById("profileLoanHistory");

    const allLoans = JSON.parse(localStorage.getItem("loanHistory")) || [];

    const userLoans = allLoans.filter(l => l.email === user.email); // user-specific


    if (historyEl) {

        if (userLoans.length === 0) historyEl.innerHTML = "<p>No loans yet.</p>";

        else {

            historyEl.innerHTML = "";

            userLoans.forEach(loan => {

                const div = document.createElement("div");

                div.style.background = "#0f172a";

                div.style.marginBottom = "10px";

                div.style.padding = "10px";

                div.style.borderRadius = "5px";

                div.innerHTML = `

                    <strong>Date:</strong> ${loan.date}<br>

                    <strong>BTC:</strong> ${loan.btcAmount} BTC<br>

                    <strong>USD:</strong> $${loan.usdValue.toLocaleString()}<br>

                    <strong>Collateral:</strong> $${loan.collateral.toLocaleString()}<br>

                    <strong>Status:</strong> ${loan.status}

                `;

                historyEl.appendChild(div);

            });

        }

    }

}


/* =========================================

   LOGOUT

========================================= */

function logout() {

    localStorage.removeItem("bitcoinSession");

    window.location.href = "index.html";

}


/* =========================================

   FETCH BTC PRICE

========================================= */

async function fetchBTCPrice() {

    try {

        const res = await fetch("https://api.coindesk.com/v1/bpi/currentprice/USD.json");

        const data = await res.json();

        btcPrice = data.bpi.USD.rate_float;


        const btcPriceEl = document.getElementById("btcPrice");

        if (btcPriceEl) btcPriceEl.innerText = `BTC Price: $${btcPrice.toLocaleString()}`;


        const maxBorrowUSD = document.getElementById("maxBorrowUSD");

        if (maxBorrowUSD) maxBorrowUSD.innerText = `Approx: $${(btcPrice * MAX_BORROW_BTC).toLocaleString()}`;

    } catch (err) {

        console.error("Error fetching BTC price:", err);

    }

}


/* =========================================

   LOAN CALCULATION

========================================= */

function calculateLoan() {

    const loanInput = document.getElementById("loanAmount");

    if (!loanInput || btcPrice === 0) return;


    const loanBTC = parseFloat(loanInput.value);

    if (!loanBTC || loanBTC <= 0) return alert("Enter a valid BTC amount.");

    if (loanBTC > MAX_BORROW_BTC) return alert(`Cannot borrow more than ${MAX_BORROW_BTC} BTC.`);


    const usdValue = loanBTC * btcPrice;

    const collateral = usdValue * COLLATERAL_RATE;


    document.getElementById("usdValue").innerText = `Loan Value (USD): $${usdValue.toLocaleString()}`;

    document.getElementById("collateralValue").innerText = `Required Collateral (5%): $${collateral.toLocaleString()}`;


    saveLoanRequest(loanBTC, usdValue, collateral);

}


function saveLoanRequest(btcAmount, usdValue, collateral) {

    const sessionEmail = localStorage.getItem("bitcoinSession");

    if (!sessionEmail) return;


    const loanData = {

        email: sessionEmail,

        date: new Date().toLocaleString(),

        btcAmount,

        usdValue,

        collateral,

        status: "Pending Collateral Deposit"

    };


    const allLoans = JSON.parse(localStorage.getItem("loanHistory")) || [];

    allLoans.push(loanData);

    localStorage.setItem("loanHistory", JSON.stringify(allLoans));

    displayLoanHistory();

}


function displayLoanHistory() {

    const container = document.getElementById("loanHistory");

    if (!container) return;


    const allLoans = JSON.parse(localStorage.getItem("loanHistory")) || [];

    if (allLoans.length === 0) {

        container.innerHTML = "<p>No loan history yet.</p>";

        return;

