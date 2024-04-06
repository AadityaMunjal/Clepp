import { Request, Response } from "express";
import prisma from "../prismadb";
import { Question } from "@prisma/client";

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

router.post("/check/:q_id", async (req: Request, res: Response) => {
  const questionId = req.params.q_id;
  const code = req.body.code;

  try {
    const question = (await prisma.question.findUnique({
      where: {
        id: questionId,
      },
    })) as Question;

    fetch("http://127.0.0.1:5000/execute", {
      method: "POST",
      body: JSON.stringify({
        c: code,
        tc: question.test_case,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (r) => {
      res.status(200).json(await r.json());
    });
  } catch (error) {
    res.status(404).json({ message: "Invalid questionId" });
  }
});

module.exports = router;
