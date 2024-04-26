const Ajv = require("ajv");
const ajv = new Ajv();

const projectDAO = require("../../DAO/projectDAO.js");
const userDAO = require("../../DAO/userDAO.js");
const { State } = require("../../hellpers/enumState.js");
const { validateDateTime } = require("../../hellpers/validateDatetime.js");
const { addFieldsToCreateProject, existingUsersInProject } = require("../../hellpers/projectFunctions.js");
const sendMail = require("../../hellpers/sendMail.js");

ajv.addFormat("date-time", { validate: validateDateTime });

const schema = {
    type: "object",
    properties: {
        name: { type: "string" },
        createdBy: { type: "string", minLength: 32, maxLength: 32 },
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
    required: [
        "name",
        "createdBy",
        "deadline",
        "estimate",
        "description",
        "userList",
    ],
    additionalProperties: false,
};

async function CreateAbl(req, res) {
    try {
        let project = req.body;
        let createdByName, assignedUserName;

        // validate input
        const valid = ajv.validate(schema, project);
        if (!valid) {
            res.status(400).json({
                code: "dtoInIsNotValid",
                note: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }

        project = addFieldsToCreateProject(req.body);

        project.createdAt = new Date().toISOString();

        const existingUsers = existingUsersInProject(project.userList);

        if (!existingUsers) {
            res.status(404).json({
                code: "usersNotFound",
                message: `User(s) ${notInUsers} not found`,
            });
            return;
        }

        project = projectDAO.create(project);

        if (project.createdBy === project.assigneeUser) {
            res.json(project);
        }

        createdByName = userDAO.get(project.createdBy).name;
        assignedUserName = userDAO.get(project.assigneeUser).name;
        assignedUserEmail = userDAO.get(project.assigneeUser).email;

        let sendReq = {
            sender: createdByName,
            recipient: assignedUserName,
            recipientMail: assignedUserEmail,
            projectId: project.id,
        };

        // TODO: for cyklus na poslani notifikace pro lidi pracujici na projektu
        sendMail(sendReq, "createProjectToAssignedUserNotfication");

        res.json(project);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = CreateAbl;
