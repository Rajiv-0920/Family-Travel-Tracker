import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import 'dotenv/config';

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();
let countries;

db.query("SELECT country_code, country_name from countries_ order by country_name asc;", (err, res) => {
  if (err) {
    console.log(err);
  } else {
    countries = res.rows;
  }
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;
let users = [];

app.get("/", async (req, res) => {
  let visited_countries = await get_visited_countries();
  let currentUser = await getCurrentUser();
  res.render("index.ejs", {
    countries: countries,
    visited_countries: visited_countries,
    total: visited_countries.length,
    users: users,
    color: currentUser.color
  });
});

app.post("/add", async (req, res) => {
  //Write your code here.
  const input = req.body['country'];

  const result = await db.query("SELECT country_code FROM countries_ where country_name = $1", [input]);
  if (result.rows.length !== 0) {
    const country_code = result.rows[0].country_code;
    try {
      await db.query("INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)", [country_code, currentUserId]);
    } catch (error) {
      await db.query("INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2) ON CONFLICT(country_code) DO UPDATE SET user_id = EXCLUDED.user_id;",
        [country_code, currentUserId]);
    }
  }
  res.redirect("/");
});

app.post("/user", async (req, res) => {
  if (req.body.add === 'new') {
    res.render("new.ejs");
  }
  else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  let name = req.body.name;
  let color = req.body.color;

  const result = await db.query(
    "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
    [name, color]
  );

  const id = result.rows[0].id;
  currentUserId = id;

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

async function get_visited_countries() {
  const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1;", [currentUserId]);
  let visited_countries = result.rows.map(value => value.country_code);
  return visited_countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId) || '#ffe066';
}