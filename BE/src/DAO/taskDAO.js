"use strict";
const fs = require("fs");
const path = require("path");

// load promise api for reading and writing file
const rf = fs.promises.readFile;
const wf = fs.promises.writeFile;

// specify the default location of json file where the data should be stored
const DEFAULT_STORAGE_PATH = path.join(__dirname, "./storage/tasks.json");

class TaskDao {
  // initialize new instance of LibraryDao, path the the file is stored on instance
  constructor() {
    this.taskStoragePath = DEFAULT_STORAGE_PATH;
  }

  // returns book or undefined
  async getTask(id) {
    let tasks = await this._loadAllTasks();

    const result = tasks.find(b => {
      return b.id === id;
    });

    return result;
  }

 async addTask(task) {
    const tasks = await this._loadAllTasks();
    tasks.push(task);

    try {
      await wf(this._getStorageLocation(), JSON.stringify(tasks, null, 2));
      return { status: "OK", data: task };
    } catch (e) {
      return { status: "ERROR", error: e };
    }
  }

  // Loads JSON file as string which is then parsed to the JS Object
  async _loadAllTasks() {
    let tasks;
    try {
      tasks = JSON.parse(await rf(this._getStorageLocation()));
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.info("No storage found, initializing new one...");
        tasks = [];
      } else {
        throw new Error("Unable to read from storage. Wrong data format. " + this._getStorageLocation());
      }
    }
    return tasks;
  }

  // returns the storage location which is stored on instance
  _getStorageLocation() {
    return this.taskStoragePath;
  }
}

module.exports = new TaskDao();