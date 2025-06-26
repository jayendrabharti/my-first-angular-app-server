import Todos from '../models/todos.model.js';

export const getTodos = async (req, res) => {
    try {
        const todos = await Todos.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(todos);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch todos', details: err.message });
    }
};

export const createTodo = async (req, res) => {
    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const todo = new Todos({
            title,
            description,
            userId: req.user.id,
        });

        await todo.save();
        res.status(201).json(todo);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create todo', details: err.message });
    }
};

export const updateTodo = async (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    try {
        const todo = await Todos.findOne({ _id: id, userId: req.user.id });

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        if (title !== undefined) todo.title = title;
        if (description !== undefined) todo.description = description;
        if (completed !== undefined) todo.completed = completed;

        await todo.save();
        res.status(200).json(todo);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update todo', details: err.message });
    }
};

export const deleteTodo = async (req, res) => {
    const { id } = req.params;

    try {
        const todo = await Todos.findOneAndDelete({ _id: id, userId: req.user.id });

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found or unauthorized' });
        }

        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete todo', details: err.message });
    }
};
