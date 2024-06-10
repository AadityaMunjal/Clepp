import { Request, Response } from "express";
import prisma from "../prismadb";

const express = require("express"),
  router = express.Router();

router.get("/:uid/:aid", async (req: Request, res: Response) => {
  const aid = req.params.aid;
  const uid = req.params.uid;

  try {
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
      // unexiting submission and wrong submissionId both return 404
      res.status(404).json({ message: "Submission not found" });
      return;
    }
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.post("/update/:sid", async (req: Request, res: Response) => {
  const submission_id = req.params.sid;
  const code = req.body.code;
  const status = req.body.status;

  const data = {
    status,
    DOS: new Date(),
  } as any;

  if (code) {
    data["code"] = code;
  }

  try {
    const submission = await prisma.submission.update({
      where: {
        id: submission_id,
      },
      data,
    });

    res.json(submission);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

router.post("/create/:uid/:aid", async (req: Request, res: Response) => {
  const aid = req.params.aid;
  const uid = req.params.uid;
  const code = req.body.code;
  const status = req.body.status;

  const submission = await prisma.submission.create({
    data: {
      code,
      status,
      assignmentId: aid,
      userId: uid,
      DOS: new Date(),
    },
  });

  res.json(submission);
});

module.exports = router;
