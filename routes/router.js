const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo'); 
const verifyToken = require('../middleware'); 

router.get('/get', verifyToken, todoController.getAllTodos);
router.post('/add', verifyToken, todoController.addTodo);
router.delete('/delete/:id', verifyToken, todoController.deleteTodo);
router.put('/updateStatus/:id', verifyToken, todoController.updateTodoStatus);
router.put('/update/:id', verifyToken, todoController.updateTodo);

module.exports = router;