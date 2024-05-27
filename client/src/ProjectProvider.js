import { useState } from "react";
import { ProjectContext } from "./ProjectContext.js";

function ProjectProvider({ children }) {
  const [projectObject, setProjectObject] = useState({
    state: "ready",
    error: null,
    data: null,
  });

  async function handleCreate(dtoIn) {
    setProjectObject((current) => ({ ...current, state: "pending" }));
    const response = await fetch(`http://localhost:8000/api/project/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dtoIn),
    });
    const responseJson = await response.json();

    if (response.status < 400) {
        setProjectObject((current) => {
        current.data = responseJson;
        return { state: "ready", data: current.data };
      });
      return responseJson;
    } else {
        setProjectObject((current) => {
        return { state: "error", data: current.data, error: responseJson };
      });
      throw new Error(JSON.stringify(responseJson, null, 2));
    }
  }

  async function handleUpdate(dtoIn, projectId, userId) {
    setProjectObject((current) => ({ ...current, state: "pending" }));
    const response = await fetch(`http://localhost:8000/api/project/update/${projectId}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dtoIn),
    });
    const responseJson = await response.json();

    if (response.status < 400) {
        setProjectObject((current) => {
        current.data = responseJson;
        return { state: "ready", data: current.data };
      });
      return responseJson;
    } else {
        setProjectObject((current) => {
        return { state: "error", data: current.data, error: responseJson };
      });
      throw new Error(JSON.stringify(responseJson, null, 2));
    }
  }

  const value = {
    state: projectObject.state,
    project: projectObject.data || [] || {},
    handlerMapProject: { handleCreate, handleUpdate },
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export default ProjectProvider;