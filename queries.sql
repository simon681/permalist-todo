CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  list_name VARCHAR(100) DEFAULT 'Today',
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO items (title, list_name, due_date, completed, created_at) VALUES
  ('Buy milk', 'Today', NULL, FALSE, DEFAULT),
  ('Finish homework', 'School', NULL, FALSE, DEFAULT);
