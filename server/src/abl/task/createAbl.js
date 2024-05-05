const Ajv = require("ajv");
const ajv = new Ajv();

const taskDAO = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const { State } = require("../../hellpers/enumState.js");
const { validateDateTime } = require("../../hellpers/validateDatetime.js");
const { addFieldsToCreateTask, userOnTask, existsProjectId } = require("../../hellpers/taskFunctions.js");
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

        // adds fields
        task = addFieldsToCreateTask(task);

        // adds createdAt
        task.createdAt = new Date().toISOString();

        // checks projectId if exists
        const existsProject = existsProjectId(task.projectId);
        if (!existsProject) {
            res.status(404).json({
                code: "projectNotFound",
                message: `Project ${task.projectId} not found`,
            });
            return;
        }

        // checks if user can create task
        const canCreateTask = userOnTask(task.createdBy, task.projectId);
        if (!canCreateTask) {
            res.status(400).json({
                code: "usersNotFound",
                message: `User ${task.createdBy} cant create task`,
            });
            return;
        }

        // checks if assingneeUser can be assigned on task
        const canBeAssigneeUser = userOnTask(task.assigneeUser, task.projectId);
        if (!canBeAssigneeUser) {
            res.status(404).json({
                code: "usersNotFound",
                message: `User ${task.assigneeUser} not found on project in userList`,
            });
            return;
        }

        // uses create DAO method to create task
        task = taskDAO.create(task);

        // checks createdBy and assigneeUser
        if (task.createdBy === task.assigneeUser) {
            res.json(task);
            return;
        }

        // send email notification to assignee user
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
