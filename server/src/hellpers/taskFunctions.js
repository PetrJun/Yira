const { State } = require("./enumState");


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
        "description": req.description,
        "userList": req.userList
    }
}

module.exports = addFieldsToCreateTask;