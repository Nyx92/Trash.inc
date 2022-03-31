import { render } from 'ejs';
import express, { request, query } from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import pg from 'pg';

// import { buildTables } from './modules/buildtables.js';

// Initialise DB connection
// Instead of client this is Pool
const { Pool } = pg;
const pgConnectionConfigs = {
  user: 'bubblepuddings',
  host: 'localhost',
  database: 'bubblepuddings',
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

if (process.argv[2] === 'show') {
  const sqlQuery = 'SELECT * FROM birding';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log(queryResult.rows);
  });
} else if (process.argv[2] === 'dropbirding') {
  const sqlQuery = 'DROP TABLE birding';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE DROPPED');
  });
} else if (process.argv[2] === 'createbirding') {
  const sqlQuery = 'CREATE TABLE birding (id SERIAL PRIMARY KEY, date TEXT, appearance TEXT, vocalisations TEXT, flock_size INTEGER, created_user TEXT, species_id INTEGER)';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE CREATED');
  });
} else if (process.argv[2] === 'dropaccounts') {
  const sqlQuery = 'DROP TABLE accounts';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE DROPPED');
    process.exit();
  });
} else if (process.argv[2] === 'createaccounts') {
  const sqlQuery = 'CREATE TABLE accounts (id SERIAL PRIMARY KEY, email TEXT, password TEXT, username TEXT)';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE CREATED');
    process.exit();
  });
} else if (process.argv[2] === 'createspecies') {
  const sqlQuery = 'CREATE TABLE species (id SERIAL PRIMARY KEY, name TEXT, scientific_name TEXT)';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE CREATED');
    process.exit();
  });
} else if (process.argv[2] === 'insertspecies') {
  const input = [];
  input.push(process.argv[3], process.argv[4]);
  const sqlQuery = 'INSERT INTO species (name, scientific_name) VALUES ($1, $2)';
  pool.query(sqlQuery, input, (submissionError, queryResult) => {
    console.log('data inserted');
    process.exit();
  });
} else if (process.argv[2] === 'createbehaviour') {
  const sqlQuery = 'CREATE TABLE behaviour (id SERIAL PRIMARY KEY, name TEXT)';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE CREATED');
    process.exit();
  });
} else if (process.argv[2] === 'insertbehaviour') {
  const input = [];
  input.push(process.argv[3]);
  const sqlQuery = 'INSERT INTO behaviour (name) VALUES ($1)';
  pool.query(sqlQuery, input, (submissionError, queryResult) => {
    console.log('data inserted');
    process.exit();
  });
} else if (process.argv[2] === 'createrelational') {
  const sqlQuery = 'CREATE TABLE relational (id SERIAL PRIMARY KEY, birding_id INTEGER, behaviour_id INTEGER)';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE CREATED');
    process.exit();
  });
} else if (process.argv[2] === 'createallcomments') {
  // 1. comment data, 2. accounts which created the comments,
  // 3. comments for a specific entry - follows id of specific entry
  // data is inserted whenever comments is posted
  const sqlQuery = 'CREATE TABLE comments (id SERIAL PRIMARY KEY, comments TEXT, accounts_id INTEGER, birding_id INTEGER)';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log('TABLE CREATED');
    process.exit();
  });
}

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
  * Render the page to signup form
 */
app.get('/login-sign-up', (request, response) => {
  response.render('login-sign-up');
});

/**
  * stores sign up data in table:accounts
 */
app.post('/login-sign-up', (request, response) => {
  const { email } = request.body;
  const { password } = request.body;
  const { username } = request.body;
  const inputData = [];
  inputData.push(email, password, username);
  const sqlQuery = 'INSERT INTO accounts (email, password, username) VALUES ($1, $2, $3)';
  pool.query(sqlQuery, inputData, (submissionError, queryResult) => {
    const data = { response: "You've signed up!" };
    response.render('result', data);
  });
});

/**
  * Render the page to login form
 */
app.get('/login', (request, response) => {
  response.render('login');
});

/**
  * checks table accounts for email and password
 */
