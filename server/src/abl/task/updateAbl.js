const Ajv = require("ajv");
const ajv = new Ajv();

const taskDAO = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const { State } = require("../../hellpers/enumState.js");
const { validateDateTime } = require("../../hellpers/validateDatetime.js");
const sendMail = require("../../hellpers/sendMail.js");

ajv.addFormat("date-time", { validate: validateDateTime });

const schema = {
    type: "object",
    properties: {
        projectId: { type: "string", minLength: 32, maxLength: 32 },
        name: { type: "string" },
        assigneeUser: { type: "string", minLength: 32, maxLength: 32 },
        state: { type: "string", enum: Object.values(State) },
        deadline: { type: "string", format: "date-time" },
        estimate: { type: "number" },
        worked: { type: "number", default: 0 },
        description: { type: "string", maxLength: 500 },
    },
    additionalProperties: false,
};

async function UpdateAbl(req, res) {
    try {
        const { id } = req.params;
        let task = req.body;
        let assignedUserName, assignedUserEmail, sendReq;

        // validate input
        const valid = ajv.validate(schema, task);
        if (!valid) {
            res.status(400).json({
                code: "dtoInIsNotValid",
                message: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }

        task.id = id;
        oldTask = taskDAO.get(task.id);
        updatedTask = taskDAO.update(task)

        if (updatedTask.createdBy === updatedTask.assigneeUser) {
            res.json(updatedTask);
            return;
        }

        assignedUserName = userDao.get(oldTask.assigneeUser).name;
        assignedUserEmail = userDao.get(oldTask.assigneeUser).email;

        if (updatedTask.name !== oldTask.name) {
            sendReq = {
                recipient: assignedUserName,
                recipientMail: assignedUserEmail,
                taskId: oldTask.id,
                taskName: oldTask.name,
                taskNameNew: updatedTask.name
            };

            sendMail(sendReq, "updateTaskNameNotfication");
        } else {
            sendReq = {
                recipient: assignedUserName,
                recipientMail: assignedUserEmail,
                taskId: oldTask.id,
                taskName: oldTask.name
            };

            sendMail(sendReq, "updateTaskNotfication");
        }

        res.json(updatedTask);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = UpdateAbl;
