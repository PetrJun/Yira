const { State } = require("./enumState");
const userDAO = require('../DAO/userDAO.js');

/**
 * 
 * @param {*} req 
 * @returns updated DTO in
 */
function addFieldsToCreateProject(req) {
    let assigneeUser, state;
    !req.assigneeUser ? assigneeUser = req.createdBy : assigneeUser = req.assigneeUser;
    !req.state ? state = State.TODO : state = req.state;
    return {
        "name": req.name,
        "createdBy": req.createdBy,
        "assigneeUser": assigneeUser,
        "state": state,
        "deadline": req.deadline,
        "estimate": req.estimate,
        "worked": req.worked,
        "description": req.description,
        "userList": req.userList
    }
}

/**
 * 
 * @param {*} list 
 * @returns list of users who is not in project userList
 */
function existingUsersInProject(list) {
    const users = userDAO.list();
    const userIds = users.map((user) => user.id);

    return list.filter((value) => !userIds.includes(value));
}


module.exports = {
    addFieldsToCreateProject, 
    existingUsersInProject
};