import { z } from "zod";

// Question Schema for Admin
export const questionFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answers: z
    .array(
      z.object({
        answer: z.string().min(1, "Answer is required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least 2 answers are required")
    .refine(
      (answers) => answers.filter((a) => a.isCorrect).length === 1,
      "Exactly one answer must be marked as correct"
    ),
});

export const questionsFormSchema = z.object({
  questions: z
    .array(questionFormSchema)
    .min(1, "At least one question is required"),
});

export const updateQuestionFormSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answers: z
    .array(
      z.object({
        id: z.number().optional(),
        answer: z.string().min(1, "Answer is required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least 2 answers are required")
    .refine(
      (answers) => answers.filter((a) => a.isCorrect).length === 1,
      "Exactly one answer must be marked as correct"
    ),
});

// Answer Schema for Applicants
export const submitAnswersFormSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.number(),
        answerId: z.number(),
      })
    )
    .min(1, "At least one answer is required"),
});

// Single question with vacancy ID for admin creation
export const singleQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  vacancyId: z.number().int().positive("Valid vacancy ID is required"),
  answers: z
    .array(
      z.object({
        answer: z.string().min(1, "Answer is required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least 2 answers are required")
    .refine(
      (answers) => answers.filter((a) => a.isCorrect).length === 1,
      "Exactly one answer must be marked as correct"
    ),
});
