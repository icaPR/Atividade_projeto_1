const express = require("express");
const fs = require("fs-extra");
const { authenticate } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const router = express.Router();

const DATA_FILE = "./data/products.json";

const loadProducts = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveProducts = async (products) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
};

// List Products (with pagination)
router.get("/", async (req, res) => {
  const { limite = 5, página = 1 } = req.query;
  const limit = [5, 10, 30].includes(parseInt(limite)) ? parseInt(limite) : 5;
  const page = parseInt(página) > 0 ? parseInt(página) : 1;

  const products = await loadProducts();
  const paginated = products.slice((page - 1) * limit, page * limit);
  res.status(200).json(paginated);
});

// Get Product by ID
router.get("/:id", async (req, res) => {
  const products = await loadProducts();
  const product = products.find((p) => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.status(200).json(product);
});

// Create Product
router.post("/", authenticate, async (req, res) => {
  const { name, price, categoryId } = req.body;
  if (!name || !price || !categoryId) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const products = await loadProducts();
  const newProduct = {
    id: products.length + 1,
    name,
    price,
    categoryId,
  };

  products.push(newProduct);
  await saveProducts(products);
  res.status(201).json(newProduct);
});

// Update Product
router.put("/:id", authenticate, async (req, res) => {
  const { name, price, categoryId } = req.body;
  const products = await loadProducts();
  const productIndex = products.findIndex(
    (p) => p.id === parseInt(req.params.id)
  );

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products[productIndex] = {
    ...products[productIndex],
    name,
    price,
    categoryId,
  };
  await saveProducts(products);
  res.status(200).json(products[productIndex]);
});

// Delete Product
router.delete("/:id", authenticate, isAdmin, async (req, res) => {
  const products = await loadProducts();
  const productIndex = products.findIndex(
    (p) => p.id === parseInt(req.params.id)
  );

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products.splice(productIndex, 1);
  await saveProducts(products);
  res.status(200).json({ message: "Product deleted successfully" });
});

module.exports = router;
