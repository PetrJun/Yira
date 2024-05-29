import { useState } from "react";
import { TaskContext } from "./TaskContext.js";

function TaskProvider({ children }) {
    const [taskObject, setTaskObject] = useState({
        state: "ready",
        error: null,
        data: null,
    });

    //   useEffect(() => {
    //     handleLoad();
    //   }, []);

    //   async function handleLoad() {
    //     setEventLoadObject((current) => ({ ...current, state: "pending" }));
    //     const response = await fetch(`http://localhost:8000/event/list`, {
    //       method: "GET",
    //     });
    //     const responseJson = await response.json();
    //     if (response.status < 400) {
    //       setEventLoadObject({ state: "ready", data: responseJson });
    //       return responseJson;
    //     } else {
    //       setEventLoadObject((current) => ({
    //         state: "error",
    //         data: current.data,
    //         error: responseJson.error,
    //       }));
    //       throw new Error(JSON.stringify(responseJson, null, 2));
    //     }
    //   }

    async function handleCreate(dtoIn) {
        setTaskObject((current) => ({ ...current, state: "pending" }));
        const response = await fetch(`http://localhost:8000/api/task/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dtoIn),
        });
        const responseJson = await response.json();

        if (response.status < 400) {
            setTaskObject((current) => {
                current.data = responseJson;
                return { state: "ready", data: current.data };
            });
            return responseJson;
        } else {
            setTaskObject((current) => {
                return {
                    state: "error",
                    data: current.data,
                    error: responseJson,
                };
            });
            throw new Error(JSON.stringify(responseJson, null, 2));
        }
    }

    async function handleUpdate(dtoIn, taskId, userId) {
        setTaskObject((current) => ({ ...current, state: "pending" }));
        const response = await fetch(
            `http://localhost:8000/api/task/update/${taskId}/${userId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dtoIn),
            }
        );
        const responseJson = await response.json();

        if (response.status < 400) {
            setTaskObject((current) => {
                current.data = responseJson;
                return { state: "ready", data: current.data };
            });
            return responseJson;
        } else {
            setTaskObject((current) => {
                return {
                    state: "error",
                    data: current.data,
                    error: responseJson,
                };
            });
            throw new Error(JSON.stringify(responseJson, null, 2));
        }
    }

    async function handleUpdateAssigneeUser(taskId, assigneeUserId, userId) {
        setTaskObject((current) => ({ ...current, state: "pending" }));
        const response = await fetch(
            `http://localhost:8000/api/task/updateAssigneeUser/${taskId}/${assigneeUserId}/${userId}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );
        const responseJson = await response.json();

        if (response.status < 400) {
            setTaskObject((current) => {
                current.data = responseJson;
                return { state: "ready", data: current.data };
            });
            return responseJson;
        } else {
            setTaskObject((current) => {
                return {
                    state: "error",
                    data: current.data,
                    error: responseJson,
                };
            });
            throw new Error(JSON.stringify(responseJson, null, 2));
        }
    }

    async function handleDelete(taskId, userId) {
        setTaskObject((current) => ({ ...current, state: "pending" }));
        const response = await fetch(
            `http://localhost:8000/api/task/delete/${taskId}/${userId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const responseJson = await response.json();

        if (response.status < 400) {
            setTaskObject((current) => {
                current.data = responseJson;
                return { state: "ready", data: current.data };
            });
            return responseJson;
        } else {
            setTaskObject((current) => {
                return {
                    state: "error",
                    data: current.data,
                    error: responseJson,
                };
            });
            throw new Error(JSON.stringify(responseJson, null, 2));
        }
    }

    const value = {
        state: taskObject.state,
        task: taskObject.data || {},
        handlerMapTask: { handleCreate, handleUpdate, handleDelete, handleUpdateAssigneeUser },
    };

    return (
        <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
    );
}

export default TaskProvider;
