const projectDAO = require("../../DAO/projectDAO.js");


async function GetAbl(req, res) {
  try {
    const { id } = req.params;

    const project = projectDAO.get(id);

    res.json(project);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = GetAbl;