const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/project/createAbl");
const DeleteAbl = require("../abl/project/deleteAbl");
const GetAbl = require("../abl/project/getAbl");
const UpdateAbl = require("../abl/project/updateAbl");
const UpdateAssigneeUserAbl = require("../abl/project/updateAssigneeUserAbl");
const GetTasksAndProjectsOnUserAbl = require("../abl/project/getTasksAndProjectsOnUser");

router.post("/create", CreateAbl);
router.delete("/delete/:projectId/:userId", DeleteAbl);
router.get("/get/:id", GetAbl);
router.get("/getTasksAndProjectsOnUser/:userId", GetTasksAndProjectsOnUserAbl);
router.put("/update/:projectId/:userId", UpdateAbl);
router.patch("/updateAssigneeUser/:projectId/:assigneeId/:userId", UpdateAssigneeUserAbl);

module.exports = router;