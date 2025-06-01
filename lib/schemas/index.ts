import { registerFormSchema, registerFormSchemaBackend } from "./register.schema";
import loginFormSchema from "./login.schema";
import positionFormSchema from "./position.schema";
import { vacancyFormSchema, updateVacancyFormSchema } from "./vacancy.schema";
import {
  internshipFormSchema,
  updateInternshipFormSchema,
} from "./internship.schema";

export {
  // Auth
  registerFormSchema,
  registerFormSchemaBackend,
  loginFormSchema,

  // Position
  positionFormSchema,

  // Vacancy
  vacancyFormSchema,
  updateVacancyFormSchema,

  // Internship
  internshipFormSchema,
  updateInternshipFormSchema,
};
