import { Request, Response } from "express";
import prisma from "../prismadb";

const express = require("express"),
  router = express.Router();

router.get("/:uid/:aid", async (req: Request, res: Response) => {
  const aid = req.params.aid;
  const uid = req.params.uid;
  const submission = await prisma.submission.findMany({
    where: {
      assignmentId: aid,
      userId: uid,
    },
  });

  if (submission.length > 0) {
    res.json(submission);
    return;
  } else {
    res.status(404).json({ message: "Submission not found" });
    return;
  }
});

router.post("/:uid/:aid", async (req: Request, res: Response) => {
  const aid = req.params.aid;
  const uid = req.params.uid;
  const code = req.body.code;
  const status = req.body.status;
  const submission = await prisma.submission.create({
    data: {
      assignmentId: aid,
      userId: uid,
      code,
      status,
      DOS: new Date(),
    },
  });

  res.json(submission);
});

module.exports = router;
