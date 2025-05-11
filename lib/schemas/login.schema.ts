import { z } from "zod";

const registerFormSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
});

export default registerFormSchema;
