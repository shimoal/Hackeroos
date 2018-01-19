var twilio_account_data = require('./api_data');

var accountSid = twilio_account_data.account_sid;
var authToken = twilio_account_data.auth_token; 
var hackerooPhoneNumber = twilio_account_data.phone_number;

var twilio = require('twilio');
var client = new twilio(accountSid, authToken);



var sendText = function(roomNum, phoneNumbers) {
var message = 'Hello from hackeroo! You are receiving this message because you are about to connect with another hacker. ' +
              'Your room number is: ' + roomNum + 'Please visit https://hackeroos.herokuapp.com/collaborate and enter this ' +
              'room number';
  
  phoneNumbers.forEach(function(phoneNumber) {
    client.messages.create({
      body: message,
      to: phoneNumber1,  
      from: hackerooPhoneNumber 
    })
    .then((message) => console.log(message))
    .catch((err) => console.log(err));
  });
}

module.exports = sendText;