import { z } from "zod";

export const AddStudentRegistrationFormValidateSchema = z.object({
  department_id: z
    .string({
      required_error: "Khoa không được để trống.",
      invalid_type_error: "Khoa không hợp lệ.",
    })
    .min(1, "Khoa không được để trống.")
    .trim(),
  student_id: z
    .string({
      required_error: "Sinh viên không được để trống.",
      invalid_type_error: "Sinh viên không hợp lệ.",
    })
    .min(1, "Sinh viên không được để trống.")
    .trim(),
  subject_id: z
    .string({
      required_error: "Môn học không được để trống.",
      invalid_type_error: "Môn học không hợp lệ.",
    })
    .min(1, "Môn học không được để trống.")
    .trim(),
});

export type AddStudentRegistrationFormValidate = z.infer<typeof AddStudentRegistrationFormValidateSchema>;
