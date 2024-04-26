const Ajv = require("ajv");
const ajv = new Ajv();

const taskDAO = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const { State } = require("../../hellpers/enumState.js");
const { validateDateTime } = require("../../hellpers/validateDatetime.js");
const addFieldsToCreateTask = require("../../hellpers/taskFunctions.js");
const sendMail = require("../../hellpers/sendMail.js");

ajv.addFormat("date-time", { validate: validateDateTime });

const schema = {
    type: "object",
    properties: {
        projectId: { type: "string", minLength: 32, maxLength: 32 },
        name: { type: "string" },
        createdBy: { type: "string", minLength: 32, maxLength: 32 },
        assigneeUser: { type: "string", minLength: 32, maxLength: 32 },
        state: { type: "string", enum: Object.values(State) },
        deadline: { type: "string", format: "date-time" },
        estimate: { type: "number" },
        worked: { type: "number", default: 0 },
        description: { type: "string", maxLength: 500 },
    },
    required: [
        "projectId",
        "name",
        "deadline",
        "createdBy",
        "estimate",
        "description",
        "userList",
    ],
    additionalProperties: false,
};

async function CreateAbl(req, res) {
    try {
        let task = req.body;
        let createdByName, assignedUserName;

        // validate input
        const valid = ajv.validate(schema, task);
        if (!valid) {
            res.status(400).json({
                code: "dtoInIsNotValid",
                note: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }

        task = addFieldsToCreateTask(task);

        task.createdAt = new Date().toISOString();

        task = taskDAO.create(task);

        if (task.createdBy === task.assigneeUser) {
            res.json(task);
            return;
        }

        createdByName = userDao.get(task.createdBy).name;
        assignedUserName = userDao.get(task.assigneeUser).name;
        assignedUserEmail = userDao.get(task.assigneeUser).email;

        let sendReq = {
            sender: createdByName,
            recipient: assignedUserName,
            recipientMail: assignedUserEmail,
            taskId: task.id,
        };

        sendMail(sendReq, "createTaskNotfication");

        res.json(task);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = CreateAbl;
