// import { render } from 'ejs';
import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import jsSHA from 'jssha';

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

// initialize salt as a global constant
const SALT = 'bubas are fun';

// getHash function
const getHash = (input) => {
  // create new SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // create an unhashed cookie string based on user ID and salt
  const unhashedString = `${input}-${SALT}`;
  // generate a hashed cookie string using SHA object
  shaObj.update(unhashedString);
  return shaObj.getHash('HEX');
};

// Middleware to check if user is logged in. Using this for now because checkAuth function
// isn't working
app.use((request, response, next) => {
  // set the default value
  console.log('user is not logged in');
  request.isUserLoggedIn = false;

  // check to see if the cookies you need exists
  if (request.cookies.loggedInHash && request.cookies.username) {
    // get the hased value that should be inside the cookie
    const hash = getHash(request.cookies.username);

    // test the value of the cookie
    if (request.cookies.loggedInHash === hash) {
      request.isUserLoggedIn = true;
    }
    if (request.isUserLoggedIn === true) {
      console.log('user is logged in');
    }
  }
  next();
});

// CheckAuth function isn't working. Middleware isn't executing
const checkAuth = (request, response, next) => {
  app.use((request, response, next) => {
  // set the default value
    console.log('user is not logged in');
    request.isUserLoggedIn = false;

    // check to see if the cookies you need exists
    if (request.cookies.loggedInHash && request.cookies.username) {
    // get the hased value that should be inside the cookie
      const hash = getHash(request.cookies.username);

      // test the value of the cookie
      if (request.cookies.loggedInHash === hash) {
        request.isUserLoggedIn = true;
      }
      if (request.isUserLoggedIn === true) {
        console.log('user is logged in');
      }
    }
    next();
  });
  // temporary putting a next() here for now because checkAuth function is
  // used in the dashboard path (though function isn't working)
  next();
};

/**
  * Render landing page
 */
app.get('/landing', (request, response) => {
  response.render('landing');
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
    response.redirect('/login-sign-up');
  });
});

/**
  * Processes login details
 */
app.post('/login', (request, response) => {
  const { email } = request.body;
  const { password } = request.body;
  // initialise SHA object - we need to hash the incoming password to compare with db
  let shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // input the password from the request to the SHA object
  shaObj.update(password);
  // get the hashed value as output from the SHA object
  const hashedPassword = shaObj.getHash('HEX');
  // First look for email in the table
  const sqlQuery = `SELECT * FROM users WHERE email = '${email}'`;
  pool.query(sqlQuery, (submissionError, queryResult) => {
    // if email not found
    if (queryResult.rows.length === 0) {
      response.status(403).render('error-login');
    }
    // if entered (hashed) password is not the same as the hashed password in db
    else if (queryResult.rows[0].password !== hashedPassword) {
      response.status(403).render('error-login');
    }
    // After successful login, we generate a hashed cookie value using a combination of
    // user's name and salt, and send that value to the client in a response cookie.
    else {
      // create new SHA object
      shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
      // create an unhashed cookie string based on user's name and salt
      const unhashedCookieString = `${queryResult.rows[0].name}-${SALT}`;
      // generate a hashed cookie string using SHA object
      shaObj.update(unhashedCookieString);
      const hashedCookieString = shaObj.getHash('HEX');
      // set the loggedInHash and userId cookies in the response
      // This creates a cookie with a header of "loggedInHash" with a value of hashedCookieString
      response.cookie('loggedInHash', hashedCookieString);
      // This creates a cookie with a header of "userId" with a value of queryResult.rows[0].id
      response.cookie('username', queryResult.rows[0].name);
      response.cookie('userid', queryResult.rows[0].id);
      // end the request-response cycle
      console.log('this is admin id');
      console.log(request.cookies.userid);
      if (queryResult.rows[0].id === 1) {
        // id = 1 is default admin user
        // consider having another column to indicate if user or admin to allow
        // for more admin accounts
        response.redirect('/admin');
      } else {
        response.redirect('/dashboard');
      }
    }
  });
});

/**
  * clears all cookies
 */
app.get('/logout', (request, response) => {
  response.clearCookie('loggedInHash');
  response.clearCookie('username');
  response.clearCookie('userid');
  response.redirect('/login-sign-up');
});

/**
  * renders user dashboard
 */
