const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");
const productsRoutes = require("./routes/products");
const categoriesRoutes = require("./routes/categories");
const errorHandler = require("./middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

dotenv.config();

const app = express();
app.use(express.json());

app.use(errorHandler);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/install", async (req, res) => {
  const users = await loadUsers();
  const adminExists = users.some((user) => user.isAdmin);

  if (adminExists) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const admin = {
    id: users.length + 1,
    username: "admin",
    password: await bcrypt.hash("admin123", 10), // Use bcrypt for password hashing
    isAdmin: true,
  };

  users.push(admin);
  await saveUsers(users);

  res.status(201).json({ message: "Admin created successfully", admin });
});

app.use("/api/users", userRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);

module.exports = app;
