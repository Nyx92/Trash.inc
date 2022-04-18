-- Remember that the command is npm run db: create

CREATE TABLE IF NOT EXISTS recycle_order (
  id SERIAL PRIMARY KEY, 
  material_type TEXT,
  item TEXT, 
  quantity INTEGER,
  order_status TEXT,
  user_id INTEGER
);

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('Paper', 'Newspaper', 100, 'unfulfilled', 2);

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('Paper', 'Books', 101, 'unfulfilled', 2);

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('Metals', 'Home appliances', 103, 'unfulfilled', 2);  

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('E-waste', 'Handphone', 105, 'unfulfilled', 3);

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('Textile', 'Bags', 110, 'unfulfilled', 3);

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('E-waste', 'computer', 110, 'unfulfilled', 4);

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('E-waste', 'Handphone', 105, 'unfulfilled', 4);

INSERT INTO recycle_order (material_type, item, quantity, order_status,  user_id)
VALUES ('Textile', 'Bags', 110, 'unfulfilled', 4);