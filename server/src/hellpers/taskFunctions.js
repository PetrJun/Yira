const { State } = require("./enumState");
const projectDao = require("../DAO/projectDAO.js");

/**
 * 
 * @param {*} req 
 * @returns updated DTO in
 */
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

/**
 * 
 * @param {*} userId 
 * @param {*} projectId 
 * @returns true if is user in userList of project
 */
function userOnTask(userId, projectId) {
    const projectUsers = projectDao.get(projectId).userList;

    return projectUsers.find(id => id === userId);
}

/**
 * 
 * @param {*} projectId 
 * @returns true if projectId exists
 */
function existsProjectId(projectId) {
    const projects = projectDao.list();
    const projectIds = projects.map((project) => project.id);

    return projectIds.find(id => id === projectId);
}

module.exports = {
    addFieldsToCreateTask,
    userOnTask,
    existsProjectId
};