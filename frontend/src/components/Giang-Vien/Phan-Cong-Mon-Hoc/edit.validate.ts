import { z } from "zod";

export const EditInstructorAssignmentFormValidateSchema = z.object({
  department_id: z
    .string({
      required_error: "Khoa không được để trống.",
      invalid_type_error: "Khoa không hợp lệ.",
    })
    .min(1, "Khoa không được để trống.")
    .trim(),
  instructor_id: z
    .string({
      required_error: "Giảng viên không được để trống.",
      invalid_type_error: "Giảng viên không hợp lệ.",
    })
    .min(1, "Giảng viên không được để trống.")
    .trim(),
  subject_id: z
    .string({
      required_error: "Môn học không được để trống.",
      invalid_type_error: "Môn học không hợp lệ.",
    })
    .min(1, "Môn học không được để trống.")
    .trim(),
});

export type EditInstructorAssignmentFormValidate = z.infer<typeof EditInstructorAssignmentFormValidateSchema>;
