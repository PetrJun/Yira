const Ajv = require("ajv");
const ajv = new Ajv();

const projectDAO = require("../../DAO/projectDAO.js");
const taskDAO = require("../../DAO/taskDAO.js");
const userDAO = require("../../DAO/userDAO.js");
const { State } = require("../../hellpers/enumState.js");

const schema = {
    type: "object",
    properties: {
        filterByState: { type: "string", enum: Object.values(State) },
        filterByName: { type: "string" },
        filterByAssigneeUser: { type: "string" },
    },
    additionalProperties: false,
};

async function GetTasksAndProjectsOnUserAbl(req, res) {
    try {
        const { userId } = req.params;
        const filterObject = req.body;

        // validate input
        const valid = ajv.validate(schema, filterObject);
        if (!valid) {
            res.status(400).json({
                code: "dtoInIsNotValid",
                message: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }

        // get all projects
        let projects = projectDAO.list();

        // filter projects where is our userId in userList in projects
        projects.filter((project) => project.userList.includes(userId));

        // if user is not on projects in userList returns []
        if (projects.length == 0) {
            res.status(204).json([]);
            return;
        }

        // get all tasks
        let tasks = taskDAO.list();

        let tasksOnUser = [];

        // get all tasks in projects on user
        for (let i = 0; i < projects.length; i++) {
            for (let a = 0; a < tasks.length; a++) {
                if (projects[i].id === tasks[a].projectId) {
                    tasksOnUser.push(tasks[a]);
                }
            }
        }

        // concat lists
        let tasksAndProjects = [...projects, ...tasks];

        // add object, about assigneeUser, to every objects in list
        tasksAndProjects.forEach((element) => {
            element.assigneeUserNameObject = {
                name:
                    userDAO.get(element.assigneeUser).name +
                    " " +
                    userDAO.get(element.assigneeUser).surname,
                id: element.assigneeUser,
            };
        });

        // add list of objects, about users who can work on project, to every objects in list
        let projectUserList;
        for (let i = 0; i < tasksAndProjects.length; i++) {
            if (tasksAndProjects[i].projectId) {
                tasksAndProjects[i].canBeAssignedUsersObjects = [];
                projectUserList = projectDAO.get(
                    tasksAndProjects[i].projectId
                ).userList;
                for (let a = 0; a < projectUserList.length; a++) {
                    tasksAndProjects[i].canBeAssignedUsersObjects.push({
                        name:
                            userDAO.get(projectUserList[a]).name +
                            " " +
                            userDAO.get(projectUserList[a]).surname,
                        id: projectUserList[a],
                    });
                }
            } else {
                tasksAndProjects[i].canBeAssignedUsersObjects = [];
                projectUserList = projectDAO.get(
                    tasksAndProjects[i].id
                ).userList;
                for (let a = 0; a < projectUserList.length; a++) {
                    tasksAndProjects[i].canBeAssignedUsersObjects.push({
                        name:
                            userDAO.get(projectUserList[a]).name +
                            " " +
                            userDAO.get(projectUserList[a]).surname,
                        id: projectUserList[a],
                    });
                }
            }
        }

        // filter list by request body
        if (filterObject.filterByState) {
            tasksAndProjects = tasksAndProjects.filter((value) => value.state === filterObject.filterByState);
        }
        if (filterObject.filterByName) {
            tasksAndProjects = tasksAndProjects.filter((value) => value.name.includes(filterObject.filterByName));
        }
        if (filterObject.filterByAssigneeUser) {
            tasksAndProjects = tasksAndProjects.filter((value) => value.assigneeUserNameObject.name.includes(filterObject.filterByAssigneeUser));
        }

        res.json(tasksAndProjects);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = GetTasksAndProjectsOnUserAbl;
