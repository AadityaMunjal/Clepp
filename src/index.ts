const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());

const assignmentRoutes = require("./routes/assignments");
const questionRoutes = require("./routes/questions");
const userRoutes = require("./routes/user");

app.use("/assignments", assignmentRoutes);
app.use("/questions", questionRoutes);
app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
