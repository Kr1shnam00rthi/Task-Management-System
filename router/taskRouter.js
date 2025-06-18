const express = require("express");
const taskRouter = express.Router();
const taskController = require("../controller/taskController");
const { checkSessionAccess } = require("../middleware/auth");

taskRouter.post('/tasks', checkSessionAccess, taskController.createTask);
taskRouter.get('/tasks', checkSessionAccess, taskController.readTask);
taskRouter.put('/tasks/:id', checkSessionAccess, taskController.updateTask);
taskRouter.delete('/tasks/:id', checkSessionAccess, taskController.deleteTask);

module.exports = taskRouter;