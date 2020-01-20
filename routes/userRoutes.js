'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const User = require('../models').User;
const Course = require('../models').Course;
const router = express.Router();

//USER authentication
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


//PUT and POST requests: data validation
const { check, validationResult } = require('express-validator');

/*//Not Authenticated user
router.get('/users', asyncHandler(async (req, res) => {
  const allUsers = await User.findAll();
  res.status(200).json(allUsers)
}));*/

//Authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
  const user = req.currentUser;
  res.status(200).json({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.emailAddress,
    id: user.id,
  })
}));

router.post('/users', [
  check('firstName')
    .exists()
    .withMessage('Please provide a value for "first name"'),
  check('lastName')
    .exists()
    .withMessage('Please provide a value for "last Name"'),
  check('emailAddress')
    .custom(async email => {
        const user = await User.findOne({where: {emailAddress: email }});
        if (user) {
          throw new Error('Email already registered')
        }
      })
    .withMessage('This email address already exists')
    .exists()
    .isEmail()
    .withMessage('Please provide a value for "emailAddress"'),
  check('password')
    .exists()
    .withMessage('Please provide a value for "password"'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  // Use the Array `map()` method to get a list of error messages.
  const errorMessages = errors.array().map(error => error.msg);
  res.status(400).json({ errors: errorMessages });
  } else {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      emailAddress: req.body.emailAddress,
      password: bcryptjs.hashSync(req.body.password) //hashing the password
    });
    res.status(201).redirect("/").end();
  }
}));

/*//deletes users
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if(user) {
    await user.destroy();
    res.status(204).end();
  } else {
    res.sendStatus(404);
  }
}));*/





module.exports = router;
