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


router.get('/courses', asyncHandler(async (req, res) => {
  const allCourses = await Course.findAll();
  res.status(200).json(allCourses)
}));


//Authenticated user
router.get('/courses/:id', authenticateUser, asyncHandler(async (req, res) => {
  const courses = await Course.findAll({ where: { userId: req.currentUser } });
  res.status(200).json(courses)
}));

module.exports = router;
