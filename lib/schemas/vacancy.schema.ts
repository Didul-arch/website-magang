import { z } from "zod";

const vacancyFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  thumbnail: z.string().optional(),
  location: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
  status: z.enum(["OPEN", "CLOSED"]), // Removed .default("OPEN")
  startDate: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d > new Date();
    },
    {
      message: "Start date must be a valid date in the future",
    }
  ),
  endDate: z.string().refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime()) && d > new Date();
    },
    {
      message: "End date must be a valid date in the future",
    }
  ),
  positionId: z.number().optional(),
});

const updateVacancyFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).optional(),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .optional(),
  thumbnail: z.string().optional(),
  location: z.enum(["REMOTE", "ONSITE", "HYBRID"]).optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(), // Removed .default("OPEN")
  startDate: z
    .string()
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d > new Date();
      },
      {
        message: "Start date must be a valid date in the future",
      }
    )
    .optional(),
  endDate: z
    .string()
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d > new Date();
      },
      {
        message: "End date must be a valid date in the future",
      }
    )
    .optional(),
  positionId: z.number().optional(),
});

// Define the type based on the schema inference
type VacancyFormValues = z.infer<typeof vacancyFormSchema>;

export { vacancyFormSchema, updateVacancyFormSchema };
export type { VacancyFormValues }; // Export the type
