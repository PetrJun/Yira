const userDao = require("../../DAO/userDAO.js");
const taskDao = require("../../DAO/taskDAO.js");


async function DeleteAbl(req, res) {
  try {
    const { id } = req.params;

    userDao.remove(id);

    res.json({});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = DeleteAbl;