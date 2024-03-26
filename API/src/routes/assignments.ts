import { Request, Response } from "express";
import prisma from "../prismadb";

const express = require("express"),
  router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  const assignments = await prisma.assignment.findMany();
  res.json(assignments);
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const assignment = await prisma.assignment.findUnique({
      where: {
        id,
      },
    });

    if (assignment) {
      res.json(assignment);
    } else {
      // unexiting assignment and wrong assignmentId both return 404
      res.status(404).json({ error: "Assignment not found" });
    }
  } catch (error) {
    res.status(404).json({ error: "Invalid assignment ID" });
  }
});

router.get("/year/:year", async (req: Request, res: Response) => {
  const { year } = req.params;
  const assignments = await prisma.assignment.findMany({
    where: {
      year,
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

router.get("/defaulters/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const assignment = await prisma.assignment.findUnique({
      where: {
        id,
      },
      include: {
        submissions: true,
      },
    });
    const submittedIds = assignment.submissions.map((s: any) => s.userId);
    const allUsers = await prisma.user.findMany({
      where: {
        year: assignment.year,
      },
    });

    const allUserIds = allUsers.map((u: any) => u.id);

    const defaulters = allUserIds.filter(
      (id: string) => !submittedIds.includes(id)
    );
    res.json(defaulters);
  } catch (error) {
    res.status(404).json({ error: "Invalid assignment ID" });
  }
});

router.get("/submitted/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const assignment = await prisma.assignment.findUnique({
      where: {
        id,
      },
      include: {
        submissions: true,
      },
    });

    const submittedIds = assignment.submissions.map((s: any) => s.userId);

    res.json(submittedIds);
  } catch (error) {
    res.status(404).json({ error: "Invalid assignment ID" });
  }
});

module.exports = router;
