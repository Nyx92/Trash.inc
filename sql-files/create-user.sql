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
  

