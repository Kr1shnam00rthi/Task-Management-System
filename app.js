const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRouter = require('./router/authRouter');
const taskRouter = require('./router/taskRouter');
require('dotenv').config();

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/api/auth', authRouter);
app.use('/api/', taskRouter);

app.listen(SERVER_PORT, () => {
    console.log("Server is running");
});
