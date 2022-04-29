-- Remember that the command is npm run db: create

CREATE TABLE IF NOT EXISTS recycle_order (
  id SERIAL PRIMARY KEY, 
  material_type TEXT,
  item TEXT, 
  quantity INTEGER,
  order_status TEXT,
  user_id INTEGER
);
