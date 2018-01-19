const User = require('./usersModel.js');
const mailer = require('./../../mailer.js');
const texter = require('./../../texter.js');

const controller = {

  save: function(user) {
    User.create({
      email: user.email,
      name: user.name,
      github_id: user.github_id,
      profile_img: user.profile_img
    })
    .then(function(task) {
      task.save();
      return 'saved';
    })
    .catch(function(err) {
      console.log('error saving user:', err);
      return 'error: ' + err;
    });
  },

  retrieve: function(req, res, next) {
    User.findOne({
      where: {
        github_id: req.session.passport.user,
      }
    })
    .then(function(user) {
      res.json(user);
    })
    .catch(function(err) {
      console.log('Error retrieving Current user', err);
      return res.sendStatus(500);
    });
  },
  
  retrievePublic: function(req, res, next) {
    User.findOne({
      where: {
        id: req.query.userId,
      }
    })
    .then(function(user) {
      res.json(user);
    })
    .catch(function(err) {
      console.log('Error retrieving User Public Profile', err);
      return res.sendStatus(500);
    });
  },
  
  retrieveAll: function(req, res, next) {
    User.findAll()
    .then(function(users) {
      res.json(users);
    })
    .catch(function(err) {
      console.log('Error retrieving All Users', err);
      return res.sendStatus(500);
    });
  },

  sendMail: function(userId1, userId2, roomNum){
    User.findAll({
      where: {
        $or: [{id: userId1}, {id: userId2}]
      }
    }).then(function(users) {
      // var emails = users.map(function(user) {
      //   return user.email;
      // });

      // mailer(emails, roomNum);

      var phoneNumbers = users.map(function(user) {
          return user.description;
      });

      texter(roomNum, phoneNumbers);
    }).
    catch(function(err) {
      console.log(err, ' X X X X Error retriving user emails', err);
    });
  }

};

module.exports = controller;