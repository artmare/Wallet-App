// Wallet App JS with Auth and User Storage
let balance = 0;
let currentUser = null;
let users = [];
const balanceEl = document.getElementById('balance');
const historyList = document.getElementById('history-list');
const walletContainer = document.querySelector('.wallet-container');
const authModal = document.getElementById('auth-modal');
const cardOwner = document.getElementById('card-owner');

// Auth modal elements
const authTitle = document.getElementById('auth-title');
const authChoice = document.getElementById('auth-choice');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const toRegister = document.getElementById('to-register');
const toLogin = document.getElementById('to-login');
const authError = document.getElementById('auth-error');

// Load users from users.json (simulate server)
async function loadUsers() {
    try {
        const res = await fetch('users.json');
        const data = await res.json();
        users = data.users || [];
    } catch (e) {
        users = [];
    }
}

// Save users to users.json (simulate server, only works locally with server)
async function saveUsers() {
    // Browsers can't write to files directly; this is a placeholder for real backend
    // For demo, we store in localStorage as fallback
    localStorage.setItem('wallet-users', JSON.stringify(users));
}

function loadUsersFromLocal() {
    const local = localStorage.getItem('wallet-users');
    if (local) {
        try {
            users = JSON.parse(local);
        } catch (e) { users = []; }
    }
}

function updateBalance() {
    balanceEl.textContent = `$${balance.toFixed(2)}`;
}

function addHistory(type, amount, details = '') {
    const li = document.createElement('li');
    li.textContent = `${type}: $${amount.toFixed(2)} ${details}`;
    historyList.prepend(li);
}

function showWalletUI() {
    authModal.style.display = 'none';
    walletContainer.style.display = '';
    cardOwner.textContent = currentUser.username;
    updateBalance();
    historyList.innerHTML = '';
    (currentUser.history || []).forEach(h => {
        addHistory(h.type, h.amount, h.details);
    });
}

function showAuthModal() {
    authModal.style.display = '';
    walletContainer.style.display = 'none';
}

function setAuthError(msg) {
    authError.textContent = msg;
}

function clearAuthError() {
    authError.textContent = '';
}

function registerUser(username, password) {
    if (users.find(u => u.username === username)) {
        setAuthError('Username already exists.');
        return false;
    }
    const user = { username, password, balance: 0, history: [] };
    users.push(user);
    saveUsers();
    return true;
}

function loginUser(username, password) {
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        setAuthError('Invalid username or password.');
        return false;
    }
    currentUser = user;
    balance = user.balance;
    return true;
}

function updateUserData() {
    if (!currentUser) return;
    currentUser.balance = balance;
    // Save history
    currentUser.history = [];
    historyList.querySelectorAll('li').forEach(li => {
        // Parse li.textContent for type, amount, details
        const m = li.textContent.match(/^(Deposit|Withdraw|Send): \$(\d+\.\d{2}) ?(.*)$/);
        if (m) {
            currentUser.history.push({ type: m[1], amount: parseFloat(m[2]), details: m[3] });
        }
    });
    saveUsers();
}

// Auth modal logic
showLoginBtn.onclick = () => {
    authTitle.textContent = 'Login';
    authChoice.style.display = 'none';
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    clearAuthError();
};
showRegisterBtn.onclick = () => {
    authTitle.textContent = 'Register';
    authChoice.style.display = 'none';
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    clearAuthError();
};
toRegister.onclick = (e) => {
    e.preventDefault();
    showRegisterBtn.onclick();
};
toLogin.onclick = (e) => {
    e.preventDefault();
    showLoginBtn.onclick();
};

loginForm.onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (loginUser(username, password)) {
        showWalletUI();
        clearAuthError();
    }
};

registerForm.onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    if (username.length < 3 || password.length < 3) {
        setAuthError('Username and password must be at least 3 characters.');
        return;
    }
    if (registerUser(username, password)) {
        clearAuthError();
        loginUser(username, password);
        showWalletUI();
    }
};

// Wallet logic
document.getElementById('deposit-form').onsubmit = function(e) {
    e.preventDefault();
    const amount = parseFloat(this.elements[0].value);
    if (amount > 0) {
        balance += amount;
        updateBalance();
        addHistory('Deposit', amount);
        updateUserData();
        this.reset();
    }
};

document.getElementById('withdraw-form').onsubmit = function(e) {
    e.preventDefault();
    const amount = parseFloat(this.elements[0].value);
    if (amount > 0 && amount <= balance) {
        balance -= amount;
        updateBalance();
        addHistory('Withdraw', amount);
        updateUserData();
        this.reset();
    } else {
        alert('Insufficient funds.');
    }
};

document.getElementById('send-form').onsubmit = function(e) {
    e.preventDefault();
    const recipient = this.elements[0].value.trim();
    const amount = parseFloat(this.elements[1].value);
    if (!recipient || recipient === currentUser.username) {
        alert('Enter a valid recipient username.');
        return;
    }
    const recipientUser = users.find(u => u.username === recipient);
    if (!recipientUser) {
        alert('Recipient not found.');
        return;
    }
    if (amount > 0 && amount <= balance) {
        balance -= amount;
        updateBalance();
        addHistory('Send', amount, `to ${recipient}`);
        // Add to recipient's history and balance
        recipientUser.balance += amount;
        if (!recipientUser.history) recipientUser.history = [];
        recipientUser.history.unshift({ type: 'Receive', amount, details: `from ${currentUser.username}` });
        updateUserData();
        saveUsers();
        this.reset();
    } else if (amount > balance) {
        alert('Insufficient funds.');
    }
};

// On load: try to load users from localStorage, then from users.json
window.addEventListener('DOMContentLoaded', async () => {
    loadUsersFromLocal();
    if (users.length === 0) {
        await loadUsers();
    }
    showAuthModal();
});
