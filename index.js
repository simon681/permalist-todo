import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER BY id ASC");
    items = result.rows;

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
} catch (err) {
  console.log(err);
  res.send("Error retrieving items from the database.");
}
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error adding item to the database.");
  }
});

app.post("/edit", async (req, res) => {
  const idToEdit = parseInt(req.body.updatedItemId);
  const newTitle = req.body.updatedItemTitle ;
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [newTitle, idToEdit]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error updating item in the database.");
  }
});

app.post("/delete", async (req, res) => {
  const idToDelete = parseInt(req.body.deleteItemId);
  try {
    await db.query("DELETE FROM items WHERE id = $1", [idToDelete]);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error deleting item from the database.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
