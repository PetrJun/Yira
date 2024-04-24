const userDao = require("../../DAO/userDAO.js");


async function GetAbl(req, res) {
  try {
    const { id } = req.params;

    const user = userDao.get(id);

    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = GetAbl;