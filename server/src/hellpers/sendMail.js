const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const createTaskNotfication = path.join(
    __dirname,
    "../templates/createTaskNotfication.html"
);
const deletedTaskNotification = path.join(
    __dirname,
    "../templates/deletedTaskNotification.html"
);
const updateTaskNotfication = path.join(
    __dirname,
    "../templates/updateTaskNotfication.html"
);
const updateTaskNameNotfication = path.join(
    __dirname,
    "../templates/updateTaskNameNotfication.html"
);
// more templates

const transporter = nodemailer.createTransport({
    host: "smtp.seznam.cz",
    port: 465,
    secure: true,
    auth: {
        user: "testYira@seznam.cz",
        pass: "Mekki123",
    },
});

function sendMail(sendReq, template) {
    fs.readFile(createEmailTemplate(template), "utf8", (err, data) => {
        if (err) {
            console.error("Error reading HTML template:", err);
            res.status(500).send("Error reading HTML template");
            return;
        }

        let mailOptions = createDataForMailDistribution(sendReq, data);

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
                a++;
            }
        });
    });
}

function createEmailTemplate(template) {
    let emailTemplate;

    switch (template) {
        case "createTaskNotfication":
            emailTemplate = createTaskNotfication;
            break;
        case "deletedTaskNotification":
            emailTemplate = deletedTaskNotification;
            break;
        case "updateTaskNotfication":
            emailTemplate = updateTaskNotfication;
            break;
        case "updateTaskNameNotfication":
            emailTemplate = updateTaskNameNotfication;
            break;
    }

    return emailTemplate;
}

function createDataForMailDistribution(sendReq, template) {
    const sender = sendReq.sender;
    const recipient = sendReq.recipient;
    const recipientMail = sendReq.recipientMail;
    const taskId = sendReq.taskId;
    const taskName = sendReq.taskName;
    const taskNameNew = sendReq.taskNameNew;

    let htmlTemplate, subject;

    // Nahrazení placeholders v HTML šabloně
    if (template == "createTaskNotfication") {
        htmlTemplate = data
            .replace("{{recipient}}", recipient)
            .replace("{{sender}}", sender)
            .replace("{{taskId}}", taskId);
        subject = "Novy task";
    } else if (template == "deletedTaskNotification") {
        htmlTemplate = data
            .replace("{{recipient}}", recipient)
            .replace("{{sender}}", sender)
            .replace("{{taskName}}", taskName);
        subject = "Smazan task";
    } else if (template == "updateTaskNotfication") {
        htmlTemplate = data
            .replace("{{recipient}}", recipient)
            .replace("{{taskName}}", taskName)
            .replace("{{taskId}}", taskId);
        subject = "Aktualizovan task";
    } else if (template == "updateTaskNameNotfication") {
        htmlTemplate = data
            .replace("{{recipient}}", recipient)
            .replace("{{taskName}}", taskName)
            .replace("{{taskNameNew}}", taskNameNew)
            .replace("{{taskId}}", taskId);
        subject = "Aktualizovan nazev tasku";
    }

    return {
        from: "testYira@seznam.cz",
        to: recipientMail,
        subject: subject,
        html: htmlTemplate,
    };
}

module.exports = sendMail;
