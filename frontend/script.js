let token = null;

async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    alert(result.message);
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (response.ok) {
        token = result.token;
        alert('Login successful!');
    } else {
        alert(result.message);
    }
}

async function getProtectedData() {
    if (!token) {
        alert('You need to login first!');
        return;
    }

    const response = await fetch('/protected', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();
    if (response.ok) {
        // Отображаем защищенные данные
        document.getElementById('protected-message').innerText = result.message;

        // Отображаем JWT-токен
        document.getElementById('jwt-token').innerText = token;
    } else {
        alert(result.message);
    }
}