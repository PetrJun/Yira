import { useContext, useState, useEffect } from "react";

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
import { ProjectContext } from "./ProjectContext.js";

function ProjectForm({ setShowProjectForm, project }) {
    const { userList, loggedInUser } = useContext(UserContext);
    const { state, handlerMapProject } = useContext(ProjectContext);
    const [showAlert, setShowAlert] = useState(null);

    const [selectedAssigneeUser, setSelectedAssigneeUser] = useState("");
    const [selectedState, setSelectedState] = useState("");

    const isPending = state === "pending";

    const [users, setUsers] = useState([]);
    const [newUserValue, setNewUserValue] = useState("");

    const handleAddUser = () => {
        if (newUserValue.trim() !== "") {
            setUsers(
                [...users, newUserValue].filter((value, index, self) => {
                    return self.indexOf(value) === index;
                })
            );
            setNewUserValue("");
        }
    };
    const handleDeleteUser = (userIdToDelete) => {
        setUsers(users.filter((userId) => userId !== userIdToDelete));
    };

    useEffect(() => {
        if (!users.includes(loggedInUser.id)) {
            setUsers([...users, loggedInUser.id]);
        }
    }, [users, loggedInUser]);

    return (
        <Modal show={true} onHide={() => setShowProjectForm(false)} size="lg">
            <Form
                onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    var formData = Object.fromEntries(new FormData(e.target));
                    // formData.date = new Date(formData.date).toISOString();
                    try {
                        formData.createdBy = loggedInUser.id;
                        formData.estimate = parseInt(formData.estimate);
                        formData.worked = formData.worked
                            ? parseInt(formData.worked)
                            : 0;
                        formData.assigneeUser = selectedAssigneeUser;
                        formData.userList = users;
                        if (project.id) {
                            formData.id = project.id;
                            await handlerMapProject.handleUpdate(formData);
                        } else {
                            await handlerMapProject.handleCreate(formData);
                        }

                        setShowProjectForm(false);
                    } catch (e) {
                        console.error(e);
                        setShowAlert(e.message);
                    }
                }}
            >
                <Modal.Header>
                    <Modal.Title>{`${
                        project.id ? "Edit" : "Create"
                    } project`}</Modal.Title>
                    <CloseButton onClick={() => setShowProjectForm(false)} />
                </Modal.Header>
                <Modal.Body style={{ position: "relative" }}>
                    <Alert
                        show={!!showAlert}
                        variant="danger"
                        dismissible
                        onClose={() => setShowAlert(null)}
                    >
                        <Alert.Heading>
                            Nepodařilo se vytvořit project
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
                                defaultValue={project.name}
                            />
                        </Form.Group>
                    </Row>
                    <Row className="mb-3">
                        <Form.Group
                            as={Col}
                            className="mb-3"
                            controlId="formBasicEmail"
                        >
                            <Form.Label>Users on project</Form.Label>
                            <Form.Select
                                value={newUserValue}
                                onChange={(e) => {
                                    console.log(e.target.value);
                                    setNewUserValue(e.target.value);
                                }}
                            >
                                <option value="">
                                    Select users on project
                                </option>
                                {userList.map((user) => (
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
                            <Button variant="primary" onClick={handleAddUser}>
                                Add user
                            </Button>
                        </Form.Group>
                        {userList
                            .filter((user) => users.includes(user.id))
                            .map((user) => (
                                <Row className="mb-3">
                                    <Col md={8}>
                                        <p
                                            key={user.id}
                                            style={{
                                                backgroundColor: "lightblue",
                                                textAlign: "center",
                                            }}
                                        >
                                            <b>
                                                {user.name} {user.surname}
                                            </b>
                                        </p>
                                    </Col>
                                    <Col md={4}>
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                            style={{ display: "flex" }}
                                        >
                                            Delete
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
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
                                {userList
                                    .filter((user) => users.includes(user.id))
                                    .map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} {user.surname}
                                        </option>
                                    ))
                                }
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
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control
                                type="date"
                                name="deadline"
                                // required
                                defaultValue={
                                    project.date
                                        ? eventDateToInput(project.deadline)
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
                            <Form.Label>Estimate</Form.Label>
                            <Form.Control
                                type="number"
                                name="estimate"
                                // required
                                defaultValue={parseInt(project.estimate)}
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
                                defaultValue={parseInt(project.estimate)}
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
                                defaultValue={project.description}
                            />
                        </Form.Group>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowProjectForm(false)}
                        disabled={isPending}
                    >
                        Zavřít
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isPending}
                    >
                        {project.id ? "Upravit" : "Vytvořit"}
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

export default ProjectForm;

{
    /* <Form.Group
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
                        </Form.Group> */
}
