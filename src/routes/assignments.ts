import { Request, Response } from "express";
import prisma from "../prismadb";

const express = require("express"),
  router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  const assignments = await prisma.assignment.findMany();
  res.json(assignments);
});

router.get("/id/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (assignment) {
    res.json(assignment);
  } else {
    res.status(404).json({ error: "Assignment not found" });
  }
});

router.get("/year/:year", async (req: Request, res: Response) => {
  const { year } = req.params;
  const assignments = await prisma.assignment.findMany({
    where: {
      year: parseInt(year),
    },
  });

  res.json(assignments);
});

router.post("/", async (req: Request, res: Response) => {
  const { name, year, deadline, questions } = req.body;

  const created = await prisma.assignment.create({
    data: {
      name,
      deadline,
      year,
      DOC: new Date(Date.now()),
      pfp_color: ["#FF4BA2", "#FF5C5C", "#2BFF59", "#A22BFF", "#D89503"][
        Math.floor(Math.random() * 5)
      ],
      questions: {
        createMany: { data: questions },
      },
    },
  });

  res.json(created);
});

module.exports = router;
