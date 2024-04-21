//načtení modulu express
const express = require("express");
const TaskDao = require('./src/DAO/taskDAO');

//inicializace nového Express.js serveru
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//definování portu, na kterém má aplikace běžet na localhostu
const port = 3000;

//jednoduchá definice routy s HTTP metodou GET, která pouze navrací text
app.get("/helloworld", (req, res) => {
  res.send('Hello World!!')
});

app.get("/addTask", async (req, res) => {
    try {
        TaskDao.addTask({id: 2, name: "Cau"}).then(task => {
            // Handle the retrieved task
          }).catch(error => {
            // Handle errors
          });
    } catch (e) {
        if (e.code == "DUPLICATE_CODE") {
            res.status(400);
        } else {
            res.status(500);
        }
        return res.json({error: e.message});
    }
    res.send("x");
})

app.get("/getTask/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    try {
        const task = await TaskDao.getTask(taskId);
        if (task) {
            res.json(task); // Return the task as JSON
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (e) {
        if (e.code == "DUPLICATE_CODE") {
            res.status(400);
        } else {
            res.status(500);
        }
        return res.json({error: e.message});
    }
})

//nastavení portu, na kterém má běžet HTTP server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});