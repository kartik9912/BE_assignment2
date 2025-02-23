const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

console.log("Starting server...");

app.use((req, res, next) => {
    console.log("Request received:", req.method, req.url);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const filePath = path.join(__dirname, 'tasks.json');

const getTasks = () => {
    let data;
    try {
        data = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        console.log("Error reading tasks.json, returning empty list.");
        return [];
    }
    return JSON.parse(data);
};

const saveTasks = (tasks) => {
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf8');
};

app.get('/tasks', (req, res) => {
    console.log("Fetching all tasks...");
    let allTasks = getTasks();
    res.render('tasks', { tasks: allTasks });
});

app.get('/task', (req, res) => {
    let allTasks = getTasks();
    let taskId = parseInt(req.query.id);
    
    let task = allTasks.find(t => t.id === taskId);
    
    if (!task) {
        console.log(`Task with ID ${taskId} not found.`);
        return res.status(404).send('Task not found');
    }
    
    res.render('task', { task: task });
});

app.get('/add-task', (req, res) => {
    res.render('addTask');
});

app.post('/add-task', (req, res) => {
    console.log("Adding new task...");
    
    let allTasks = getTasks();
    
    let newTask = {
        id: allTasks.length ? allTasks[allTasks.length - 1].id + 1 : 1,
        title: req.body.title || "Untitled Task",
        description: req.body.description || "No description provided"
    };

    allTasks.push(newTask);
    saveTasks(allTasks);

    console.log("New task added:", newTask);
    
    res.redirect('/tasks');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
