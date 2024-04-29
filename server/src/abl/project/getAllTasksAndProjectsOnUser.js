const projectDAO = require("../../DAO/projectDAO.js");
const taskDAO = require("../../DAO/taskDAO.js")
const userDAO = require("../../DAO/userDAO.js")


async function GetAllTasksAndProjectsOnUserAbl(req, res) {
  try {
    const { userId } = req.params;

    let projects = projectDAO.list();

    projects.filter(project => project.userList.includes(userId));

    let tasks = taskDAO.list();

    let tasksOnUser = [];

    for (let i = 0; i < projects.length; i++) {
        for (let a = 0; a < tasks.length; a++) {
            if(projects[i].id === tasks[a].projectId){
                tasksOnUser.push(tasks[a]);
            }
        }
    }

    let tasksAndProjects = [...projects, ...tasks];

    tasksAndProjects.forEach(element => {
        element.assigneeUserNameObject = {
            name: userDAO.get(element.assigneeUser).name + " " + userDAO.get(element.assigneeUser).surname,
            id: element.assigneeUser
        }
    });

    let projectUserList;
    for (let i = 0; i < tasksAndProjects.length; i++) {
        if (tasksAndProjects[i].projectId) {
            tasksAndProjects[i].canBeAssignedUsersObjects = [];
            projectUserList = projectDAO.get(tasksAndProjects[i].projectId).userList;
            for(let a = 0; a < projectUserList.length; a++){
                tasksAndProjects[i].canBeAssignedUsersObjects.push(
                    {
                        name: userDAO.get(projectUserList[a]).name + " " + userDAO.get(projectUserList[a]).surname,
                        id: projectUserList[a]
                    }
                )
            }
        } else {
            tasksAndProjects[i].canBeAssignedUsersObjects = [];
            projectUserList = projectDAO.get(tasksAndProjects[i].id).userList;
            for(let a = 0; a < projectUserList.length; a++){
                tasksAndProjects[i].canBeAssignedUsersObjects.push(
                    {
                        name: userDAO.get(projectUserList[a]).name + " " + userDAO.get(projectUserList[a]).surname,
                        id: projectUserList[a]
                    }
                )
            }
        }
    }

    res.json(tasksAndProjects);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = GetAllTasksAndProjectsOnUserAbl;