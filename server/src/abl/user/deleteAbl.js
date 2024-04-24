const userDao = require("../../DAO/userDAO.js");
const taskDao = require("../../DAO/taskDAO.js");


async function DeleteAbl(req, res) {
  try {
    const { id } = req.params;

    // TODO: Task and Project 
    // const attendanceMap = attendanceDao.userMap();
    // if (attendanceMap[id]) {
    //   res.status(400).json({
    //     code: "userHasAttendances",
    //     message: `User ${reqParams.id} has attendances`,
    //   });
    //   return;
    // }

    userDao.remove(id);

    res.json({});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = DeleteAbl;