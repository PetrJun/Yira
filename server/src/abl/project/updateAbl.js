const Ajv = require("ajv");
const ajv = new Ajv();

const projectDAO = require("../../DAO/projectDAO.js");
const userDao = require("../../DAO/userDAO.js");
const { State } = require("../../hellpers/enumState.js");
const { validateDateTime } = require("../../hellpers/validateDatetime.js");
const sendMail = require("../../hellpers/sendMail.js");
const { existingUsersInProject } = require("../../hellpers/projectFunctions.js");

ajv.addFormat("date-time", { validate: validateDateTime });

const schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        assigneeUser: { type: "string", minLength: 32, maxLength: 32 },
        state: { type: "string", enum: Object.values(State) },
        deadline: { type: "string", format: "date-time" },
        estimate: { type: "number" },
        worked: { type: "number", default: 0 },
        description: { type: "string", maxLength: 500 },
        userList: {
            type: "array",
            items: { type: "string", minLength: 32, maxLength: 32 },
        },
    },
    additionalProperties: false,
};

async function UpdateAbl(req, res) {
    try {
        const { projectId, userId } = req.params;
        let project = req.body;
        let assignedUserName, assignedUserEmail, sendReq;

        // validate input
        const valid = ajv.validate(schema, project);
        if (!valid) {
            res.status(400).json({
                code: "dtoInIsNotValid",
                message: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }

        project.id = projectId;
        oldProject = projectDAO.get(project.id);

        console.log(oldProject.createdBy, userId)

        if(oldProject.createdBy !== userId) {
            res.status(400).json({ message: `User: ${userId} can't delete project` });
            return;
        }

        if(project.userList){
            const existingUsers = existingUsersInProject(project.userList);

            if (!existingUsers) {
                res.status(404).json({
                    code: "usersNotFound",
                    message: `User(s) ${notInUsers} not found`,
                });
                return;
            }
        }

        updatedProject = projectDAO.update(project)

        if (updatedProject.createdBy === updatedProject.assigneeUser) {
            res.json(updatedProject);
            return;
        }

        assignedUserName = userDao.get(oldProject.assigneeUser).name;
        assignedUserEmail = userDao.get(oldProject.assigneeUser).email;
        if (updatedProject.name !== oldProject.name) {

            sendReq = {
                recipient: assignedUserName,
                recipientMail: assignedUserEmail,
                projectId: oldProject.id,
                projectName: oldProject.name,
                projectNameNew: updatedProject.name
            };

            sendMail(sendReq, "updateProjectNameNotfication");
        } else {

            sendReq = {
                recipient: assignedUserName,
                recipientMail: assignedUserEmail,
                projectId: oldProject.id,
                projectName: oldProject.name
            };

            sendMail(sendReq, "updateProjectNotfication");
        }

        res.json(updatedProject);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = UpdateAbl;
