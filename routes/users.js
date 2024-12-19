const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs-extra");
const { authenticate } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();
const DATA_FILE = "./data/users.json";

const loadUsers = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveUsers = async (users) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
};

// Register
router.post("/register", async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const users = await loadUsers();
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({
    id: users.length + 1,
    username,
    password: hashedPassword,
    name,
    isAdmin: false,
  });
  await saveUsers(users);
  res.status(201).json({ message: "User registered successfully" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const users = await loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.status(200).json({ token });
});

// Create Admin
router.post("/create-admin", authenticate, isAdmin, async (req, res) => {
  const { username, password, name } = req.body;
  const users = await loadUsers();
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({
    id: users.length + 1,
    username,
    password: hashedPassword,
    name,
    isAdmin: true,
  });
  await saveUsers(users);
  res.status(201).json({ message: "Admin created successfully" });
});

// Delete User
router.delete("/delete/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const users = await loadUsers();
  const userIndex = users.findIndex((user) => user.id === parseInt(id));
  if (userIndex === -1 || users[userIndex].isAdmin) {
    return res
      .status(404)
      .json({ message: "User not found or cannot delete admin" });
  }

  users.splice(userIndex, 1);
  await saveUsers(users);
  res.status(200).json({ message: "User deleted successfully" });
});

module.exports = router;
