const express = require("express");
const fs = require("fs-extra");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

const DATA_FILE = "./data/categories.json";

const loadCategories = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveCategories = async (categories) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(categories, null, 2));
};

// List Categories
router.get("/", async (req, res) => {
  const categories = await loadCategories();
  res.status(200).json(categories);
});

// Create Category
router.post("/", authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const categories = await loadCategories();
  const newCategory = {
    id: categories.length + 1,
    name,
  };

  categories.push(newCategory);
  await saveCategories(categories);
  res.status(201).json(newCategory);
});

module.exports = router;
