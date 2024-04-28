const { State } = require("./enumState");
const projectDao = require("../DAO/projectDAO.js");


function addFieldsToCreateTask(req) {
    let assigneeUser, state;
    !req.assigneeUser ? assigneeUser = req.createdBy : assigneeUser = req.assigneeUser;
    !req.state ? state = State.TODO : state = req.state;
    return {
        "projectId": req.projectId,
        "name": req.name,
        "createdBy": req.createdBy,
        "assigneeUser": assigneeUser,
        "state": state,
        "deadline": req.deadline,
        "estimate": req.estimate,
        "worked": req.worked,
        "description": req.description
    }
}

function canBeAssignedOnTask(userId, projectId) {
    const projectUsers = projectDao.get(projectId).projectUsers;

    return projectUsers.find(id => id === userId);
}

function existsProjectId(projectId) {
    const projectIds = projectDao.list();

    return projectIds.find(id => id === projectId);
}

module.exports = {
    addFieldsToCreateTask,
    canBeAssignedOnTask,
    existsProjectId
};