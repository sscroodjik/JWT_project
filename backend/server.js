require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { users } = require('./users');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;
const CACHE_FILE = path.join(__dirname, 'cache.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        cookie: { httpOnly: true, sameSite: 'lax' }
    })
);
app.use(express.static(path.join(__dirname, '../frontend')));

// Регистрация
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'User registered successfully' });
});

// Вход
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    req.session.user = username;
    res.json({ message: 'Login successful' });
});

// Профиль (защищённый маршрут)
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json({ message: `Welcome, ${req.session.user}!` });
});

// Выход
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logout successful' });
    });
});

// Кэшированные данные
app.get('/data', (req, res) => {
    if (!req.session.user) {
        return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const now = Date.now();
    let cache = {};
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
    
    if (cache.timestamp && now - cache.timestamp < 60000) {
        return res.json({ data: cache.data, cached: true });
    }
    
    const newData = { info: 'This is fresh data!', timestamp: now };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newData));
    res.json({ data: newData, cached: false });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});