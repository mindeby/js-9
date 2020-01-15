'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bcryptjs = require('bcryptjs');
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

router.get('/users', asyncHandler(async (req, res) => {
  const allUsers = await User.findAll();
  res.json(allUsers);
}));

router.post('/users', asyncHandler(async (req, res) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    password: bcryptjs.hashSync(req.body.password)
  });
  res.status(201).end();
}));

module.exports = router;
