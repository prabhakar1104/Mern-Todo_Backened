require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const router = require("./routes/router");
const authRouter = require("./routes/authrouter");

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

mongoose.connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log("MongoDB connection error:", err));

app.use('/', authRouter);
app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});