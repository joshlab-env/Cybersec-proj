require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");

const pool = require("./config/db");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/landing.html");
});

const PEPPER = process.env.PEPPER;

app.post("/register", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.redirect("/register.html?error=passwords");
    }

    const salt = await bcrypt.genSalt(12);

    const passwordToHash = password + salt + PEPPER;

    const hash = await bcrypt.hash(passwordToHash, 12);

    await pool.query(
      `
      INSERT INTO users
      (username,password_hash,salt)
      VALUES ($1,$2,$3)
      `,
      [username, hash, salt]
    );

    res.redirect("/login.html");
  } catch (error) {
    console.log(error);
    res.redirect("/register.html?error=username");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.redirect("/login.html?error=invalid");
    }

    const user = result.rows[0];

    const passwordToCheck =
      password +
      user.salt +
      PEPPER;

    const match = await bcrypt.compare(
      passwordToCheck,
      user.password_hash
    );

    if (!match) {
    return res.redirect("/login.html?error=invalid");
    }

    req.session.user = {
        id: user.id,
        username: user.username
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.redirect("/login.html?error=server");
  }
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }

  res.sendFile(__dirname + "/views/dashboard.html");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Logout Failed");
    }

    res.clearCookie("connect.sid");

    res.redirect("/login.html");
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});