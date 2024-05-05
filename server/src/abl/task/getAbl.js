const taskDAO = require("../../DAO/taskDAO.js");

async function GetAbl(req, res) {
    try {
        const { id } = req.params;

        const task = taskDAO.get(id);

        if (task === null) {
            res.status(404).json({
                code: "taskNotFound",
                message: `Task ${id} not found`,
            });
            return;
        }

        res.json(task);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = GetAbl;
