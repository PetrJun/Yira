const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const createTaskNotfication = path.join(__dirname, '../templates/createTaskNotfication.html');

const transporter = nodemailer.createTransport({
    host: 'smtp.seznam.cz',
    port: 465,
    secure: true,
    auth: {
        user: 'testYira@seznam.cz',//phprodanose@seznam.cz
        pass: 'Mekki123'
    }
});

function sendMail(sendReq, template) {
    let emailTemplate;

    switch (template) {
        case 'createTaskNotfication':
          emailTemplate = createTaskNotfication
          break;
        case 'hodnota2':
          emailTemplate = createTaskNotfication
          break;
        default:
          emailTemplate = createTaskNotfication
      }

    fs.readFile(emailTemplate, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading HTML template:', err);
            res.status(500).send('Error reading HTML template');
            return;
        }

        const recipient = sendReq.recipient;
        const sender = sendReq.sender;
        const taskId = sendReq.taskId;

        // Nahrazení placeholders v HTML šabloně
        const htmlTemplate = data.replace('{{recipient}}', recipient)
                                .replace('{{sender}}', sender)
                                .replace('{{taskId}}', taskId);

        var mailOptions = {
            from: 'testYira@seznam.cz',
            to: 'testYira@seznam.cz',
            subject: 'Novy task',
            html: htmlTemplate
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              a++;
            }
        });
    });
};

module.exports = sendMail;