const userDao = require("../../DAO/userDAO.js");

async function ListAbl(req, res) {
    try {
        // uses list DAO method to list users
        const userList = userDao.list();
        res.json(userList);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = ListAbl;
