const projectDao = require("../../DAO/projectDAO.js");
const userDao = require("../../DAO/userDAO.js");
const sendMail = require("../../hellpers/sendMail.js");

async function DeleteAbl(req, res) {
    try {
        const { projectId, userId } = req.params;

        deletedProject = projectDao.get(projectId);

        // check if user can delete project
        if(deletedProject.createdBy !== userId) {
            res.status(400).json({ message: `User: ${userId} can't delete project` });
            return;
        }

        // uses remove DAO method to delete project
        projectDao.remove(projectId);

        // check createdBy and assigneeUser
        if(deletedProject.createdBy === deletedProject.assigneeUser) {
            res.json({});
            return;
        }

        // send email notification to assignee user
        createdByName = userDao.get(deletedProject.createdBy).name;
        assignedUserName = userDao.get(deletedProject.assigneeUser).name;
        assignedUserEmail = userDao.get(deletedProject.assigneeUser).email;

        let sendReq = {
            sender: createdByName,
            recipient: assignedUserName,
            recipientMail: assignedUserEmail,
            projectName: deletedProject.name
        }

        sendMail(sendReq, "deletedProjectNotification");
  
        res.json({});
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
  }

  module.exports = DeleteAbl;