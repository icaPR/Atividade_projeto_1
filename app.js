const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users");

const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
app.use(express.json());

app.use(errorHandler);

module.exports = app;
