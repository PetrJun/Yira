const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

const taskController = require("./src/controller/task");
const userController = require("./src/controller/user");
const projectController = require("./src/controller/project");

app.use(express.json()); // podpora pro application/json
app.use(express.urlencoded({ extended: true })); // podpora pro application/x-www-form-urlencoded

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.use("/api/task", taskController);
app.use("/api/user", userController);
app.use("/api/project", projectController);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});