const projectDAO = require("../../DAO/projectDAO.js");

async function GetAbl(req, res) {
    try {
        const { id } = req.params;

        const project = projectDAO.get(id);

        if (project === null) {
            res.status(404).json({
                code: "projectNotFound",
                message: `Project ${id} not found`,
            });
            return;
        }

        res.json(project);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = GetAbl;
