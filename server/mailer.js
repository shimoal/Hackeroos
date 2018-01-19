const nodemailer = require('nodemailer');
const mail_auth = require('api_data');

var mailer = function(emails, roomNum) {
  var receivers = emails.join(', ');

  var html = '<h1>Hello from hackeroo!</h1><p> You are receiving this message because you are about to connect with another hacker. <br>Your room number is: <b>' + roomNum + '</b>.<br>Please visit https://hackeroos.herokuapp.com/collaborate and enter this roomNum to enter and immediately be connected. <br><br><br>Happy Hacking!<br>-The team at Hackeroo</p>';

  var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: mail_auth.email_user,
      pass: mail_auth.email_pass
    }
  });

  // setup email data with unicode symbols
  var mailOptions = {
      from: '"Hackeroo" <hackerooxyz@gmail.com>', // sender address
      to: receivers, // list of receivers
      subject: 'Room created', // Subject line
      text: '', // plain text body
      html: html // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log('There was an error sending mail: ', error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

module.exports = mailer;

