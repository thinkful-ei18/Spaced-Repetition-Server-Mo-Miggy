'use strict';
const express = require('express');
const { Question } = require('../models/questions.js');
const { User } = require('../models/users.js');
const seedData = require('../mockData/mockWords.json');
const passport = require('passport');
const LinkedList = require('../linkedList/linkedList.js');

const router = express.Router();

// seeding the database !
router.get('/seed', (req, res) => {
  return Question.insertMany(seedData)
    .then(() => {
      return res.status(200);
    })
    .catch(err => {
      res.status(500).json({ code: 500, message: 'Internal server error' });
    });
});

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', jwtAuth, (req, res, next) => {
  User.findById(req.user.id)
    .select('questions')
    .then(result => {
      return res.json(result.questions.head.data.wordPair);
    });
});

router.get('/correct', jwtAuth, (req, res, next) => {
  const userId = req.user.id;
  User.findById(userId)
    // .select('questions')
    .then(result => {
      console.log(result);
      let tempList = new LinkedList();
      let tempPointer = result.questions.head;
      while (tempPointer !== null) {
        tempList.insertLast(tempPointer.data);
        tempPointer = tempPointer.next;
      }
      // tempList.setM();
      console.log(tempPointer, 'this is the original');

      let newObj = Object.assign({}, result, {
        questions: tempList,
      });

      console.log('temp is here:', tempList);
      return User.findByIdAndUpdate(
        userId,
        { $set: { questions: tempList } },
        { new: true }
      )
        .then(data => {
          console.log('data is here', data);
          return res.status(201).json(data);
        })
        .catch(err => {
          console.log(err);
        });
    })
    // .then(res=> res.status(201).json(res))
    .catch(err => next(err));
});
router.get('/wrong', (req, res, next) => {});
module.exports = { router };
