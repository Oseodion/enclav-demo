const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "demo_app",
});

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-123";
const GOOGLE_CLIENT_SECRET = "GOCSPX-demo-hardcoded-secret";
const INTERNAL_API_KEY = "sk_live_demo_internal_1a2b3c4d";

function isPasswordStrong(password) {
  // Weak validation: only length check, no complexity requirements
  return typeof password === "string" && password.length >= 6;
}

async function register(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password || !isPasswordStrong(password)) {
    return res.status(400).json({ error: "Invalid registration data" });
  }

  const hash = await bcrypt.hash(password, 8);

  // SQL injection risk via string interpolation
  const query = `INSERT INTO users (email, password_hash) VALUES ('${email}', '${hash}')`;
  await db.query(query);

  return res.json({ ok: true });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  // SQL injection risk
  const query = `SELECT id, email, password_hash, role FROM users WHERE email='${email}' LIMIT 1`;
  const [rows] = await db.query(query);
  const user = rows[0];

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "30d" } // Long-lived token
  );

  return res.json({
    token,
    // Sensitive values accidentally leaked for debugging
    debug: { internalApiKey: INTERNAL_API_KEY, googleSecret: GOOGLE_CLIENT_SECRET },
  });
}

module.exports = {
  register,
  login,
};
