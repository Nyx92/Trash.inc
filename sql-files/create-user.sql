-- Remember that the command is npm run db: create

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY, 
  name TEXT,
  mobile TEXT, 
  email TEXT,
  street TEXT, 
  block TEXT, 
  unit TEXT,
  postal TEXT, 
  password TEXT);












-- if (process.argv[2] === 'show') {
--   const sqlQuery = 'SELECT * FROM birding';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log(queryResult.rows);
--   });
-- } else if (process.argv[2] === 'dropbirding') {
--   const sqlQuery = 'DROP TABLE birding';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE DROPPED');
--   });
-- } else if (process.argv[2] === 'createbirding') {
--   const sqlQuery = 'CREATE TABLE birding (id SERIAL PRIMARY KEY, date TEXT, appearance TEXT, vocalisations TEXT, flock_size INTEGER, created_user TEXT, species_id INTEGER)';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE CREATED');
--   });
-- } else if (process.argv[2] === 'dropaccounts') {
--   const sqlQuery = 'DROP TABLE accounts';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE DROPPED');
--     process.exit();
--   });
-- } else if (process.argv[2] === 'createaccounts') {
--   const sqlQuery = 'CREATE TABLE accounts (id SERIAL PRIMARY KEY, email TEXT, password TEXT, username TEXT)';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE CREATED');
--     process.exit();
--   });
-- } else if (process.argv[2] === 'createspecies') {
--   const sqlQuery = 'CREATE TABLE species (id SERIAL PRIMARY KEY, name TEXT, scientific_name TEXT)';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE CREATED');
--     process.exit();
--   });
-- } else if (process.argv[2] === 'insertspecies') {
--   const input = [];
--   input.push(process.argv[3], process.argv[4]);
--   const sqlQuery = 'INSERT INTO species (name, scientific_name) VALUES ($1, $2)';
--   pool.query(sqlQuery, input, (submissionError, queryResult) => {
--     console.log('data inserted');
--     process.exit();
--   });
-- } else if (process.argv[2] === 'createbehaviour') {
--   const sqlQuery = 'CREATE TABLE behaviour (id SERIAL PRIMARY KEY, name TEXT)';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE CREATED');
--     process.exit();
--   });
-- } else if (process.argv[2] === 'insertbehaviour') {
--   const input = [];
--   input.push(process.argv[3]);
--   const sqlQuery = 'INSERT INTO behaviour (name) VALUES ($1)';
--   pool.query(sqlQuery, input, (submissionError, queryResult) => {
--     console.log('data inserted');
--     process.exit();
--   });
-- } else if (process.argv[2] === 'createrelational') {
--   const sqlQuery = 'CREATE TABLE relational (id SERIAL PRIMARY KEY, birding_id INTEGER, behaviour_id INTEGER)';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE CREATED');
--     process.exit();
--   });
-- } else if (process.argv[2] === 'createallcomments') {
--   // 1. comment data, 2. accounts which created the comments,
--   // 3. comments for a specific entry - follows id of specific entry
--   // data is inserted whenever comments is posted
--   const sqlQuery = 'CREATE TABLE comments (id SERIAL PRIMARY KEY, comments TEXT, accounts_id INTEGER, birding_id INTEGER)';
--   pool.query(sqlQuery, (submissionError, queryResult) => {
--     console.log('TABLE CREATED');
--     process.exit();
--   });
-- }