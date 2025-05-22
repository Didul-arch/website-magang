import { z } from "zod";

const vacancyFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  thumbnail: z.string().optional(),
  location: z.enum(["REMOTE", "ONSITE", "HYBRID"]),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
  startDate: z.date().refine((date) => date > new Date(), {
    message: "Start date must be in the future",
  }),
  endDate: z.date().refine((date) => date > new Date(), {
    message: "End date must be in the future",
  }),
  positionId: z.number().optional(),
});

export default vacancyFormSchema;
