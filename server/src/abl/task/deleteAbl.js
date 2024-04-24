const taskDao = require("../../DAO/taskDAO.js");
const userDao = require("../../DAO/userDAO.js");
const sendMail = require("../../hellpers/sendMail.js");

async function DeleteAbl(req, res) {
    try {
        const { id } = req.params;

        deletedTask = taskDao.get(id);

        taskDao.remove(id);

        if(deletedTask.createdBy === deletedTask.assigneeUser) {
            res.json(task);
        }

        createdByName = userDao.get(deletedTask.createdBy).name;
        assignedUserName = userDao.get(deletedTask.assigneeUser).name;
        assignedUserEmail = userDao.get(deletedTask.assigneeUser).email;

        let sendReq = {
            sender: createdByName,
            recipient: assignedUserName,
            recipientMail: assignedUserEmail,
            taskName: deletedTask.name
        }

        sendMail(sendReq, "deletedTaskNotification");
  
        res.json({});
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
  }

  module.exports = DeleteAbl;