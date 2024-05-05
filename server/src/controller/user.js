const express = require("express");
const router = express.Router();

const GetAbl = require("../abl/user/getAbl.js");
const ListAbl = require("../abl/user/listAbl.js");
const CreateAbl = require("../abl/user/createAbl.js");
const UpdateAbl = require("../abl/user/updateAbl.js");
const DeleteAbl = require("../abl/user/deleteAbl.js");


router.get("/get/:id", GetAbl);
router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.put("/update/:id", UpdateAbl);
router.delete("/delete/:id", DeleteAbl);

module.exports = router;