app.post('/login', (request, response) => {
  const { email } = request.body;
  console.log(email);
  const { password } = request.body;
  console.log(password);
  // First look for email in the table
  const sqlQuery = `SELECT * FROM accounts WHERE email = '${email}'`;
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

app.get('/logout', (request, response) => {
  response.clearCookie('loggedIn');
  response.clearCookie('username');
  const data = { response: "You've logged out!" };
  response.render('result', data);
});

// Before a user is able to access /note or /edit he must be logged in.

/**
  * Render the form to input new bird sightings
 */
app.get('/note', (request, response) => {
  if (!isLoggedIn(request)) {
    const data = { response: "You can't add a note because you've not logged in yet! Please login!" };
    response.render('result', data);
  }
  // Will need to include data from 2 tables here: species and behaviour
  let sqlQuery = 'SELECT * FROM species';
  pool.query(sqlQuery, (submissionError, queryResultSpecies) => {
    sqlQuery = 'SELECT * FROM behaviour';
    pool.query(sqlQuery, (submissionError, queryResultBehaviour) => {
      // queryResult.rows return an array of objects
      // to combine the tables, I'll insert one query into the other
      const combinedData = { species: queryResultSpecies.rows };
      combinedData.behaviour = queryResultBehaviour.rows;
      console.log(combinedData);
      response.render('note', combinedData);
    });
  });
});

app.post('/note', (request, response) => {
  console.log('request came in');
  const birdData = request.body;
  console.log(birdData);
  let inputArray = [];
  console.log(request.cookies.username);
  inputArray.push(birdData.date, birdData.appearance, birdData.vocalisations, birdData.flock_size, request.cookies.username, birdData.species_id);
  console.log(inputArray);
  // Actually I feel that species_id and behaviour_id should preferably be in another
  // relational table. Because behaviour_id has multiple instances in a single entry
  // I've created a relational table for birding_id and behaviour_id for now
  const sqlQuery = 'INSERT INTO birding (date, appearance, vocalisations, flock_size, created_user, species_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
  pool.query(sqlQuery, inputArray, (submissionError, submissionResult) => {
    if (submissionError) {
      console.error('form submission error', submissionError);
    }
    console.log('This is birdingId');
    const birdingId = submissionResult.rows[0].id;
    console.log(birdingId);
    // console.log(submissionResult);
    console.log('this is the array of behaviours');
    console.log(birdData.behaviour);
    // we don't know how many check boxes are ticked. Therefore birdData.behaviour may be an array
    // i.e., [birdingId, [birdData.behaviour]]
    // Therefore for each behaviour we have in [birdData.behaviour], make an insert query
    // item now refers to birdData.behaviour
    birdData.behaviour.forEach((item, index) => {
      console.log('This is the forEachLoop');
      inputArray = [];
      console.log(item);
      inputArray.push(birdingId, item);
      console.log(inputArray);
      const sqlQuery = 'INSERT INTO relational (birding_id, behaviour_id) VALUES ($1, $2)';
      pool.query(sqlQuery, inputArray, (submissionError, submissionResult) => {
        if (submissionError) {
          console.error('form submission error', submissionError);
        }
      });
    });
  });
  // I want to go to the homepage with a list of notes.
  response.redirect('/home');
});

/**
  * Render the home page with list of bird sightings
 */
app.get('/home', (request, response) => {
  const sqlQuery = 'SELECT * FROM birding';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    const data = { sightings: queryResult.rows };
    response.render('home', data);
  });
});

/**
  * individual sighting index
 */
app.get('/home/:index', (request, response) => {
  const { index } = request.params;
  // Will have to show the comments made too
  let combinedData;
  let sqlQuery = `SELECT * FROM birding WHERE id=${index}`;
  pool.query(sqlQuery, (submissionError, queryResultBirding) => {
    sqlQuery = `SELECT * FROM comments WHERE birding_id = ${index}`;
    pool.query(sqlQuery, (submissionError, queryResultComments) => {
      combinedData = { sightings: queryResultBirding.rows[0] };
      if (queryResultComments !== undefined) {
        combinedData.comments = queryResultComments.rows;
      }
      console.log(combinedData);
      response.render('entry', combinedData);
    });
  });
});

/**
  * insert comments into comment table
 */
app.post('/note/:index/comment', (request, response) => {
  const birdingId = request.params.index;
  const commentContent = request.body.comment;
  // need to get accounts_id from the request.cookies.username
  let sqlQuery = `SELECT * FROM accounts WHERE username = '${request.cookies.username}'`;
  pool.query(sqlQuery, (submissionError, queryResult) => {
    if (submissionError) {
      console.error('form submission error', submissionError);
    }
    console.log(queryResult);
    const accountId = queryResult.rows[0].id;
    const input = [commentContent, accountId, birdingId];
    sqlQuery = 'INSERT INTO comments (comments, accounts_id, birding_id) VALUES ($1, $2, $3)';
    pool.query(sqlQuery, input, (submissionError, queryResult) => {
      if (submissionError) {
        console.error('form submission error', submissionError);
      }
      response.redirect('/home');
    });
  });
});

