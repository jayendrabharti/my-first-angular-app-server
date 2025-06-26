import express from 'express';
import validToken from '../middlewares/authMiddleware.js';
import {
    getTodos,
    createTodo,
    deleteTodo,
    updateTodo,
} from '../controllers/todos.controllers.js';

const router = express.Router();

router.get('/', validToken, getTodos);
router.post('/', validToken, createTodo);
router.put('/:id', validToken, updateTodo);
router.delete('/:id', validToken, deleteTodo);

export default router;
