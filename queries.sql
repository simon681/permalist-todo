CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  list_name VARCHAR(100),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO items (title, list_name, due_date)
VALUES ('Buy milk', 'Today', '2024-05-01');

INSERT INTO items (title, list_name, due_date, completed, created_at)
VALUES ('Finish homework', 'School', '2024-05-03', TRUE, CURRENT_TIMESTAMP);