/**
  * Render the form to edit bird sightings
 */
app.get('/edit/:index', (request, response) => {
  // The objective here is to get the id of the table. This is easy, because id already exist in the table
  const { index } = request.params;
  const input = [];
  input.push(index);
  const sqlQuery = 'SELECT * FROM birding WHERE id = $1';
  pool.query(sqlQuery, input, (submissionError, queryResult) => {
    // console.log(request.cookies.username);
    // console.log(queryResult.rows[0].username);
    if (submissionError) {
      console.log('Error executing query', submissionError.stack);
      response.status(503).send('SORRY');
      return;
    }
    if (!isLoggedIn(request)) {
      const data = { response: "You can't edit because you've not logged in yet! Please login!" };
      response.render('result', data);
    }
    else if (request.cookies.username !== queryResult.rows[0].created_user) {
      const data = { response: "You can't edit because you did not create this entry!" };
      response.render('result', data);
    }
    const data = { sightings: queryResult.rows[0] };
    console.log(data);
    response.render('edit', data);
  });
});

/**
  * Make the edit
 */
app.put('/edited/:index', (request, response) => {
  // console.log('test?');
  const indexNo = parseInt(request.params.index);
  const flockSize = parseInt(request.body.flock_size);
  const sqlQuery = `UPDATE birding SET date = '${request.body.date}', appearance = '${request.body.appearance}', behaviour = '${request.body.behaviour}', vocalisations = '${request.body.vocalisations}', flock_size = ${flockSize} WHERE id = ${indexNo}`;
  pool.query(sqlQuery, (submissionError, queryResult) => {
    console.log(queryResult);
    response.redirect('/home');
  });
});

/**
  * Make the delete
 */
app.delete('/delete/:index', (request, response) => {
  const { index } = request.params;
  const input = [];
  input.push(index);
  let sqlQuery = 'SELECT * FROM birding WHERE id = $1';
  pool.query(sqlQuery, input, (submissionError, queryResult) => {
    if (submissionError) {
      console.log('Error executing query', submissionError.stack);
      response.status(503).send('SORRY');
    }
    else if (!isLoggedIn(request)) {
      const data = { response: "You can't delete because you've not logged in yet! Please login!" };
      response.render('result', data);
    }
    else if (request.cookies.username !== queryResult.rows[0].created_user) {
      const data = { response: "You can't delete because you did not create this entry!" };
      response.render('result', data);
    } else {
      sqlQuery = `DELETE FROM birding WHERE id = ${index}`;
      pool.query(sqlQuery, (submissionError, queryResult) => {
        response.redirect('/home'); });
    }
  });
});
/**
  * Render the form to create species
 */
app.get('/species', (request, response) => {
  if (!isLoggedIn(request)) {
    const data = { response: "You can't add a note because you've not logged in yet! Please login!" };
    response.render('result', data);
  }
  response.render('species-note');
});

/**
  * stores species data in table:species
 */
app.post('/species', (request, response) => {
  console.log('request came in');
  const speciesData = request.body;
  const inputArray = [];
  inputArray.push(speciesData.species, speciesData.scientific);
  console.log(inputArray);
  const sqlQuery = 'INSERT INTO species (name, scientific_name) VALUES ($1, $2)';
  pool.query(sqlQuery, inputArray, (submissionError, submissionResult) => {
    if (submissionError) {
      console.error('form submission error', submissionError);
    }
  });
  // I want to go to the species page with a list of species.
  response.redirect('/species/all');
});

/**
  * renders full list of species
 */
app.get('/species/all', (request, response) => {
  const sqlQuery = 'SELECT * FROM species';
  pool.query(sqlQuery, (submissionError, queryResult) => {
    const data = { species: queryResult.rows };
    response.render('species-list', data);
  });
});

/**
  * renders all the entries of the specific species, i,e., one to many
 */
// index refers to species' id
app.get('/species/:index', (request, response) => {
  const { index } = request.params;
  const sqlQuery = `SELECT birding.date, birding.appearance, birding.vocalisations, birding.flock_size, species.name, species.scientific_name 
 FROM birding
 INNER JOIN species
 ON birding.species_id = species.id
 WHERE species.id = ${index}`;
  pool.query(sqlQuery, (submissionError, queryResult) => {
    const data = { sightings: queryResult.rows };
    console.log(data);
    response.render('home', data);
  });
});

app.listen(3004);
