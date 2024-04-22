const Ajv = require("ajv");
const ajv = new Ajv();

const taskDAO = require("../../DAO/taskDAO.js");
const { State } = require("../../hellpers/enumState.js");
const { validateDateTime } = require("../../hellpers/validateDatetime.js");
const addFieldsToCreateTask = require("../../hellpers/taskFunctions.js");
const sendMail = require("../../hellpers/sendMail.js");

ajv.addFormat("date-time", { validate: validateDateTime });

const schema = {
    type: "object",
    properties: {
        projectId: { type: "string" },
        name: { type: "string" },
        createdBy: { type: "string" },
        assigneeUser: { type: "string" },
        state: { type: "string", enum: Object.values(State) },
        deadline: { type: "string", format: "date-time" },
        estimate: { type: "number" },
        worked: { type: "number", default: 0 },
        description: { type: "string", maxLength: 500 },
        userList: {type: "array", items: { type: "string" } }
    },
    required: ["projectId", "name", "createdBy", "estimate", "description", "userList"],
    additionalProperties: false,
};

async function CreateAbl(req, res) {
    try {
        let task = req.body;
        
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
        
        task = addFieldsToCreateTask(req.body)

        task.createdAt = new Date().toISOString();

        task = taskDAO.create(task);

        let sendReq = {
            recipient: "Adam",
            sender: "Krystof",
            taskId: 123
        }

        sendMail(sendReq, "createTaskNotfication")

        res.json(task);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = CreateAbl;
