'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const User = require('../models').User;
const Course = require('../models').Course;


/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

const router = express.Router();

const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  if (credentials) {
    const user = await User.findOne({
      where: { emailAddress: credentials.name }
    });
    console.log(user);
    if (user) {
      const authenticated = bcryptjs
        .compareSync(credentials.pass, user.password)
      if (authenticated) {
        console.log(`Authentication successful for: ${user.emailAddress}`);
        req.currentUser = user;
      } else {
        message = `Could not authenticate ${user.emailAddress}`;
      }
    } else {
      message = `Could not find the username: ${user.emailAddress}`;
    }
  } else {
    message = `Authenticate header not found`;
  }
  if (message) {
    console.warn(message);
    res.status(401).json({message: "Access denied" });
  } else {
    next();
  }
}

//PUT and POST requests: data validation
const { check, validationResult } = require('express-validator');

//Returns a list of courses
router.get('/courses', asyncHandler(async (req, res) => {
  const allCourses = await Course.findAll({
    attributes: { exclude: ["createdAt", "updatedAt", "userId"] },
      include: [
        {
          model: User,
          as: "User",
          attributes: { exclude: ["password", "createdAt", "updatedAt", "id"] }
        }
      ]
  });
  res.status(200).json(allCourses)
}));


 //Returns a course by id
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    attributes: { exclude: ["createdAt", "updatedAt", "userId"] },
      include: [
        {
          model: User,
          as: "User",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt", "id"] }
        }
      ]
    });
  res.status(200).json(course)
}));

//Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', [
  check('title')
    .exists()
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"')], authenticateUser, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    res.status(400).json({ errors: errorMessages });
  } else {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      materialsNeeded: req.body.materialsNeeded,
      userId: req.currentUser.id
    });
  res.status(201).location("/course/" + course.id).end();
 }
}));

//Updates a course and returns no content
router.put('/courses/:id', [
  check('title')
    .exists()
    .withMessage('Please provide a value for "title"'),
  check('description')
    .exists()
    .withMessage('Please provide a value for "description"')], authenticateUser, asyncHandler(async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        res.status(400).json({ errors: errorMessages });
      } else {
        let course;
        try {
          course = await Course.findByPk(req.params.id);
          if(course) {
            const user = req.currentUser;
            if (user.id === course.userId){
              await course.update({
                title: req.body.title,
                description: req.body.description,
                estimatedTime: req.body.estimatedTime,
                materialsNeeded: req.body.materialsNeeded,
                userId: user.id
              });
              res.status(204).end();
            } else{
              res.status(403).json({message: "You don't have the necessary authorization to update this course"})
            }
          } else {
            res.sendStatus(404);
          }
        } catch (error) {
          throw error; // error caught in the asyncHandler's catch block
        }
      }
}));

//Updates a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if(course) {
    const user = req.currentUser;
    if (user.id === course.userId){
      await course.destroy();
      res.status(204).end();
    } else {
      res.status(403).json({message: "You don't have the necessary authorization to update this course"})
    }
  } else {
    res.sendStatus(500);
  }
}));

module.exports = router;
