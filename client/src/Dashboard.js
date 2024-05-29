import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { TasksAndProjectsOnUserContext } from "./TasksAndProjectsOnUserContext.js";
import { UserContext } from "./UserContext.js";
import { TaskContext } from "./TaskContext.js";

import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

// import EventCard from "./EventCard";
import TaskForm from "./TaskForm.js";
import ProjectForm from "./ProjectForm.js";
import Container from "react-bootstrap/esm/Container.js";

import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";
import { DataGrid } from "@mui/x-data-grid";
import { format } from "date-fns";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';

function Dashboard() {
    // const { tasksAndProjectsOnUser } = useContext(TasksAndProjectsOnUserContext);
    const { loggedInUser } = useContext(UserContext);
    const { handlerMapTask } = useContext(TaskContext);
    const navigate = useNavigate();

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [canCreateProject, setCanCreateProject] = useState(false);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [shiftPressed, setShiftPressed] = useState(false);
    const [lastShiftPressTime, setLastShiftPressTime] = useState(null);
    const [ctrlPressed, setCtrlPressed] = useState(false);
    const [lastCtrlPressTime, setLastCtrlPressTime] = useState(null);
    const [assigneeUserChanged, setAssigneeUserChanged] = useState(false);

    const handleUpdate = async (taskId, assigneeUserId, userId) => {
        try {
          await handlerMapTask.handleUpdateAssigneeUser(taskId, assigneeUserId, userId);
          setAssigneeUserChanged(true);
        } catch (e) {
            console.error(e);
        }
    };

    const tooltipTask = (
        <Tooltip id="tooltipTask">
            Create task faster by clicking 2x on shift
        </Tooltip>
    );

    const tooltipProject = (
        <Tooltip id="tooltipProject">
            Create project faster by clicking 2x on control
        </Tooltip>
    );

    const handleKeyDown = (event) => {
        if (event.key === "Shift") {
            console.log("Shift pressed: " + shiftPressed);
            setShiftPressed(true);
            const currentTime = new Date().getTime();
            if (lastShiftPressTime && currentTime - lastShiftPressTime < 2000) {
                setShowTaskForm({});
            }
            setLastShiftPressTime(currentTime);
        } else if (event.key === "Control" && canCreateProject) {
            console.log("Control pressed: " + ctrlPressed);
            setCtrlPressed(true);
            const currentTime = new Date().getTime();
            if (lastCtrlPressTime && currentTime - lastCtrlPressTime < 2000) {
                setShowProjectForm({});
            }
            setLastCtrlPressTime(currentTime);
        }
    };

    const handleKeyUp = (event) => {
        if (event.key === "Shift") {
            setShiftPressed(false);
        } else if (event.key === "Control" && canCreateProject) {
            setShiftPressed(false);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [lastShiftPressTime, lastCtrlPressTime]);

    useEffect(() => {
        if (loggedInUser?.role === "projectManager") {
            setCanCreateProject(true);
        } else {
            setCanCreateProject(false);
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (loggedInUser && loggedInUser.id) {
            setLoading(true);
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
                    setRows(data);
                    setLoading(false);
                })
                .catch((error) => console.log(error));
        }
        setAssigneeUserChanged(false);
    }, [loggedInUser, assigneeUserChanged]);

    const getColorForState = (state) => {
        switch (state) {
            case "DONE":
                return "lightgreen";
            case "INPROGRESS":
                return "lightblue";
            case "TODO":
                return "lightyellow";
            case "CANCELLED":
                return "#FF5733";
            case "REVIEW":
                return "lightgray";
            default:
                return "none";
        }
    };


    const columns = [
        { field: "name", headerName: "Name", width: 400 },
        {
            field: "projectName",
            headerName: "Project name",
            width: 150,
            renderCell: (params) => {
                if (params.row.projectName) {
                    return (
                        <Button
                            variant="success"
                            size="small"
                            onClick={() =>
                                navigate(`/project?id=${params.row.projectId}`)
                            } //
                        >
                            {params.row.projectName}
                        </Button>
                    );
                }
                return null;
            },
        },
        {
            field: "assigneeUserObject",
            headerName: "Assignee user",
            width: 200,
            renderCell: (params) => (
                !params.row.projectId && loggedInUser?.id === params.row.assigneeUserNameObject.id ?
                <span
                    style={{
                        backgroundColor:"yellow"
                    }}
                >
                    {params.row.assigneeUserNameObject.name}
                </span> : 
                !params.row.projectId && loggedInUser?.id !== params.row.assigneeUserNameObject.id ? 
                <span
                    style={{
                        backgroundColor:"none"
                    }}
                >
                    {params.row.assigneeUserNameObject.name}
                </span> :
                (loggedInUser?.id === params.row.assigneeUserNameObject.id) ?
                <DropdownButton
                    as={ButtonGroup}
                    key={0}
                    id={`dropdown-variants-warning`}
                    size="sm"
                    variant="warning"
                    title={params.row.assigneeUserNameObject.name}
                    style={{
                        position: "absolute",
                    }}
                >
                    {params.row.canBeAssignedUsersObjects.map((user) => (
                        <Dropdown.Item eventKey={user.id} onClick={() => handleUpdate(params.row.id, user.id, loggedInUser.id)}>{user.name}</Dropdown.Item>
                    ))}
                </DropdownButton> :
                <DropdownButton
                    as={ButtonGroup}
                    key={0}
                    id={`dropdown-button-drop-0`}
                    size="sm"
                    variant="secondary"
                    title={params.row.assigneeUserNameObject.name}
                    style={{
                        position: "absolute",
                    }}
                >
                    {params.row.canBeAssignedUsersObjects.map((user) => (
                        <Dropdown.Item eventKey={user.id} onClick={() => handleUpdate(params.row.id, user.id, loggedInUser.id)}>{user.name}</Dropdown.Item>
                    ))}
                </DropdownButton>
            ),
        },
        {
            field: "deadline",
            headerName: "Deadline",
            width: 180,
            valueFormatter: (params) =>
                format(new Date(params.value), "dd.MM. yyyy"),
        },
        {
            field: "state",
            headerName: "State",
            width: 180,
            renderCell: (params) => (
                <span
                    style={{ backgroundColor: getColorForState(params.value) }}
                >
                    {params.value}
                </span>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="success"
                    size="small"
                    onClick={() =>
                        navigate(
                            `/${
                                params.row.projectName ? "task" : "project"
                            }?id=${params.row.id}`
                        )
                    }
                >
                    {"Detail "}
                    {params.row.projectName ? "task" : "project"}
                </Button>
            ),
        },
    ];

    return loggedInUser ? (
        <Container>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                }}
            >
                <OverlayTrigger placement="top" overlay={tooltipTask}>
                    <Button variant="success" onClick={() => setShowTaskForm({})}>
                        <Icon path={mdiPlusBoxOutline} size={1} color={"white"} />{" "}
                        New task
                    </Button>
                </OverlayTrigger>
                {canCreateProject && (
                    <OverlayTrigger placement="top" overlay={tooltipProject}>
                        <Button
                            variant="success"
                            onClick={() => setShowProjectForm({})}
                        >
                            <Icon
                                path={mdiPlusBoxOutline}
                                size={1}
                                color={"white"}
                            />{" "}
                            New project
                        </Button>
                    </OverlayTrigger>
                )}
            </div>
            {!!showTaskForm ? (
                <TaskForm
                    task={showTaskForm}
                    setShowTaskForm={setShowTaskForm}
                />
            ) : null}
            {!!showProjectForm ? (
                <ProjectForm
                    project={showProjectForm}
                    setShowProjectForm={setShowProjectForm}
                />
            ) : null}
            {rows.length > 0 && (
                <div
                    style={{
                        height: 750,
                        width: "100%",
                        marginTop: "10px",
                        borderColor: "black",
                        backgroundColor: "#6699CC",
                        borderRadius: "10px",
                    }}
                >
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.id} // Specify the unique field for row ID
                    />
                </div>
            )}
        </Container>
    ) : (
        <div style={messageStyle}>Nothing here :/ please login</div>
    );
}

const messageStyle = {
    color: "red",
    fontSize: "3em",
    fontWeight: "bold",
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "80vh",
    margin: "0",
    backgroundColor: "#f0f0f0",
};

export default Dashboard;
