'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const User = require('../models').User;
const Course = require('../models').Course;

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

const router = express.Router();

//router.get('/users', asyncHandler(async (req, res) => {
//  const allUsers = await User.findAll();
//  res.json(allUsers);
//}));

router.post('/users', asyncHandler(async (req, res) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    password: bcryptjs.hashSync(req.body.password)
  });
  res.status(201).redirect("/").end();
}));

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

module.exports = router;
