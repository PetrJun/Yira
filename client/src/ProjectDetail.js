import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Table, Container } from 'react-bootstrap';
import { mdiFileEditOutline, mdiDeleteCircle, mdiPlusCircle  } from '@mdi/js';
import { Icon } from '@mdi/react';
import ProjectForm from "./ProjectForm.js";
import ConfirmDeleteDialogProject from './ConfirmDeleteDialogProject.js'
import TaskForm from "./TaskForm.js";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { ProjectContext } from "./ProjectContext.js";


function ProjectDetail() {
    const { userList, loggedInUser } = useContext(UserContext);
    const { handlerMapProject } = useContext(ProjectContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [projectInfo, setProjectInfo] = useState({});
    const [taskList, setTaskList] = useState([]);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [assigneeUsers, setAssigneeUsers] = useState([]);
    const [assigneeUserChanged, setAssigneeUserChanged] = useState(false);

    const projectId = new URLSearchParams(location.search).get("id");

    const handleUpdate = async (projectId, assigneeUserId, userId) => {
        try {
          await handlerMapProject.handleUpdateAssigneeUser(projectId, assigneeUserId, userId);
          setAssigneeUserChanged(true);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetch(`http://localhost:8000/api/project/get/${projectId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setProjectInfo(data);
            })
            .catch((error) => console.log(error));

        fetch(`http://localhost:8000/api/project/getTasksAndProjectsOnUser/${loggedInUser.id}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setTaskList(data.filter((task) => task.projectId === projectId));
                setAssigneeUsers(data.filter((project) => project.id === projectId)[0].canBeAssignedUsersObjects);
            })
            .catch((error) => console.log(error));
            setAssigneeUserChanged(false);
    }, [projectId, loggedInUser.id, showProjectForm, showTaskForm, assigneeUserChanged]);

    const getUserNameById = (id) => {
        const user = userList.find(user => user.id === id);
        return user ? `${user.name} ${user.surname}` : 'Unknown User';
    };

    return (
        <Container>
            <Card className="mb-3">
                {projectInfo && userList && 
                <>
                    <Card.Header>{projectInfo.name}</Card.Header>
                    <Card.Body>
                    <Card.Text>
                        <strong>Created By:</strong> {getUserNameById(projectInfo.createdBy)}<br />
                        <strong>Assignee:</strong> {loggedInUser.id === projectInfo.createdBy ? <DropdownButton
                            as={ButtonGroup}
                            key={0}
                            id={`dropdown-button-drop-0`}
                            size="sm"
                            variant="secondary"
                            title={getUserNameById(projectInfo.assigneeUser)}
                        >
                            {assigneeUsers?.map((user) => (
                                <Dropdown.Item eventKey={user.id} onClick={() => handleUpdate(projectInfo.id, user.id, loggedInUser.id)}>{user.name}</Dropdown.Item>
                            ))}
                        </DropdownButton> : getUserNameById(projectInfo.assigneeUser)}<br />
                        <strong>State:</strong> {projectInfo.state}<br />
                        <strong>Deadline:</strong> {new Date(projectInfo.deadline).toLocaleDateString()}<br />
                        <strong>Estimate:</strong> {projectInfo.estimate} hours<br />
                        <strong>Worked:</strong> {projectInfo.worked} hours<br />
                        <strong>Created At:</strong> {new Date(projectInfo.createdAt).toLocaleDateString()}<br />
                        <strong>Project users:</strong> {
                            userList
                                .filter(user => projectInfo.userList?.includes(user.id))
                                .map(user => `${user.name} ${user.surname}`)
                                .join(', ')
                        }<br />
                        <strong>Description:</strong> {projectInfo.description}
                    </Card.Text>
                    </Card.Body>
                </>
                }
                <Card.Body>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "8px",
                        }}
                    >
                        <Button variant="success" onClick={() => setShowTaskForm({})}>
                            <Icon path={mdiPlusCircle } size={1} color={"white"} />{" "}
                            Add task
                        </Button>
                        {loggedInUser.id === projectInfo.createdBy && 
                            <>
                                <Button variant="success" onClick={() => setShowProjectForm({})}>
                                    <Icon path={mdiFileEditOutline} size={1} color={"white"} />{" "}
                                    Edit project
                                </Button>
                                <Button variant="danger" onClick={() => setShowConfirmDeleteDialog({})}>
                                    <Icon path={mdiDeleteCircle} size={1} color={"white"} />{" "}
                                    Delete project
                                </Button>
                            </>
                        }
                    </div>
                </Card.Body>
            </Card>
            {!!showProjectForm ? (
                <ProjectForm
                    project={projectInfo}
                    setShowProjectForm={setShowProjectForm}
                />
            ) : null}
            {!!showTaskForm ? (
                <TaskForm
                    task={{projectId: projectInfo.id}}
                    setShowTaskForm={setShowTaskForm}
                />
            ) : null}
            {!!showConfirmDeleteDialog ? (
                <ConfirmDeleteDialogProject
                    setShowConfirmDeleteDialog={setShowConfirmDeleteDialog}
                    project={projectInfo}
                />
            ) : null}
            <Card>
                <Card.Header>Task List</Card.Header>
                <Card.Body>
                <Table striped bordered hover responsive>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Created By</th>
                        <th>Assignee</th>
                        <th>State</th>
                        <th>Deadline</th>
                        <th>Estimate</th>
                        <th>Worked</th>
                        <th>Description</th>
                        <th>Created At</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {taskList.map(task => (
                        <tr key={task.id}>
                            <td>{task.name}</td>
                            <td>{getUserNameById(task.createdBy)}</td>
                            <td style={{backgroundColor: (task.assigneeUser === loggedInUser.id) ? 'yellow' : null}}>{task.assigneeUserNameObject.name}</td>
                            <td>{task.state}</td>
                            <td>{new Date(task.deadline).toLocaleDateString()}</td>
                            <td>{task.estimate}</td>
                            <td>{task.worked}</td>
                            <td>{task.description}</td>
                            <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                            <td>
                                <Button
                                    variant="success"
                                    size="small"
                                    onClick={() => navigate(`/task?id=${task.id}`)}
                                >
                                    {"Detail"}
                                </Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ProjectDetail;