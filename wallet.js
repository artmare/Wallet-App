// Wallet App JS
let balance = 0;
const balanceEl = document.getElementById('balance');
const historyList = document.getElementById('history-list');

function updateBalance() {
    balanceEl.textContent = `$${balance.toFixed(2)}`;
}

function addHistory(type, amount, details = '') {
    const li = document.createElement('li');
    li.textContent = `${type}: $${amount.toFixed(2)} ${details}`;
    historyList.prepend(li);
}

document.getElementById('deposit-form').onsubmit = function(e) {
    e.preventDefault();
    const amount = parseFloat(this.elements[0].value);
    if (amount > 0) {
        balance += amount;
        updateBalance();
        addHistory('Deposit', amount);
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
        this.reset();
    } else {
        alert('Insufficient funds.');
    }
};

document.getElementById('send-form').onsubmit = function(e) {
    e.preventDefault();
    const recipient = this.elements[0].value.trim();
    const amount = parseFloat(this.elements[1].value);
    if (recipient && amount > 0 && amount <= balance) {
        balance -= amount;
        updateBalance();
        addHistory('Send', amount, `to ${recipient}`);
        this.reset();
    } else if (amount > balance) {
        alert('Insufficient funds.');
    }
};

updateBalance();
