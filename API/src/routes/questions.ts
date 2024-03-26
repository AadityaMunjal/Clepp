import { Request, Response } from "express";
import prisma from "../prismadb";

const express = require("express"),
  router = express.Router();

router.get("/:a_id", async (req: Request, res: Response) => {
  const { a_id } = req.params;

  try {
    const questions = await prisma.question.findMany({
      where: {
        assignmentId: a_id,
      },
    });

    res.json(questions);
  } catch (error) {
    res.status(404).json({ message: "Questions not found" });
  }
});

module.exports = router;
