import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { TasksAndProjectsOnUserContext } from "./TasksAndProjectsOnUserContext.js";
import { UserContext } from "./UserContext.js";

import Button from "react-bootstrap/esm/Button.js";

// import EventCard from "./EventCard";
import TaskForm from "./TaskForm.js";
import ProjectForm from "./ProjectForm.js";
import Container from "react-bootstrap/esm/Container.js";

import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";
import { DataGrid } from '@mui/x-data-grid';
import { format } from 'date-fns';

function Dashboard() {
    // const { tasksAndProjectsOnUser } = useContext(TasksAndProjectsOnUserContext);
    const { loggedInUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [canCreateProject, setCanCreateProject] = useState(false);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (loggedInUser?.role === "projectManager") {
        setCanCreateProject(true)
      } else {
        setCanCreateProject(false)
      }
    }, [loggedInUser])

    useEffect(() => {
        if (loggedInUser && loggedInUser.id) {
            setLoading(true);
            fetch(`http://localhost:8000/api/project/getTasksAndProjectsOnUser/${loggedInUser.id}`)
                .then(response => {
                    if (!response.ok) {
                    throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setRows(data);
                    setLoading(false);
                })
                .catch(error => console.log(error));
        }
      }, [loggedInUser]);

      const getColorForState = (state) => {
        switch (state) {
          case 'DONE':
            return 'lightgreen';
          case 'INPROGRESS':
            return 'lightblue';
          case 'TODO':
            return 'lightyellow';
          case 'CANCELLED':
            return 'lightred';
          case 'REVIEW':
            return 'lightgray';
          default:
            return 'none';
        }
      };

      const columns = [
        { field: 'name', headerName: 'Name', width: 400 },
        {
          field: 'projectName',
          headerName: 'Project name',
          width: 150,
          renderCell: (params) => {
            if (params.row.projectName) {
                return <Button
                    variant="success"
                    size="small"
                    onClick={() => navigate(`/project?id=${params.row.projectId}`)}//
                >
                    {params.row.projectName}
                </Button>
            }
            return null;
          },
        },
        { field: 'assigneeUserObject', headerName: 'Assignee user', width: 200,
            renderCell: (params) => (
                <span style={{ backgroundColor: (loggedInUser && loggedInUser.id === params.row.assigneeUserNameObject.id) ? "yellow" : "none"}}>
                    {params.row.assigneeUserNameObject.name}
                </span>
            )
        },
        { field: 'deadline', headerName: 'Deadline', width: 180, valueFormatter: (params) => format(new Date(params.value), 'dd.MM. yyyy') },
        { field: 'state', headerName: 'State', width: 180,
            renderCell: (params) => (
                <span style={{ backgroundColor: getColorForState(params.value) }}>
                    {params.value}
                </span>
            )
        },
        {
          field: 'action',
          headerName: 'Action',
          width: 150,
          renderCell: (params) => (
            <Button
                variant="success"
                size="small"
                onClick={() => navigate(`/${params.row.projectName ? "task" : "project"}?id=${params.row.id}`)}
            >
                {"Detail "}{params.row.projectName ? "task" : "project"}
            </Button>
          ),
        },
      ];
    

    return (
        loggedInUser ? 
        <Container>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                }}
            >
                <Button variant="success" onClick={() => setShowTaskForm({})}>
                    <Icon path={mdiPlusBoxOutline} size={1} color={"white"} />{" "}
                    New task
                </Button>
                {canCreateProject && <Button variant="success" onClick={() => setShowProjectForm({})}>
                    <Icon path={mdiPlusBoxOutline} size={1} color={"white"} />{" "}
                    New project
                </Button>}
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
            {rows.length > 0 && 
                <div style={{ height: 750, width: '100%', marginTop:"10px", borderColor: "black", backgroundColor: "#6699CC", borderRadius: "10px" }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        getRowId={(row) => row.id} // Specify the unique field for row ID
                    />
              </div>
            }
        </Container> : 
        <div style={messageStyle}>
            Nothing here :/ please login
        </div>
    );
}

const messageStyle = {
    color: 'red',
    fontSize: '3em',
    fontWeight: 'bold',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh',
    margin: '0',
    backgroundColor: '#f0f0f0'
  };

export default Dashboard;
