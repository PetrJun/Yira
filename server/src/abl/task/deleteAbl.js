const taskDao = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const sendMail = require("../../hellpers/sendMail.js");
const { userOnTask } = require("../../hellpers/taskFunctions.js");

async function DeleteAbl(req, res) {
    try {
        const { taskId, userId } = req.params;

        deletedTask = taskDao.get(taskId);

        // check if user can delete task
        const canDeleteTask = userOnTask(userId, deletedTask.projectId);
        if (!canDeleteTask) {
            res.status(400).json({
                code: "userCantDeleteTask",
                message: `User ${userId} cant delete task`,
            });
            return;
        }

        // uses remove DAO method to delete task
        taskDao.remove(taskId);

        // check createdBy and assigneeUser
        if (userId === deletedTask.assigneeUser) {
            res.json({});
            return;
        }

        // send email notification to assignee user
        deleterName = userDao.get(userId).name;
        assignedUserName = userDao.get(deletedTask.assigneeUser).name;
        assignedUserEmail = userDao.get(deletedTask.assigneeUser).email;

        let sendReq = {
            sender: deleterName,
            recipient: assignedUserName,
            recipientMail: assignedUserEmail,
            taskName: deletedTask.name,
        };

        sendMail(sendReq, "deletedTaskNotification");

        res.json({});
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = DeleteAbl;
