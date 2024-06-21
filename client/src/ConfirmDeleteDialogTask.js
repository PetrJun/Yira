import { useContext, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import Alert from "react-bootstrap/Alert";
import { UserContext } from "./UserContext.js";
import Icon from "@mdi/react";
import { mdiLoading } from "@mdi/js";
import { useNavigate } from "react-router-dom";
import { TaskContext } from "./TaskContext.js";

function ConfirmDeleteDialogTask({ setShowConfirmDeleteDialog, task }) {
  const { state, handlerMapTask } = useContext(TaskContext);
  const { loggedInUser } = useContext(UserContext);
  const [showAlert, setShowAlert] = useState(null);
  const isPending = state === "pending";
  const navigate = useNavigate();

  return (
    <Modal show={true} onHide={() => setShowConfirmDeleteDialog(false)}>
      <Modal.Header>
        <Modal.Title>Delete task</Modal.Title>
        <CloseButton onClick={() => setShowConfirmDeleteDialog(false)} />
      </Modal.Header>
      <Modal.Body style={{ position: "relative" }}>
        <Alert
          show={!!showAlert}
          variant="danger"
          dismissible
          onClose={() => setShowAlert(null)}
        >
          <Alert.Heading>Failed to delete task</Alert.Heading>
          <pre>{showAlert}</pre>
        </Alert>
        {isPending ? (
          <div style={pendingStyle()}>
            <Icon path={mdiLoading} size={2} spin />
          </div>
        ) : null}
        Do you really want to delete the task: {task.name}?
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowConfirmDeleteDialog(false)}
          disabled={isPending}
        >
          Close
        </Button>
        <Button
          variant="danger"
          disabled={isPending}
          onClick={async (e) => {
            try {
              await handlerMapTask.handleDelete(task.id, loggedInUser.id);
              setShowConfirmDeleteDialog(false);
              navigate("/");
            } catch (e) {
              console.error(e);
              setShowAlert(e.message);
            }
          }}
        >
          Delete
        </Button>
      </Modal.Footer>
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

export default ConfirmDeleteDialogTask;