const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/project/createAbl");
const DeleteAbl = require("../abl/project/deleteAbl");
const GetAbl = require("../abl/project/getAbl");
const UpdateAbl = require("../abl/project/updateAbl");
const GetAllTasksAndProjectsOnUserAbl = require("../abl/project/getAllTasksAndProjectsOnUser");

router.post("/create", CreateAbl);
router.delete("/delete/:projectId/:userId", DeleteAbl);
router.get("/get/:id", GetAbl);
router.get("/getAllTasksAndProjectsOnUser/:userId", GetAllTasksAndProjectsOnUserAbl);
router.put("/update/:projectId/:userId", UpdateAbl);

module.exports = router;