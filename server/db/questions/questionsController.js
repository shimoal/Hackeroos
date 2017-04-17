const db = require('./../database.js'); //for raw sql query
const Question = require('./questionsModel.js');
const User = require('../users/usersModel.js');
// const Claim = require('../claims/claimsModel.js');
const QuestionOneUser = require('./questionsUserSpecificModel.js');

const controller = {
  save: function(req, res, next) {
    Question.create({
      userId: req.body.userId,
      title: req.body.title,
      question: req.body.question,
      status: 'open',
    })
    .then(function(task) {
      task.save();
      res.status(200).send('Question successfully saved.');
    })
    .catch(function(err) {
      console.log('error saving question:', err);
      res.status(500).send('Having trouble saving question.');
    });
  },
  

  retrieve: function(req, res, next) {
    
    // console.log('XXX calling questionsController retrieve');
    var currentUserId = req.query.userId;
    // console.log('Current User Id to Retrieve just that users question', currentUserId);

    //retrieve all questions
    db.query('SELECT questions.id, title, question, status, deadline, questions."createdAt"::DATE, "userId", learners.name, claims.id_helper\
              FROM questions\
              INNER JOIN users AS learners ON learners.id = questions."userId"\
              LEFT OUTER JOIN claims ON claims.id_question = questions.id\
              ORDER BY questions.id DESC', { model: Question })
    .then(function(questions) {
      // console.log('XXX question RAW results', questions);
      var promises = questions.map(function(question) {
        // console.log('XXX each question', question);
        return {
          'id': question.id,
          'title': question.title,
          'question': question.question,
          'status': question.status,
          'deadline': '',
          'userId': question.userId,
          'name': question.name,
          'createdAt': question.createdAt,
          'helperId': question.id_helper,
        };
      });
      Promise.all(promises).then(function() {
        res.send(promises);
      });
    })
    .catch(function(err) {
      console.log('Error getting questions', err);
      return res.sendStatus(500);
    });
  },

  search: function(req, res) {
    console.log('inside search: ', req.query);
    var term = req.query.term || '';
    db.query('SELECT * FROM questions WHERE question ~ ?', {replacements: [term], model: Question })
    .then(function(questions) {
      console.log('inside query', questions);
      var promises = questions.map(function(question) {
        console.log('inside promises:', question);
        return {
          'id': question.id,
          'title': question.title,
          'question': question.question,
          'status': question.status,
          'deadline': '',
          'userId': question.userId,
          'name': question.name,
          'createdAt': question.createdAt,
          'helperId': question.id_helper
        };
      });
      Promise.all(promises).then(function() {
        res.send(promises);
      });
    })
    .catch(function(err) {
      console.log('@_@ Error getting questions', err);
      return res.status(500).send('Having trouble retrieving questions.');
    });
  },

  // need refactor
  retrieveForOneUser: function(req, res, next) {
    var currentUserId = req.query.userId;
    // console.log('Current User Id to Retrieve just that users question', currentUserId);
    console.log('inside restrieve2 for one user:', currentUserId);
    QuestionOneUser.findAll({
      where: { userId: currentUserId, status: 'open', },
      order: [['id', 'DESC']],
    })
    .then(function(questions) {
      console.log('========== Success getting Questions for current user');
      var promises = questions.map(function(question) {
        return {
          'id': question.dataValues.id,
          'title': question.dataValues.title,
          'question': question.dataValues.question,
          'status': question.dataValues.status,
          'deadline': '',
          'createdAt': question.createdAt,
          'userId': question.userId,
        };
      });
      Promise.all(promises).then(function() {
        res.send(promises);
      });
    })
    .catch(function(err) {
      return res.status(500).send('Having trouble retrieving questions.');
    });
  },

  changeStatus: function(req, res, next) {
    console.log('question id ---------> ', req.body.id_question);
    QuestionOneUser.update({status: req.body.status}, {where: {id: req.body.id_question}})
      .then(function() {
        res.status(200);
      })
      .catch(function(err) {
        res.status(500).send('Having trouble updating the status');
      });
  }

};

module.exports = controller;

