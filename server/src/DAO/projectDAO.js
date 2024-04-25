const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const projectFolderPath = path.join(__dirname, "storage", "projectList");

// Method to read a task from a file
function get(projectId) {
  try {
    const filePath = path.join(projectFolderPath, `${projectId}.json`);
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw { code: "failedToReadProject", message: error.message };
  }
}

// Method to write an note to a file
function create(project) {
  try {
    project.id = crypto.randomBytes(16).toString("hex");
    const filePath = path.join(projectFolderPath, `${project.id}.json`);
    const fileData = JSON.stringify(project);
    fs.writeFileSync(filePath, fileData, "utf8");
    return project;
  } catch (error) {
    throw { code: "failedToCreateProject", message: error.message };
  }
}

// Method to update note in a file
function update(project) {
  try {
    const currentProject = get(project.id);
    if (!currentProject) return null;
    const newProject = { ...currentProject, ...project };
    const filePath = path.join(projectFolderPath, `${project.id}.json`);
    const fileData = JSON.stringify(newProject);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newProject;
  } catch (error) {
    throw { code: "failedToUpdateProject", message: error.message };
  }
}

// Method to remove an note from a file
function remove(projectId) {
  try {
    const filePath = path.join(projectFolderPath, `${projectId}.json`);
    fs.unlinkSync(filePath);
    return {};
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw { code: "failedToRemoveProject", message: error.message };
  }
}

// Method to list notes in a folder
function list() {
  try {
    const files = fs.readdirSync(projectFolderPath);
    const projectList = files.map((file) => {
      const fileData = fs.readFileSync(path.join(projectFolderPath, file), "utf8");
      return JSON.parse(fileData);
    });
    return projectList;
  } catch (error) {
    throw { code: "failedToListProjects", message: error.message };
  }
}

module.exports = {
  get,
  create,
  update,
  remove,
  list,
};