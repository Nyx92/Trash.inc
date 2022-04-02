// import { render } from 'ejs';
import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import jsSHA from 'jssha';

const SALT = 'bubas are delicious';

// Initialise DB connection
// Instead of client this is Pool
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'bubblepuddings',
  host: 'localhost',
  database: 'trash',
  port: 5432, // Postgres server always runs on this port by default
};

// Manage the database connections and enables us to accept multiple requests simultaneously.
const pool = new Pool(pgConnectionConfigs);
const app = express();
app.set('view engine', 'ejs');
// It parses the cookie header of the request and adds it to req.cookies
// or req.signedCookies (if secret keys are being used) for further processing.
app.use(cookieParser());

// Override POST requests with query param ?_method=PUT to be PUT requests
// This registers ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));

// Configure Express to parse request body data into request.body
// This just ensures that the data still makes sense with spaces inbetween
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// Middleware to read user from session and put it into res.locals
// so that we can access the userObject in ejs files.
// think of res.local as an extention to the data field whenever you render
// In this particular example we are adding a property known as user into the "data" field
// and it contains request.cookies
// This is needed for us to output the user name in the nav.ejs
app.use((request, response, next) => {
  response.locals.user = request.cookies.username;
  // go to next request handler;
  next();
});

/**
 * Check if user is logged in.
 * @returns True, if logged in. False, otherwise.
 */
const isLoggedIn = (request) => (request.cookies.loggedIn);

/**
  * Render the home page with list of bird sightings
 */
app.get('/home', (request, response) => {
  response.render('home');
});

/**
  * Render the page to signup form
 */
app.get('/login-sign-up', (request, response) => {
  response.render('login-sign-up');
});

/**
  * stores sign up data in table:users
 */
app.post('/sign-up', (request, response) => {
  const { name } = request.body;
  const { mobile } = request.body;
  const { email } = request.body;
  const { street } = request.body;
  const { block } = request.body;
  const { unit } = request.body;
  const { postal } = request.body;
  // initialise the SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // hashing the password
  shaObj.update(request.body.password);
  const hashedPassword = shaObj.getHash('HEX');
  const inputData = [];
  inputData.push(name, mobile, email, street, block, unit, postal, hashedPassword);
  console.log(inputData);
  const sqlQuery = 'INSERT INTO users (name, mobile, email, street, block, unit, postal, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  pool.query(sqlQuery, inputData, (submissionError, queryResult) => {
    // Currently process sends user to login page after they have signed up
    // Consider building in process to allow user know that either they have signed up successfully
    // Or allow them to login access dashboard immediately.
    response.redirect('login-sign-up');
  });
});

app.post('/login', (request, response) => {
  const { email } = request.body;
  const { password } = request.body;
  // First look for email in the table
  const sqlQuery = `SELECT * FROM users WHERE email = '${email}'`;
  pool.query(sqlQuery, (submissionError, queryResult) => {
    // if email not found
    if (queryResult.rows.length === 0) {
      const data = { response: 'Wrong Login credentials!' };
      response.status(403).render('result', data);
    }
    // check password
    else if (queryResult.rows[0].password !== password) {
      const data = { response: 'Wrong Login credentials!' };
      response.status(403).render('result', data);
    }
    else {
      // add a cookie header where value is true
      if (!isLoggedIn(request)) {
        console.log('This should run because Im not logged in yet');
      }
      response.cookie('loggedIn', true);
      response.cookie('username', queryResult.rows[0].username);
      if (isLoggedIn(request)) {
        console.log('This should run because Ive logged in');
      }
      const data = { response: "You've logged in!" };
      response.render('result', data); }
  });
});

app.listen(3004);
