import { Request, Response } from "express";
import prisma from "../prismadb";

const express = require("express"),
  router = express.Router();

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

router.get("exists/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    const userExists = !!user;

    res.json({ userExists });
  } catch (error) {
    res.status(404).json({ message: "User not found" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { id, email, image, name, year } = req.body;

  const data = {
    id,
    email,
    image,
    name,
    year,
  };

  const user = await prisma.user.create({
    data,
  });

  res.json(user);
});

module.exports = router;
