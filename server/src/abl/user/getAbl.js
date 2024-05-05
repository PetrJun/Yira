const userDao = require("../../DAO/userDAO.js");

async function GetAbl(req, res) {
    try {
        const { id } = req.params;

        const user = userDao.get(id);

        if (user === null) {
            res.status(404).json({
                code: "userNotFound",
                message: `User ${id} not found`,
            });
            return;
        }

        res.json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = GetAbl;
