const taskDAO = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const sendMail = require("../../hellpers/sendMail.js");
const { userOnTask } = require("../../hellpers/taskFunctions.js")

async function UpdateAssigneeUserAbl(req, res) {
    try {
        const { taskId, assigneeId, userId } = req.params;
        let assignedUserName, assignedUserEmail, sendReq;

        oldTask = taskDAO.get(taskId);

        // checks task if is null
        if(oldTask === null){
            res.status(404).json({
                code: "taskNotFound",
                message: `Task ${taskId} not found`,
            });
            return;
        }

        // check if userId can update assingeeUser
        const canUpdateAssignee = userOnTask(userId, oldTask.projectId);
        if (!canUpdateAssignee) {
            res.status(400).json({
                code: "userCantUpdateAssigneeUser",
                message: `User ${userId} cant update assignee user`,
            });
            return;
        }

        // check if assigneeId can be assigned on task
        const canUpdateAssigneeUserOnTask = userOnTask(assigneeId, oldTask.projectId);
        if (!canUpdateAssigneeUserOnTask) {
            res.status(400).json({
                code: "userCantBeAssignedOnTask",
                message: `User ${assigneeId} cant be assigned on task`,
            });
            return;
        }

        // uses update DAO method to update project
        updatedTask = taskDAO.update({id: taskId, assigneeUser: assigneeId})

        // send mail notification
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