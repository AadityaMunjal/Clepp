import { Request, Response } from "express";
import prisma from "../prismadb";

const express = require("express"),
  router = express.Router();

router.get("assignment-id/:a_id", async (req: Request, res: Response) => {
  const { a_id } = req.params;

  const questions = await prisma.question.findMany({
    where: {
      assignmentId: parseInt(a_id),
    },
  });

  res.json(questions);
});

module.exports = router;
