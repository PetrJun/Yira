import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Dashboard from "./Dashboard";
import UserProvider from "./UserProvider";
import TaskProvider from "./TaskProvider";
import ProjectProvider from "./ProjectProvider";
import ProjectDetail from "./ProjectDetail";

function App() {
    return (
        <div style={componentStyle()}>
            <UserProvider>
                <ProjectProvider>
                    <TaskProvider>
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<Dashboard />} />
                                    <Route
                                        path="project"
                                        element={<ProjectDetail />}
                                    />
                                    <Route path="task" element={<p>task</p>} />
                                    <Route path="*" element={"not found"} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </TaskProvider>
                </ProjectProvider>
            </UserProvider>
        </div>
    );
}

function componentStyle() {
    return {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "#B9D9EB",
    };
}

export default App;