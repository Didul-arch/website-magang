import { z } from "zod";

const internshipFormSchema = z.object({
  company: z.string().min(1, { message: "Company is required" }),
  degree: z.string().min(1, { message: "Degree is required" }),
  semester: z.preprocess(
    (val) => Number(val),
    z.number().int().min(1, { message: "Semester must be a positive integer" })
  ),
  idCard: z.string().min(1, { message: "ID Card is required" }),
  cv: z
    .any()
    .refine(
      (file) =>
        file instanceof File ||
        (file && typeof file === "object" && "originalname" in file),
      {
        message: "CV file is required",
      }
    )
    .optional(),
  portfolio: z
    .any()
    .refine(
      (file) =>
        file instanceof File ||
        (file && typeof file === "object" && "originalname" in file),
      {
        message: "Portfolio file is required",
      }
    )
    .optional(),
  userId: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
});

const updateInternshipFormSchema = z.object({
  company: z
    .string()
    .min(1, { message: "Company name is too short" })
    .optional(),
  degree: z.string().min(1, { message: "Degree name is too short" }).optional(),
  semester: z.preprocess(
    (val) => (val === undefined ? undefined : Number(val)),
    z
      .number()
      .int()
      .min(1, { message: "Semester must be a positive integer" })
      .optional()
  ),
  idCard: z.string().min(1, { message: "ID Card is required" }).optional(),
  cv: z.any().optional(),
  portfolio: z.any().optional(),
  userId: z.string().optional(),
  status: z
    .enum(["PENDING", "APPROVED", "REJECTED"])
    .default("PENDING")
    .optional(),
});

export { internshipFormSchema, updateInternshipFormSchema };
