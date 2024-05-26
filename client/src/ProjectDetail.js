import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useLocation } from "react-router-dom";


function ProjectDetail() {
    const { loggedInUser } = useContext(UserContext);
    const location = useLocation();

    const [projectInfo, setProjectInfo] = useState({});
    const [taskList, setTaskList] = useState([]);

    useEffect(() => {
        fetch(
            `http://localhost:8000/api/project/get/${new URLSearchParams(location.search).get("id")}`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setProjectInfo(data);
            })
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {
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
                let projectId = new URLSearchParams(location.search).get("id");
                setTaskList(data.filter((task) => task.projectId === projectId));
            })
            .catch((error) => console.log(error));
    }, [projectInfo, loggedInUser]);
    
    useEffect(() => {
        setProjectInfo({...projectInfo, taskList: taskList})
    }, [taskList]);

    return <p>{projectInfo && projectInfo.name}, {taskList.length > 0 && taskList.map((task) => {return task.name})}</p>;
}

export default ProjectDetail;
