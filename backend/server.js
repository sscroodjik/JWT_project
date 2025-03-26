require('dotenv').config(); // Загрузка переменных окружения
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const { users } = require('./users');
const { authenticateToken } = require('./middleware');

const app = express();

// Загрузка переменных из .env
const PORT = process.env.PORT || 3000; // Если PORT не задан, используется 3000
const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    console.error('SECRET_KEY is not defined in .env file');
    process.exit(1); // Остановка сервера, если ключ отсутствует
}

// Middleware для обработки JSON
app.use(express.json());

// Служба статических файлов (фронтенд)
app.use(express.static(path.join(__dirname, '../frontend')));

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (users.find(user => user.username === username)) {
        return res.status(409).json({ message: 'User already exists' });
    }

    users.push({ username, password });
    res.status(201).json({ message: 'User registered successfully' });
});

// Вход в систему
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Защищенный маршрут
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Welcome to the protected route, ${req.user.username}!` });
});

// Открытие главной страницы при доступе к корневому пути
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});