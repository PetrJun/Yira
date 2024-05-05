const userDao = require("../../DAO/userDAO.js");

async function DeleteAbl(req, res) {
    try {
        const { id } = req.params;

        // uses remove DAO method to remove user
        userDao.remove(id);

        res.json({});
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = DeleteAbl;
