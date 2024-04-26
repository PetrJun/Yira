const express = require("express");
const router = express.Router();

const CreateAbl = require("../abl/task/createAbl");
const DeleteAbl = require("../abl/task/deleteAbl");
const GetAbl = require("../abl/task/getAbl");
const UpdateAbl = require("../abl/task/updateAbl");
const UpdateAssigneeUserAbl = require("../abl/task/updateassigneeUserAbl");

router.post("/create", CreateAbl);
router.delete("/delete/:id", DeleteAbl);
router.get("/get/:id", GetAbl);
router.put("/update/:id", UpdateAbl);
router.patch("/updateAssigneeUser/:taskId/:userId", UpdateAssigneeUserAbl);

module.exports = router;