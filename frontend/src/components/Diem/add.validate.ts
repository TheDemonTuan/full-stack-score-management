import { z } from "zod";

export const AddClassFormValidateSchema = z.object({
  department_id: z
    .string({
      required_error: "Khoa không được để trống.",
    })
    .min(1, {
      message: "Khoa không được để trống.",
    })
    .trim(),
  subject_id: z
    .string({
      required_error: "Môn học không được để trống.",
    })
    .min(1, {
      message: "Môn học không được để trống.",
    })
    .trim(),
  by_instructor_id: z
    .string({
      required_error: "Giảng viên dạy không được để trống.",
    })
    .min(1, {
      message: "Giảng viên dạy không được để trống.",
    })
    .trim(),
  student_id: z
    .string({
      required_error: "Sinh viên học không được để trống.",
    })
    .min(1, {
      message: "Sinh viên học không được để trống.",
    })
    .trim(),
  process_score: z
    .string({
      required_error: "Vui lòng nhập điểm quá trình.",
    })
    .min(1, {
      message: "Điểm quá trình không được để trống.",
    })
    .trim(),
  midterm_score: z
    .string({
      required_error: "Vui lòng nhập điểm giữa kỳ.",
    })
    .min(1, {
      message: "Điểm giữa kỳ không được để trống.",
    })
    .trim(),
  final_score: z
    .string({
      required_error: "Vui lòng nhập điểm cuối kỳ.",
    })
    .min(1, {
      message: "Điểm cuối kỳ không được để trống.",
    })
    .trim(),
});

export type AddClassFormValidate = z.infer<typeof AddClassFormValidateSchema>;
