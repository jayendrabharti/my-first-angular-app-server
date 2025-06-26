import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import usersRouter from './routes/auth.routes.js';
import todosRouter from './routes/todos.routes.js'

dotenv.config();

const app = express();
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.send(`This is your API`)
});

app.use("/auth", usersRouter);
app.use("/todos", todosRouter);

mongoose.connect("mongodb://127.0.0.1:27017/angular-db")
    .then(() => {
        console.log("Connected to database!");
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server is running on port 3000");
        });
    })
    .catch((e) => {
        console.log("Connection failed!");
        console.log(e);
    });