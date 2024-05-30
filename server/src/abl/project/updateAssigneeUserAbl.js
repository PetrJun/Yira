const projectDAO = require("../../DAO/projectDAO.js");
const userDao = require("../../DAO/userDAO.js");
const sendMail = require("../../hellpers/sendMail.js");

async function UpdateAssigneeUserAbl(req, res) {
    try {
        const { projectId, assigneeId, userId } = req.params;
        let assignedUserName, assignedUserEmail, sendReq;

        oldProject = projectDAO.get(projectId);

        // checks task if is null
        if(oldProject === null){
            res.status(404).json({
                code: "projectNotFound",
                message: `project ${projectId} not found`,
            });
            return;
        }

        // if userId is not createdBy throw error
        if(oldProject.createdBy !== userId) {
            res.status(400).json({ message: `User: ${userId} can't edit project` });
            return;
        }

        const projectUsers = projectDAO.get(projectId).userList;

        if (!projectUsers.find(id => id === assigneeId)) {
            res.status(400).json({
                code: "userCantBeAssignedOnProject",
                message: `User ${assigneeId} cant be assigned on project`,
            });
            return;
        }

        // uses update DAO method to update project
        updatedProject = projectDAO.update({id: projectId, assigneeUser: assigneeId})

        // send mail notification
        assignedUserName = userDao.get(updatedProject.assigneeUser).name;
        assignedUserEmail = userDao.get(updatedProject.assigneeUser).email;
        sendReq = {
            recipient: assignedUserName,
            recipientMail: assignedUserEmail,
            projectId: oldProject.id,
            projectName: oldProject.name
        };

        sendMail(sendReq, "updateProjectAssigneeUserNotfication");

        res.json(updatedProject);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = UpdateAssigneeUserAbl;