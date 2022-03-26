export const buildTables = () => {
  if (process.argv[2] === 'show') {
    const sqlQuery = 'SELECT * FROM birding';
    pool.query(sqlQuery, (submissionError, queryResult) => {
      console.log(queryResult.rows);
    });
  } else if (process.argv[2] === 'drop') {
    const sqlQuery = 'DROP TABLE birding';
    pool.query(sqlQuery, (submissionError, queryResult) => {
      console.log('TABLE DROPPED');
    });
  } else if (process.argv[2] === 'create') {
    const sqlQuery = 'CREATE TABLE birding (id SERIAL PRIMARY KEY, date TEXT, appearance TEXT, behaviour TEXT, vocalisations TEXT, flock_size INTEGER, created_user TEXT)';
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
  }
};
