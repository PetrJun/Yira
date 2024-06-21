import { useContext, useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Icon from "@mdi/react";
import { mdiLoading, mdiDeleteCircle, mdiPlusCircle } from "@mdi/js";
import { UserContext } from "./UserContext.js";
import { ProjectContext } from "./ProjectContext.js";

function ProjectForm({ setShowProjectForm, project }) {
    const { userList, loggedInUser } = useContext(UserContext);
    const { state, handlerMapProject } = useContext(ProjectContext);
    const [showAlert, setShowAlert] = useState(null);
    const [selectedAssigneeUser, setSelectedAssigneeUser] = useState(project.assigneeUser || "");
    const [selectedState, setSelectedState] = useState(project.state || "");
    const isPending = state === "pending";
    const [users, setUsers] = useState(project.userList || []);
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
                        formData.estimate = parseInt(formData.estimate);
                        formData.worked = formData.worked
                            ? parseInt(formData.worked)
                            : 0;
                        formData.assigneeUser = selectedAssigneeUser;
                        formData.userList = users;
                        if (selectedState) {
                            formData.state = selectedState;
                        }
                        if (project.id) {
                            await handlerMapProject.handleUpdate(formData, project.id, loggedInUser.id);
                        } else {
                            formData.createdBy = loggedInUser.id;
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
                            Failed to create a project
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
                                <Icon path={mdiPlusCircle } size={1} color={"white"} />{" "}
                                Add user
                            </Button>
                        </Form.Group>
                        {userList
                            .filter((user) => users.includes(user.id))
                            .map((user) => (
                                <Row className="mb-3" key={user.id}>
                                    <Col md={8} key={user.id}>
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
                                    <Col md={4} key={user.id + "123"}>
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                handleDeleteUser(user.id)
                                            }
                                            style={{ display: "flex" }}
                                        >
                                            <Icon path={mdiDeleteCircle} size={1} color={"white"} />{" "}
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
                            <Form.Label>Deadline</Form.Label>
                            <Form.Control
                                type="date"
                                name="deadline"
                                // required
                                defaultValue={
                                    (project && project.deadline) ? eventDateToInput(project.deadline) : null
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
                                defaultValue={parseInt(project.worked)}
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
                        Close
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isPending}
                    >
                        {project.id ? "Edit" : "Create"}
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

export default ProjectForm;