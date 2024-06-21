import { useContext, useState, useEffect } from "react";
import { TaskContext } from "./TaskContext.js";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";
import { UserContext } from "./UserContext.js";

function TaskForm({ setShowTaskForm, task }) {
    const { loggedInUser } = useContext(UserContext);
    const { state, handlerMapTask } = useContext(TaskContext);
    const [showAlert, setShowAlert] = useState(null);
    const [selectedProject, setSelectedProject] = useState(task?.projectId || "");
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedAssigneeUser, setSelectedAssigneeUser] = useState(task?.assigneeUser || "");
    const [availableAssigneeUsers, setAvailableAssigneeUsers] = useState([]);
    const [selectedState, setSelectedState] = useState(task?.state || "");
    const isPending = state === "pending";

    // Fetch projects and assignee users on mount
    useEffect(() => {
        fetch(`http://localhost:8000/api/project/getTasksAndProjectsOnUser/${loggedInUser.id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const projects = data.filter((x) => !x.projectId);
                setAvailableProjects(projects);

                // Set initial assignee users if project is pre-selected
                if (task.projectId) {
                    const selectedProjectObj = projects.find(item => item.id === task.projectId);
                    setAvailableAssigneeUsers(selectedProjectObj?.canBeAssignedUsersObjects || []);
                }
            })
            .catch(error => console.log(error));
    }, [loggedInUser.id, task.projectId]);

    // Update available assignee users when selected project changes
    useEffect(() => {
        if (selectedProject) {
            const selectedProjectObj = availableProjects.find(item => item.id === selectedProject);
            setAvailableAssigneeUsers(selectedProjectObj?.canBeAssignedUsersObjects || []);
        } else {
            setAvailableAssigneeUsers([]);
        }
        if (task.projectId === selectedProject) {
            setSelectedAssigneeUser(task.assigneeUser);
        } else {
            setSelectedAssigneeUser("");
        }
    }, [selectedProject, availableProjects, task.assigneeUser]);

    return (
        <Modal show={true} onHide={() => setShowTaskForm(false)} size="lg">
            <Form
                onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    var formData = Object.fromEntries(new FormData(e.target));
                    // formData.date = new Date(formData.date).toISOString();
                    try {
                        formData.estimate = parseInt(formData.estimate);
                        formData.worked = formData.worked ? parseInt(formData.worked) : 0;
                        formData.projectId = selectedProject;
                        formData.assigneeUser = selectedAssigneeUser;
                        if (selectedState) {
                            formData.state = selectedState;
                        }
                        if (task.id) {
                            await handlerMapTask.handleUpdate(formData, task.id, loggedInUser.id);
                        } else {
                            formData.createdBy = loggedInUser.id;
                            await handlerMapTask.handleCreate(formData);
                        }

                        setShowTaskForm(false);
                    } catch (e) {
                        console.error(e);
                        setShowAlert(e.message);
                    }
                }}
            >
                <Modal.Header>
                    <Modal.Title>{`${
                        task.id ? "Edit" : "Create"
                    } task`}</Modal.Title>
                    <CloseButton onClick={() => setShowTaskForm(false)} />
                </Modal.Header>
                <Modal.Body style={{ position: "relative" }}>
                    <Alert
                        show={!!showAlert}
                        variant="danger"
                        dismissible
                        onClose={() => setShowAlert(null)}
                    >
                        <Alert.Heading>
                            Failed to create a task
                        </Alert.Heading>
                        <pre>{showAlert}</pre>
                    </Alert>

                    {isPending ? (
                        <div style={pendingStyle()}>
                            <Icon path={mdiLoading} size={2} spin />
                        </div>
                    ) : null}

                    <Row className="mb-3">
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                // required
                                defaultValue={task.name}
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Project</Form.Label>
                            <Form.Select
                                value={selectedProject}
                                onChange={(e) => {
                                    setSelectedProject(e.target.value);
                                }}
                            >
                                <option value="">Select project</option>
                                {availableProjects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control
                                type="date"
                                name="deadline"
                                // required
                                defaultValue={
                                    (task && task.deadline) ? eventDateToInput(task.deadline) : null
                                }
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Assignee user</Form.Label>
                            <Form.Select
                                value={selectedAssigneeUser}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setSelectedAssigneeUser(e.target.value);
                                }}
                            >
                                <option value="">Select assignee user</option>
                                {availableAssigneeUsers.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} {user.surname}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>State</Form.Label>
                            <Form.Select
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                }}
                            >
                                <option value="">Select state</option>
                                <option key={1} value={"TODO"}>
                                    TODO
                                </option>
                                <option key={2} value={"INPROGRESS"}>
                                    INPROGRESS
                                </option>
                                <option key={3} value={"DONE"}>
                                    DONE
                                </option>
                                <option key={4} value={"CANCELLED"}>
                                    CANCELLED
                                </option>
                                <option key={5} value={"REVIEW"}>
                                    REVIEW
                                </option>
                            </Form.Select>
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Estimate</Form.Label>
                            <Form.Control
                                type="number"
                                name="estimate"
                                // required
                                defaultValue={parseInt(task.estimate)}
                            />
                        </Form.Group>
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Worked</Form.Label>
                            <Form.Control
                                type="number"
                                name="worked"
                                // required
                                defaultValue={parseInt(task.worked)}
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                type="textarea"
                                name="description"
                                style={{ height: "100px" }}
                                maxLength={500}
                                // required
                                defaultValue={task.description}
                            />
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowTaskForm(false)}
                        disabled={isPending}
                    >
                        Close
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isPending}
                    >
                        {task.id ? "Edit" : "Create"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

function pendingStyle() {
    return {
        position: "absolute",
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        opacity: "0.5",
    };
}

const eventDateToInput = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default TaskForm;
