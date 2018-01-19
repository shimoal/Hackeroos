var accountSid = 'ACa9a76148f525eea097b29b1c3a888000';
var authToken = '66b76d4b1a429e89a6551550d5e3d176'; 
var hackerooPhoneNumber = require('./hiddenConsts').phone_number;

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