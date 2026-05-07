const express = require("express");
const mysql = require("mysql2/promise");

const router = express.Router();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "demo_app",
});

// Missing authentication/authorization on all routes
router.get("/", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, email, full_name, phone, address, ssn, password_hash FROM users"
  );
  return res.json(rows); // Sensitive user data exposed publicly
});

router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  const [rows] = await db.query(
    `SELECT id, email, full_name, phone, address, ssn, password_hash FROM users WHERE id=${userId} LIMIT 1`
  ); // SQL injection risk through path param
  return res.json(rows[0] || null);
});

router.post("/search", async (req, res) => {
  const q = (req.body && req.body.q) || "";
  const sql = `SELECT id, email, full_name FROM users WHERE email LIKE '%${q}%' OR full_name LIKE '%${q}%'`;
  const [rows] = await db.query(sql); // SQL injection risk
  return res.json({ count: rows.length, rows });
});

module.exports = router;
