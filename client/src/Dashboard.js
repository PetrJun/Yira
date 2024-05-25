import { useContext, useState } from "react";
// import { TasksAndProjectsOnUserContext } from "./TasksAndProjectsOnUserContext.js";
import { UserContext } from "./UserContext.js";

import Button from "react-bootstrap/esm/Button.js";

// import EventCard from "./EventCard";
import TaskForm from "./TaskForm.js";
import ProjectForm from "./ProjectForm.js";
import Container from "react-bootstrap/esm/Container.js";

import Icon from "@mdi/react";
import { mdiPlusBoxOutline } from "@mdi/js";

function Dashboard() {
    // const { tasksAndProjectsOnUser } = useContext(TasksAndProjectsOnUserContext);
    const { loggedInUser } = useContext(UserContext);

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [showProjectForm, setShowProjectForm] = useState(false);

    const canCreateProject = loggedInUser?.role === "projectManager" ? false : true;

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
                <Button variant="success" onClick={() => setShowProjectForm({})} disable={canCreateProject} style={{backgroundColor: canCreateProject ? "#D7FFE4" : null, color: canCreateProject ? "black" : null}}>
                    <Icon path={mdiPlusBoxOutline} size={1} color={"white"} />{" "}
                    New project
                </Button>
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
                    setShowEventForm={showProjectForm}
                />
            ) : null}
            {/* {filteredEventList.map((event) => {
                return (
                    <EventCard
                        key={event.id}
                        event={event}
                        setShowEventForm={setShowEventForm}
                        setShowConfirmDeleteDialog={setShowConfirmDeleteDialog}
                    />
                );
            })} */}
            dashboard
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
