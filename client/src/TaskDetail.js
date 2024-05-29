import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Container } from 'react-bootstrap';
import { mdiFileEditOutline, mdiDeleteCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import ConfirmDeleteDialogTask from './ConfirmDeleteDialogTask.js'
import TaskForm from "./TaskForm.js";


function TaskDetail() {
    const { userList, loggedInUser } = useContext(UserContext);
    const location = useLocation();
    const navigate = useNavigate();

    const [taskInfo, setTaskInfo] = useState({});
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState(false);
    const [projectName, setProjectName] = useState(false);


    const taskId = new URLSearchParams(location.search).get("id");

    useEffect(() => {
        fetch(`http://localhost:8000/api/task/get/${taskId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setTaskInfo(data);
                fetch(`http://localhost:8000/api/project/getTasksAndProjectsOnUser/${loggedInUser.id}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json();
                    })
                    .then((data2) => {
                        setProjectName(data2.filter(project => project.id === data.projectId)[0].name);
                    })
                    .catch((error) => console.log(error));
            })
            .catch((error) => console.log(error));

        

    }, [taskId, loggedInUser.id, showTaskForm]);

    const getUserNameById = (id) => {
        const user = userList.find(user => user.id === id);
        return user ? `${user.name} ${user.surname}` : 'Unknown User';
    };

    return (
        <Container>
            <Card className="mb-3">
                {taskInfo && userList && 
                <>
                    <Card.Header>{taskInfo.name}</Card.Header>
                    <Card.Body>
                    <Card.Text>
                        <strong>Created By:</strong> {getUserNameById(taskInfo.createdBy)}<br />
                        <strong>Assignee:</strong> {getUserNameById(taskInfo.assigneeUser)}<br />
                        <strong>State:</strong> {taskInfo.state}<br />
                        <strong>Deadline:</strong> {new Date(taskInfo.deadline).toLocaleDateString()}<br />
                        <strong>Estimate:</strong> {taskInfo.estimate} hours<br />
                        <strong>Worked:</strong> {taskInfo.worked} hours<br />
                        <strong>Created At:</strong> {new Date(taskInfo.createdAt).toLocaleDateString()}<br />
                        <strong>Project:</strong>
                            <Button onClick={() => navigate(`/project?id=${taskInfo.projectId}`)} style={{marginLeft: "5px"}}>
                                {projectName}
                            </Button><br />
                        <strong>Description:</strong> {taskInfo.description}
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
                            <Icon path={mdiFileEditOutline} size={1} color={"white"} />{" "}
                            Edit task
                        </Button>
                        <Button variant="danger" onClick={() => setShowConfirmDeleteDialog({})}>
                            <Icon path={mdiDeleteCircle} size={1} color={"white"} />{" "}
                            Delete task
                        </Button>
                    </div>
                </Card.Body>
            </Card>
            {!!showTaskForm ? (
                <TaskForm
                    task={taskInfo}
                    setShowTaskForm={setShowTaskForm}
                />
            ) : null}
            {!!showConfirmDeleteDialog ? (
                <ConfirmDeleteDialogTask
                    setShowConfirmDeleteDialog={setShowConfirmDeleteDialog}
                    task={taskInfo}
                />
            ) : null}
        </Container>
    );
}

export default TaskDetail;