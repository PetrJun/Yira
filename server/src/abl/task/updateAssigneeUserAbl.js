const taskDAO = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const sendMail = require("../../hellpers/sendMail.js");
const { userOnTask } = require("../../hellpers/taskFunctions.js")

async function UpdateAssigneeUserAbl(req, res) {
    try {
        const { taskId, assigneeId, userId } = req.params;
        let assignedUserName, assignedUserEmail, sendReq;

        oldTask = taskDAO.get(taskId);

        if(oldTask === null){
            res.status(404).json({
                code: "taskNotFound",
                message: `Task ${taskId} not found`,
            });
            return;
        }

        const canUpdateAssignee = userOnTask(userId, oldTask.projectId);

        if (!canUpdateAssignee) {
            res.status(400).json({
                code: "userCantUpdateassigneeUser",
                message: `User ${userId} cant update assignee user`,
            });
            return;
        }

        const canUpdateAssigneeUserOnTask = userOnTask(assigneeId, oldTask.projectId);

        if (!canUpdateAssigneeUserOnTask) {
            res.status(400).json({
                code: "userCantBeAssignedOnTask",
                message: `User ${assigneeId} cant be assigned on task`,
            });
            return;
        }

        updatedTask = taskDAO.update({id: taskId, assigneeUser: assigneeId})

        assignedUserName = userDao.get(updatedTask.assigneeUser).name;
        assignedUserEmail = userDao.get(updatedTask.assigneeUser).email;

        sendReq = {
            recipient: assignedUserName,
            recipientMail: assignedUserEmail,
            taskId: oldTask.id,
            taskName: oldTask.name
        };

        sendMail(sendReq, "updateTaskAssigneeUserNotfication");

        res.json(updatedTask);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = UpdateAssigneeUserAbl;