const express = require("express");
const cors = require("cors");
const app = express();
const port = 8000;

const taskController = require("./src/controller/task");
const userController = require("./src/controller/user");

app.use(express.json()); // podpora pro application/json
app.use(express.urlencoded({ extended: true })); // podpora pro application/x-www-form-urlencoded

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.use("/task", taskController);
app.use("/user", userController);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});