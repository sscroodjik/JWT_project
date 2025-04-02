async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    alert((await response.json()).message);
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
        alert('Login successful!');
        window.location.href = 'profile.html';
    } else {
        alert(result.message);
    }
}

async function getProfile() {
    const response = await fetch('/profile');
    const result = await response.json();

    if (response.ok) {
        document.getElementById('profile-message').innerText = result.message;
    } else {
        window.location.href = 'index.html';
    }
}

async function logout() {
    await fetch('/logout', { method: 'POST' });
    window.location.href = 'index.html';
}

async function getData() {
    const response = await fetch('/data');
    const result = await response.json();

    if (response.ok) {
        document.getElementById('data-message').innerText = JSON.stringify(result.data);
    } else {
        alert(result.message);
    }
}
