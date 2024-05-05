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

        const valid = ajv.validate(schema, filterObject);
        if (!valid) {
            res.status(400).json({
                code: "dtoInIsNotValid",
                message: "dtoIn is not valid",
                validationError: ajv.errors,
            });
            return;
        }

        let projects = projectDAO.list();

        projects.filter((project) => project.userList.includes(userId));

        if (projects.length == 0) {
            res.status(204).json([]);
            return;
        }

        let tasks = taskDAO.list();

        let tasksOnUser = [];

        for (let i = 0; i < projects.length; i++) {
            for (let a = 0; a < tasks.length; a++) {
                if (projects[i].id === tasks[a].projectId) {
                    tasksOnUser.push(tasks[a]);
                }
            }
        }

        let tasksAndProjects = [...projects, ...tasks];

        tasksAndProjects.forEach((element) => {
            element.assigneeUserNameObject = {
                name:
                    userDAO.get(element.assigneeUser).name +
                    " " +
                    userDAO.get(element.assigneeUser).surname,
                id: element.assigneeUser,
            };
        });

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
