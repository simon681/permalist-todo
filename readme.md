# 📝 Permalist To-Do List App

Permalist is a simple and efficient to-do list web application built using **Node.js**, **Express**, **EJS**, and **PostgreSQL**. It allows users to add, edit, and delete tasks — with all data stored in a PostgreSQL database for persistence.

---

## 🚀 Features

- Add new to-do items
- Edit existing tasks inline
- Delete tasks with a checkbox
- Persistent storage using PostgreSQL
- Clean UI powered by EJS templates
- Secure environment variables with `dotenv`

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, HTML, CSS
- **Database**: PostgreSQL
- **Tools**: Dotenv, body-parser

---

## 📂 Project Structure
permalist-todo/
│
├── views/ # EJS templates
│ └── index.ejs
│
├── public/ # Static assets (CSS, images, icons)
│
├── .env # Environment variables (not tracked)
├── .gitignore
├── index.js # Main application file
├── package.json
└── README.md

---

## ⚙️ Setup & Run Locally

1. **Clone the repo**

```bash
git clone https://github.com/simon681/permalist-todo.git
cd permalist-todo

2. Install dependencies

bash
Copy
Edit
npm install

Set up your .env file

3. Create a .env file in the root folder and add your DB credentials:

DB_USER=your_username
DB_HOST=localhost
DB_NAME=permalist
DB_PASSWORD=your_password
DB_PORT=5432

4. Start the app


node index.js

Visit http://localhost:3000 in your browser.

🧪 Example SQL to create the table

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

📌 License
This project is licensed under the MIT License.

🙌 Acknowledgments
Built as part of a personal learning project in full-stack development.