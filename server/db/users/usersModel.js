const Sequelize = require('sequelize');

const db = require('../database.js');
//create schema
const User = db.define('user', {
  name: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  github_id: {
    type: Sequelize.STRING,
    unique: true
  },
  profile_img: {
    type: Sequelize.STRING,
  },
  description: {
    type: Sequelize.STRING,
    unique: true
  },
});

db.sync()
// .then(function() {
//   return User.bulkCreate([{
//     name: 'Ai',
//     email: 'ai@example.com',
//     github_id: '1111',
//     profile_img: "This is Ai's image",
//     description: "Ai's description"
//   },{
//     name: 'Hanyen',
//     email: 'Hanyen@example.com',
//     github_id: '2222',
//     profile_img: "This is Hanyen's image",
//     description: "Hanyen's description"
//   },{
//     name: 'Alison',
//     email: 'Alison@example.com',
//     github_id: '3333',
//     profile_img: "This is Alison's image",
//     description: "Alison's description"
//   },{
//     name: 'Max',
//     email: 'Max@example.com',
//     github_id: '4444',
//     profile_img: "This is Max's image",
//     description: "Max's description"
//   }])
// })
// .then(function() {
//   User.findAll()
//   .then(function(users) {
//     users.forEach(function(user) {
//       console.log(user.get());
//     });
//     console.log("************ create user successfully *************")
//   });
// })
// .catch(function(err) {
//   console.log('err in bulkCreate users');
// });

module.exports = User;

