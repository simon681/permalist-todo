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
app.set("view engine", "ejs");

// Home or specific list route
app.get("/:listName?", async (req, res) => {
  const list = req.params.listName || "Today";
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const itemsResult = await db.query(
      "SELECT * FROM items WHERE list_name = $1 AND (completed IS NULL OR completed = FALSE) ORDER BY created_at ASC LIMIT $2 OFFSET $3",
      [list, limit, offset]
    );

    const countResult = await db.query(
      "SELECT COUNT(*) FROM items WHERE list_name = $1 AND (completed IS NULL OR completed = FALSE)",
      [list]
    );

    const listResult = await db.query("SELECT DISTINCT list_name FROM items ORDER BY list_name ASC");
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    res.render("index.ejs", {
      listTitle: list,
      listItems: itemsResult.rows,
      allLists: listResult.rows.map(row => row.list_name),
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving paginated items.");
  }
});

// Add new item
app.post("/add", async (req, res) => {
  const item = req.body.newItem?.trim();
  const list = req.body.listName || "Today";
  const dueDate = req.body.dueDate || null;

  if (!item) return res.redirect("/" + encodeURIComponent(list));

  try {
    await db.query("INSERT INTO items (title, list_name, due_date) VALUES ($1, $2, $3)", [item, list, dueDate]);
    res.redirect("/" + encodeURIComponent(list));
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).send("Failed to add item.");
  }
});

// Edit item
app.post("/edit", async (req, res) => {
  const idToEdit = parseInt(req.body.updatedItemId);
  const newTitle = req.body.updatedItemTitle?.trim();
  const currentList = req.body.currentList || "Today";

  if (!newTitle || isNaN(idToEdit)) return res.status(400).send("Invalid data.");

  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2", [newTitle, idToEdit]);
    res.redirect("/" + encodeURIComponent(currentList));
  } catch (err) {
    console.error("Error editing item:", err);
    res.status(500).send("Could not update item.");
  }
});

// Soft delete (mark as completed)
app.post("/delete", async (req, res) => {
  const idToDelete = parseInt(req.body.deleteItemId);
  const currentList = req.body.currentList || "Today";

  if (isNaN(idToDelete)) return res.status(400).send("Invalid ID.");

  try {
    await db.query("UPDATE items SET completed = TRUE WHERE id = $1", [idToDelete]);
    res.redirect("/" + encodeURIComponent(currentList));
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Could not mark item as completed.");
  }
});

// Completed Items Route
app.get("/completed/:listName?", async (req, res) => {
  const list = req.params.listName || "Today";
  try {
    const result = await db.query(
      "SELECT * FROM items WHERE list_name = $1 AND completed = TRUE ORDER BY created_at DESC",
      [list]
    );

    res.render("completed.ejs", {
      listTitle: list + " (Completed)",
      listItems: result.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading completed items.");
  }
});

// Undo completed task

app.post("/undo", async (req, res) => {
  const itemId = parseInt(req.body.itemId);
  if (isNaN(itemId)) return res.status(400).send("Invalid item ID");

  try {
    const result = await db.query("UPDATE items SET completed = FALSE WHERE id = $1 RETURNING list_name", [itemId]);
    const list = result.rows[0]?.list_name || "Today";
    res.redirect(`/completed/${encodeURIComponent(list)}`);
  } catch (err) {
    console.error("Error undoing completion:", err);
    res.status(500).send("Undo failed.");
  }
});

// Permanently delete completed items
app.post("/permanent-delete", async (req, res) => {
  const itemId = parseInt(req.body.itemId);
  if (isNaN(itemId)) return res.status(400).send("Invalid item ID");

  try {
    const result = await db.query("DELETE FROM items WHERE id = $1 RETURNING list_name", [itemId]);
    const list = result.rows[0]?.list_name || "Today";
    res.redirect(`/completed/${encodeURIComponent(list)}`);
  } catch (err) {
    console.error("Error permanently deleting item:", err);
    res.status(500).send("Delete failed.");
  }
});

// Upcoming items route
app.get("/upcoming/:listName?", async (req, res) => {
  const list = req.params.listName || "Today";
  try {
    const result = await db.query(
      "SELECT * FROM items WHERE list_name = $1 AND due_date >= CURRENT_DATE AND (completed IS NULL OR completed = FALSE) ORDER BY due_date ASC",
      [list]
    );

    res.render("index.ejs", {
      listTitle: list + " (Upcoming)",
      listItems: result.rows,
      allLists: [], // optional
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading upcoming items.");
  }
});

// Dropdown-based list switcher
app.get("/switch-list", async (req, res) => {
  try {
    const result = await db.query("SELECT DISTINCT list_name FROM items ORDER BY list_name ASC");
    res.render("switch.ejs", { lists: result.rows.map(row => row.list_name) });
  } catch (err) {
    console.error("Error loading list switcher:", err);
    res.status(500).send("Could not load lists.");
  }
});

// Fallback route for redirect
app.get("/switch-list/redirect", (req, res) => {
  const list = req.query.listName || "Today";
  res.redirect("/" + encodeURIComponent(list));
});

// All lists in plain list view (optional)
app.get("/lists", async (req, res) => {
  try {
    const result = await db.query("SELECT DISTINCT list_name FROM items ORDER BY list_name ASC");
    res.render("lists.ejs", { lists: result.rows });
  } catch (err) {
    console.error("Error showing lists:", err);
    res.status(500).send("Could not display lists.");
  }
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