app.get('/dashboard', checkAuth, (request, response) => {
  // checkAuth is not working
  console.log('coming back to dashboard?');
  // if not logged in, send to login-sign-up page
  if (request.isUserLoggedIn === false) {
    console.log('trying to enter login sign up');
    response.redirect('/login-sign-up');
  } else {
    console.log('trying to enter user dashboard');
    // from the cookie, retrieve all information about the user to output at dashboard
    const retrieveUserId = request.cookies.userid;
    let username;
    let usermobile;
    let useremail;
    let userstreet;
    let userblock;
    let userunit;
    let userpostal;
    let totalPaperQuantity = 0;
    let totalMetalQuantity = 0;
    let totalTextileQuantity = 0;
    let totalEwasteQuantity = 0;
    let totalCarbonSaved = 0;
    let totalTreesSaved = 0;
    let sqlQuery = `SELECT * FROM users WHERE id = ${retrieveUserId}`;
    // assessing username data first
    pool.query(sqlQuery)
      .then((result) => {
        username = result.rows[0].name;
        usermobile = result.rows[0].mobile;
        useremail = result.rows[0].email;
        userstreet = result.rows[0].street;
        userblock = result.rows[0].block;
        userunit = result.rows[0].unit;
        userpostal = result.rows[0].postal;
      });
    // Collate the total quantity of a specific material_type starting from paper
    sqlQuery = `SELECT quantity FROM recycle_order WHERE (material_type = 'Paper' AND user_id  = ${retrieveUserId})`;
    pool.query(sqlQuery)
      .then((result) => {
        result.rows.forEach((x) => {
          for (const y in x) {
            totalPaperQuantity += (x[y]);
          }
        });
        console.log(`This is totalPaperQuan: ${totalPaperQuantity}`);
      });
    // collate total metal
    sqlQuery = `SELECT quantity FROM recycle_order WHERE (material_type = 'Metals' AND user_id  = ${retrieveUserId})`;
    pool.query(sqlQuery)
      .then((result) => {
        result.rows.forEach((x) => {
          for (const y in x) {
            totalMetalQuantity += (x[y]);
          }
        });
        console.log(`This is totalMetalQuan: ${totalMetalQuantity}`);
      });
    // collate total Textile
    sqlQuery = `SELECT quantity FROM recycle_order WHERE (material_type = 'Textile' AND user_id  = ${retrieveUserId})`;
    pool.query(sqlQuery)
      .then((result) => {
        result.rows.forEach((x) => {
          for (const y in x) {
            totalTextileQuantity += (x[y]);
          }
        });
        console.log(`This is totalTextileQuan: ${totalTextileQuantity}`);
      });
    // collate total E-waste
    sqlQuery = `SELECT quantity FROM recycle_order WHERE (material_type = 'E-waste' AND user_id  = ${retrieveUserId})`;
    pool.query(sqlQuery)
      .then((result) => {
        result.rows.forEach((x) => {
          for (const y in x) {
            totalEwasteQuantity += (x[y]);
          }
        });
        console.log(`This is totalE-wasteQuan: ${totalEwasteQuantity}`);
        // tabulate total quantity of carbon
        totalCarbonSaved = totalPaperQuantity + totalEwasteQuantity + totalTextileQuantity + totalMetalQuantity;
        // tabulate total tress saved
        console.log(`This is totalCarbonSaved: ${totalCarbonSaved}`);
        totalTreesSaved = 123;
        // finalData contains all the data which we require to render user dashboard
        const finalData = {
          totalPaper: totalPaperQuantity,
          totalMetal: totalMetalQuantity,
          totalTextile: totalTextileQuantity,
          totalEwaste: totalEwasteQuantity,
          totalCarbon: totalCarbonSaved,
          totalTree: totalTreesSaved,
          user: username,
          userMobile: usermobile,
          userEmail: useremail,
          userStreet: userstreet,
          userBlock: userblock,
          userUnit: userunit,
          userPostal: userpostal,
        };
        response.render('dashboard', { userdata: finalData });
      });
  }
});

/**
  * edits user data
 */
app.post('/edit-profile', (request, response) => {
  const retrieveUserId = request.cookies.userid;
  const sqlQuery = `UPDATE users SET name = '${request.body.name}', mobile = '${request.body.mobile}', email = '${request.body.email}', street = '${request.body.street}', block = '${request.body.block}', unit = '${request.body.unit}', postal = '${request.body.postal}' WHERE id = ${retrieveUserId}`;
  pool.query(sqlQuery)
    .then((result) => {
      response.redirect('/dashboard');
    });
});

/**
  * renders recycle order form
 */
app.get('/recycle', (request, response) => {
  response.render('recycle');
});

/**
  * adds to recycle_order table
 */
app.post('/recycle', (request, response) => {
  const { material } = request.body;
  const { item } = request.body;
  const { quantity } = request.body;
  const retrieveUserId = request.cookies.userid;
  const orderStatus = 'unfulfilled';
  console.log(material);
  console.log(item);
  console.log(quantity);
  const inputData = [];
  inputData.push(material, item, quantity, orderStatus, retrieveUserId);
  console.log(inputData);
  const sqlQuery = 'INSERT INTO recycle_order (material_type, item, quantity, order_status, user_id) VALUES ($1, $2, $3, $4, $5)';
  pool.query(sqlQuery, inputData, (submissionError, queryResult) => {
    response.redirect('/dashboard');
  });
});

/**
  * renders admin dashboard
 */
app.get('/admin', (request, response) => {
  if (request.isUserLoggedIn === false) {
    response.redirect('/login-sign-up');
  } else {
    const retrieveUserName = request.cookies.username;
    // Taking all orders and adding user details
    const sqlQuery = `SELECT users.name, users.street, users.block, users.unit, users.postal, recycle_order.material_type, recycle_order.item, recycle_order.quantity, recycle_order.order_status, recycle_order.user_id, recycle_order.id
  FROM recycle_order
  INNER JOIN users
  ON recycle_order.user_id = users.id`;
    pool.query(sqlQuery)
      .then((result) => {
        result.rows.unshift({ user: retrieveUserName });
        const data = { finalData: result.rows };
        response.render('admin-dashboard', data);
      });
  }
});

/**
  * updates recycle_order table data from unfulfilled to fulfilled
 */
app.post('/fulfill', (request, response) => {
  const fulfillOrderArray = request.body.fulfill;
  console.log(fulfillOrderArray);
  // Loop through the array and edit the table accordingly
  for (let i = 0; i < fulfillOrderArray.length; i++) {
    const sqlQuery = `UPDATE recycle_order
    SET order_status = 'fulfilled'
    WHERE id = ${fulfillOrderArray[i]}; `;
    pool.query(sqlQuery)
      .then((result) => {
        if (i === fulfillOrderArray.length - 1) {
          response.redirect('/admin');
        }
      });
  }
});

app.listen(3004);
