const { db } = require("../config/dbConfig");

// POST /api/tasks
async function createTask(req, res) {
    const { name, priority, dueDate } = req.body;
    if (!name || !priority || !dueDate){
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
        const [userDetails] = await db.query("SELECT id FROM users WHERE email = ?", [req.user.email]);

        await db.query("INSERT INTO tasks(name, priority, due_date, user_id) VALUES (?, ?, ?, ?)", [name, priority, dueDate, userDetails[0].id]);

        return res.status(200).json({ success: true, message: "Task created successfully" });

    } catch (err) {
        console.error("Error in createTask:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// GET /api/tasks
async function readTask(req, res) {
    try {
        const [userDetails] = await db.query("SELECT id FROM users WHERE email = ?", [req.user.email]);

        const [taskDetails] = await db.query(
            `SELECT * FROM tasks WHERE user_id = ? ORDER BY FIELD(priority, 'high', 'medium', 'low'), due_date ASC`,
            [userDetails[0].id]
          );
          
        const tasksData = taskDetails.map(task => ({
            id: task.id,
            name: task.name,
            priority: task.priority.toUpperCase(),
            status: task.status,
            dueDate: new Date(task.due_date).toISOString().slice(0, 10)
        }));

        res.status(200).json({ success: true, tasks: tasksData });

    } catch (err) {
        console.error("Error reading tasks:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// PUT /api/tasks/:id
async function updateTask(req, res) {
    const { status } = req.body;
    const { id: taskId } = req.params;
    if (!status){
        return res.status(400).json({ success: false, message: "Missing status" });
    }
    try {
        await db.query("UPDATE tasks SET status = ? WHERE id = ?", [status, taskId]);

        return res.status(200).json({ success: true, message: "Task updated successfully" });

    } catch (err) {
        console.error("Error in updateTask:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
    const { id: taskId } = req.params;
    try {
        await db.query("DELETE FROM tasks WHERE id = ?", [taskId]);

        return res.status(200).json({ success: true, message: "Task deleted successfully" });

    } catch (err) {
        console.error("Error in deleteTask:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
    
}

module.exports = { createTask, readTask, updateTask, deleteTask }; 
