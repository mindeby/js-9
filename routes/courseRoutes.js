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

//Returns a list of courses
router.get('/courses', asyncHandler(async (req, res) => {
  const allCourses = await Course.findAll();
  res.status(200).json(allCourses)
}));


 //Returns a course by id
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  res.status(200).json(course)
}));

//Creates a course, sets the Location header to the URI for the course, and returns no content
router.post('/courses', authenticateUser, asyncHandler(async (req, res) => {
  const newCourse = await Course.create({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.currentUser.id
  });
  res.status(201).redirect("/").end();
}));

//Updates a course and returns no content
router.put('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  let course;
  try {
    course = await Course.findByPk(req.params.id);
    if(course) {
      await course.update({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        materialsNeeded: req.body.materialsNeeded,
        userId: req.currentUser.id
      });
      res.status(204).redirect("/").end();
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
      throw error; // error caught in the asyncHandler's catch block
  }
}));

//Updates a course and returns no content
router.delete('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if(course) {
    await course.destroy();
    res.status(204).end();
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
