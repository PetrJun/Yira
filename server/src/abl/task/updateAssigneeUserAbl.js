const taskDAO = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const sendMail = require("../../hellpers/sendMail.js");

async function UpdateAssigneeUserAbl(req, res) {
    try {
        const { taskId, userId } = req.params;
        let assignedUserName, assignedUserEmail, sendReq;

        oldTask = taskDAO.get(taskId);
        updatedTask = taskDAO.update({id: taskId, assigneeUser: userId})

        assignedUserName = userDao.get(oldTask.assigneeUser).name;
        assignedUserEmail = userDao.get(oldTask.assigneeUser).email;

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