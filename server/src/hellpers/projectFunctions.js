const { State } = require("./enumState");
const userDAO = require('../DAO/userDAO.js');


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

function existingUsersInProject(list) {
    const users = userDAO.list();
    const userIds = users.map((user) => user.id);

    const notInUsers = list.filter((value) => !userIds.includes(value));

    if (notInUsers > 0) {
        return false;
    } else {
        return true;
    }
}


module.exports = {
    addFieldsToCreateProject, 
    existingUsersInProject
};