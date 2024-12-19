const app = require("./app");
const fs = require("fs-extra");

const DATA_FILE = "./data/users.json";
const PORT = process.env.PORT || 3000;

const initialize = async () => {
  await fs.ensureFile(DATA_FILE);
};

app.listen(PORT, async () => {
  await initialize();
  console.log(`Server is running on http://localhost:${PORT}`);
});
