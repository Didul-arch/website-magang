import { z } from "zod";

const registerFormSchema = z
  .object({
    fullName: z.string().min(3, { message: "Nama harus minimal 3 karakter" }),
    email: z.string().email({ message: "Email tidak valid" }),
    phoneNumber: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, {
      message: "Nomor telepon tidak valid",
    }),
    university: z
      .string()
      .min(3, { message: "Nama universitas harus minimal 3 karakter" }),
    major: z.string().min(2, { message: "Jurusan harus minimal 2 karakter" }),
    semester: z.number().min(1, { message: "Semester tidak valid" }),
    idCard: z.string().optional(),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Konfirmasi password minimal 6 karakter" }),
    vacancyId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export default registerFormSchema;
