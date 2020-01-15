'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');





const User = require('./models').User;

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

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

//Body Parser - to read the req.body
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


// TODO setup your api routes here
app.use('/api', courseRoutes)
app.use('/api', userRoutes)

// setup a friendly greeting for the root route
app.get('/', asyncHandler(async (req, res) => {
  // Test the connection to the database
   //console.log('Connection to the database successful!');
   //await sequelize.authenticate();
  res.json({
    message: 'Welcome to the REST API project!',
  });
}));


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
