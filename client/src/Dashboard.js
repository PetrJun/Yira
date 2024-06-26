import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext.js";
import { TaskContext } from "./TaskContext.js";
import { ProjectContext } from "./ProjectContext.js";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import TaskForm from "./TaskForm.js";
import ProjectForm from "./ProjectForm.js";
import Container from "react-bootstrap/esm/Container.js";
import Icon from "@mdi/react";
import { mdiPlusBoxOutline, mdiSitemapOutline } from "@mdi/js";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { format } from "date-fns";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

function Dashboard() {
    const { loggedInUser } = useContext(UserContext);
    const { handlerMapTask } = useContext(TaskContext);
    const { handlerMapProject } = useContext(ProjectContext);
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
    const [assigneeUserTaskChanged, setAssigneeUserTaskChanged] =
        useState(false);
    const [assigneeUserProjectChanged, setAssigneeUserProjectChanged] =
        useState(false);

    const handleUpdateTask = async (taskId, assigneeUserId, userId) => {
        try {
            await handlerMapTask.handleUpdateAssigneeUser(
                taskId,
                assigneeUserId,
                userId
            );
            setAssigneeUserTaskChanged(true);
        } catch (e) {
            console.error(e);
        }
    };
    const handleUpdateProject = async (projectId, assigneeUserId, userId) => {
        try {
            await handlerMapProject.handleUpdateAssigneeUser(
                projectId,
                assigneeUserId,
                userId
            );
            setAssigneeUserProjectChanged(true);
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
            setShiftPressed(true);
            const currentTime = new Date().getTime();
            if (lastShiftPressTime && currentTime - lastShiftPressTime < 2000) {
                setShowTaskForm({});
            }
            setLastShiftPressTime(currentTime);
        } else if (event.key === "Control" && canCreateProject) {
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
                    data = data.map((item) => {
                        if (item.projectId) {
                            return {
                                ...item,
                                hierarchy: [item.projectName, item.name],
                            };
                        } else {
                            return {
                                ...item,
                                hierarchy: [item.name],
                            };
                        }
                    });
                    data = modifyHierarchy(data);
                    setRows(data);
                    setLoading(false);
                })
                .catch((e) => console.log(e));
        }
        setAssigneeUserTaskChanged(false);
        setAssigneeUserProjectChanged(false);
    }, [loggedInUser, assigneeUserTaskChanged, assigneeUserProjectChanged, showProjectForm, showTaskForm]);

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
                return "white";
        }
    };

    const columns = [
        { field: "name", headerName: "Name", width: 350 },
        {
            field: "projectName",
            headerName: "Project name",
            width: 350,
            renderCell: (params) => {
                if (params.row.projectName) {
                    return (
                        <Button
                            variant="success"
                            size="small"
                            onClick={() =>
                                navigate(`/project?id=${params.row.projectId}`)
                            }
                        >
                            {params.row.projectName}
                        </Button>
                    );
                }
                return null;
            },
        },
        {
            field: "assigneeUserNameObject",
            headerName: "Assignee user",
            width: 170,
            valueGetter: (params) => params.name ,
            renderCell: (params) =>
                !params.row.projectId &&
                loggedInUser?.id === params.row.assigneeUserNameObject.id &&
                loggedInUser?.id === params.row.createdBy ? (
                    <DropdownButton
                        as={ButtonGroup}
                        key={0}
                        id={`dropdown-variants-warning`}
                        size="sm"
                        variant="warning"
                        title={params.row.assigneeUserNameObject.name}
                        style={{
                            position: "absolute",
                            marginTop: "5px",
                        }}
                    >
                        {params.row.canBeAssignedUsersObjects.map((user) => {
                            if (user.name === params.row.assigneeUserNameObject.name) {
                                return null;
                            } else {
                                return <Dropdown.Item
                                    eventKey={user.id}
                                    onClick={() =>
                                        handleUpdateProject(
                                            params.row.id,
                                            user.id,
                                            loggedInUser.id
                                        )
                                    }
                                >
                                    {user.name}
                                </Dropdown.Item>
                            }
                        })}
                    </DropdownButton>
                ) : !params.row.projectId &&
                  loggedInUser?.id !== params.row.assigneeUserNameObject.id &&
                  loggedInUser?.id === params.row.createdBy ? (
                    <DropdownButton
                        as={ButtonGroup}
                        key={0}
                        id={`dropdown-button-drop-0`}
                        size="sm"
                        variant="secondary"
                        title={params.row.assigneeUserNameObject.name}
                        style={{
                            position: "absolute",
                            marginTop: "5px",
                        }}
                    >
                        {params.row.canBeAssignedUsersObjects.map((user) => {
                            if (user.name === params.row.assigneeUserNameObject.name) {
                                return null;
                            } else {
                                return <Dropdown.Item
                                    eventKey={user.id}
                                    onClick={() =>
                                        handleUpdateProject(
                                            params.row.id,
                                            user.id,
                                            loggedInUser.id
                                        )
                                    }
                                >
                                    {user.name}
                                </Dropdown.Item>
                            }
                        })}
                    </DropdownButton>
                ) : !params.row.projectId &&
                  loggedInUser?.id === params.row.assigneeUserNameObject.id ? (
                    <span
                        style={{
                            backgroundColor: "yellow",
                            padding: "5px 5px 5px 5px",
                            marginTop: "5px",
                        }}
                    >
                        {params.row.assigneeUserNameObject.name}
                    </span>
                ) : !params.row.projectId &&
                  loggedInUser?.id !== params.row.assigneeUserNameObject.id ? (
                    <span>{params.row.assigneeUserNameObject.name}</span>
                ) : loggedInUser?.id ===
                  params.row.assigneeUserNameObject.id ? (
                    <DropdownButton
                        as={ButtonGroup}
                        key={0}
                        id={`dropdown-variants-warning`}
                        size="sm"
                        variant="warning"
                        title={params.row.assigneeUserNameObject.name}
                        style={{
                            position: "absolute",
                            marginTop: "5px",
                        }}
                    >
                        {params.row.canBeAssignedUsersObjects.map((user) => {
                            if (user.name === params.row.assigneeUserNameObject.name) {
                                return null;
                            } else {
                                return <Dropdown.Item
                                    eventKey={user.id}
                                    onClick={() =>
                                        handleUpdateTask(
                                            params.row.id,
                                            user.id,
                                            loggedInUser.id
                                        )
                                    }
                                >
                                    {user.name}
                                </Dropdown.Item>;
                            }
                        })}
                    </DropdownButton>
                ) : (
                    <DropdownButton
                        as={ButtonGroup}
                        key={0}
                        id={`dropdown-button-drop-0`}
                        size="sm"
                        variant="secondary"
                        title={params.row.assigneeUserNameObject.name}
                        style={{
                            position: "absolute",
                            marginTop: "5px",
                        }}
                    >
                        {params.row.canBeAssignedUsersObjects.map((user) => {
                            if (user.name === params.row.assigneeUserNameObject.name) {
                                return null;
                            } else {
                                return <Dropdown.Item
                                    eventKey={user.id}
                                    onClick={() =>
                                        handleUpdateTask(
                                            params.row.id,
                                            user.id,
                                            loggedInUser.id
                                        )
                                    }
                                >
                                    {user.name}
                                </Dropdown.Item>;
                            }
                        })}
                    </DropdownButton>
                ),
        },
        {
            field: "deadline",
            headerName: "Deadline",
            width: 100,
            valueFormatter: (params) => {
                return format(new Date(params), "dd.MM. yyyy");
            },
        },
        {
            field: "state",
            headerName: "State",
            width: 130,
            renderCell: (params) => (
                <span
                    style={{
                        backgroundColor: getColorForState(params.value),
                        padding: "5px 5px 5px 5px",
                    }}
                >
                    {params.value}
                </span>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            width: 200,
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

    const getTreeDataPath = (row) => row.hierarchy;

    const groupingColDef = {
        headerName: <Icon path={mdiSitemapOutline} size={1} color={"blue"} />,
        width: 20
    };

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
                    <Button
                        variant="success"
                        onClick={() => setShowTaskForm({})}
                    >
                        <Icon
                            path={mdiPlusBoxOutline}
                            size={1}
                            color={"white"}
                        />{" "}
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
                    <DataGridPro
                        treeData
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.id} // Specify the unique field for row ID
                        pageSizeOptions={[12, 25, 50, 100]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 12 } },
                        }}
                        getTreeDataPath={getTreeDataPath}
                        groupingColDef={groupingColDef}
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

function modifyHierarchy(list) {
    let nameCounts = {};

    for (let i = 0; i < list.length; i++) {
        let name = list[i].name;

        if (name in nameCounts) {
            nameCounts[name]++;
        } else {
            nameCounts[name] = 1;
        }

        if (nameCounts[name] > 1) {
            if (list[i].projectId) {
                list[i].hierarchy[1] = name + ` (${nameCounts[name]})`;
            } else {
                list[i].hierarchy[0] = name + ` (${nameCounts[name]})`;
            }
        }
    }

    return list;
}

export default Dashboard;
