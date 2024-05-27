import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Table, Container } from 'react-bootstrap';
import { mdiFileEditOutline, mdiDeleteCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import ProjectForm from "./ProjectForm.js";


function ProjectDetail() {
    const { userList, loggedInUser } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [projectInfo, setProjectInfo] = useState({});
    const [projectWithoutTaskList, setProjectWithoutTaskList] = useState({});
    const [taskList, setTaskList] = useState([]);
    const [showProjectForm, setShowProjectForm] = useState(false);

    useEffect(() => {
        fetch(
            `http://localhost:8000/api/project/get/${new URLSearchParams(location.search).get("id")}`
        )
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
    }, [showProjectForm]);

    useEffect(() => {
        fetch(
            `http://localhost:8000/api/project/getTasksAndProjectsOnUser/${loggedInUser.id}`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                let projectId = new URLSearchParams(location.search).get("id");
                setProjectWithoutTaskList(projectInfo);
                setTaskList(data.filter((task) => task.projectId === projectId));
            })
            .catch((error) => console.log(error));
    }, [projectInfo, loggedInUser]);
    
    useEffect(() => {
        setProjectInfo({...projectInfo, taskList: taskList})
    }, [taskList]);

    const getUserNameById = (id) => {
        const user = userList.find(user => user.id === id);
        return user ? `${user.name} ${user.surname}` : 'Unknown User';
    };

    return (
        <Container>
            <Card className="mb-3">
                {projectInfo && 
                <>
                    <Card.Header>{projectInfo.name}</Card.Header>
                    <Card.Body>
                    <Card.Text>
                        <strong>Created By:</strong> {getUserNameById(projectInfo.createdBy)}<br />
                        <strong>Assignee:</strong> {getUserNameById(projectInfo.assigneeUser)}<br />
                        <strong>State:</strong> {projectInfo.state}<br />
                        <strong>Deadline:</strong> {new Date(projectInfo.deadline).toLocaleDateString()}<br />
                        <strong>Estimate:</strong> {projectInfo.estimate} hours<br />
                        <strong>Worked:</strong> {projectInfo.worked} hours<br />
                        <strong>Description:</strong> {projectInfo.description}<br />
                        <strong>Created At:</strong> {new Date(projectInfo.createdAt).toLocaleDateString()}
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
                        <Button variant="success" onClick={() => setShowProjectForm({})}>
                            <Icon path={mdiFileEditOutline} size={1} color={"white"} />{" "}
                            Edit project
                        </Button>
                        {loggedInUser.id === projectInfo.createdBy && 
                            <Button variant="danger" onClick={() => setShowProjectForm({})}>
                                <Icon path={mdiDeleteCircle} size={1} color={"white"} />{" "}
                                Delete project
                            </Button>
                        }
                    </div>
                </Card.Body>
            </Card>
            {!!showProjectForm ? (
                <ProjectForm
                    project={projectWithoutTaskList}
                    setShowProjectForm={setShowProjectForm}
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
                    {projectInfo && projectInfo.taskList && projectInfo.taskList.map(task => (
                        <tr key={task.id}>
                            <td>{task.name}</td>
                            <td>{getUserNameById(task.createdBy)}</td>
                            <td style={{backgroundColor: (task.assigneeUser === loggedInUser.id) ? 'yellow' : 'none'}}>{task.assigneeUserNameObject.name}</td>
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
// backgroundColor: task.assigneeUser === loggedInUser.id ? 'lightyellow' : 'none'