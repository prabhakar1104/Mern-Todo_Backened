const todoModel = require("../models/todoSchema");

const todoController = {
    getAllTodos: (req, res) => {
        todoModel.find({ user: req.userId })
            .then(result => res.json(result))
            .catch(err => res.json(err))
    },

    addTodo: (req, res) => {
        const task = req.body.task;
        todoModel.create({
            task: task,
            user: req.userId
        })
        .then(result => res.json(result))
        .catch(err => res.json(err))
    },

    deleteTodo: (req, res) => {
        const { id } = req.params;
        todoModel.findOneAndDelete({ _id: id, user: req.userId })
            .then(() => res.json({ message: "Task deleted" }))
            .catch(err => res.status(500).json(err));
    },

    updateTodoStatus: (req, res) => {
        const { id } = req.params;
        todoModel.findOne({ _id: id, user: req.userId })
            .then(todo => {
                if (!todo) {
                    return res.status(404).json({ message: "Todo not found" });
                }
                todo.completed = !todo.completed;
                return todo.save();
            })
            .then(result => res.json(result))
            .catch(err => res.status(500).json(err));
    },

    updateTodo: (req, res) => {
        const { id } = req.params;
        const { task } = req.body;
        
        todoModel.findOneAndUpdate(
            { _id: id, user: req.userId },
            { task: task },
            { new: true }
        )
        .then(result => {
            if (!result) {
                return res.status(404).json({ message: "Todo not found" });
            }
            res.json(result);
        })
        .catch(err => res.status(500).json(err));
    }
};

module.exports = todoController;