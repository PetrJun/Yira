const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/task/createAbl");

router.post("/create", CreateAbl);

module.exports = router;