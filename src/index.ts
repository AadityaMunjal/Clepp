const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
import prisma from "./prismadb";

import { Request, Response } from "express";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());

app.get("/", async (req: Request, res: Response) => {
  req;
  const assignments = await prisma.assignment.findMany();

  res.json(assignments);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
