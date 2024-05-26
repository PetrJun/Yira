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

    const [selectedProject, setSelectedProject] = useState("");
    const [availableProjects, setAvailableProjects] = useState([]);
    const [selectedAssigneeUser, setSelectedAssigneeUser] = useState("");
    const [availableAssigneeUsers, setAvailableAssigneeUsers] = useState([]);

    const [selectedState, setSelectedState] = useState("");

    const isPending = state === "pending";

    // Kdykoliv se změní vybraná kategorie, aktualizují se dostupné položky
    useEffect(() => {
        if (selectedProject) {
            const selectedProjectObj = availableProjects.find(
                (item) => item.id === selectedProject
            );
            if (selectedProjectObj) {
                setAvailableAssigneeUsers(
                    selectedProjectObj.canBeAssignedUsersObjects || []
                );
            } else {
                setAvailableAssigneeUsers([]);
            }
        } else {
            setAvailableAssigneeUsers([]);
        }
        setSelectedAssigneeUser(""); // Reset druhého comboboxu
    }, [selectedProject, availableProjects]);

    useEffect(() => {
        fetch(`http://localhost:8000/api/project/getTasksAndProjectsOnUser/${loggedInUser.id}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            setAvailableProjects(data.filter((x) => !x.projectId));
          })
          .catch(error => console.log(error));
      }, []);

    return (
        <Modal show={true} onHide={() => setShowTaskForm(false)} size="lg">
            <Form
                onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    var formData = Object.fromEntries(new FormData(e.target));
                    // formData.date = new Date(formData.date).toISOString();
                    try {
                        formData.createdBy = loggedInUser.id;
                        formData.estimate = parseInt(formData.estimate);
                        formData.worked = formData.worked ? parseInt(formData.worked) : 0;
                        formData.projectId = selectedProject;
                        formData.assigneeUser = selectedAssigneeUser;
                        if (task.id) {
                            formData.id = task.id;
                            await handlerMapTask.handleUpdate(formData);
                        } else {
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
                            Nepodařilo se vytvořit task
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
                                    task.date
                                        ? eventDateToInput(task.deadline)
                                        : undefined
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
                                <option key={1} value={1}>
                                    TODO
                                </option>
                                <option key={2} value={2}>
                                    INPROGRESS
                                </option>
                                <option key={3} value={3}>
                                    DONE
                                </option>
                                <option key={4} value={4}>
                                    CANCELLED
                                </option>
                                <option key={5} value={5}>
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
                                defaultValue={parseInt(task.estimate)}
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
                        Zavřít
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isPending}
                    >
                        {task.id ? "Upravit" : "Vytvořit"}
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

function eventDateToInput(date) {
    date = new Date(date);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default TaskForm;
