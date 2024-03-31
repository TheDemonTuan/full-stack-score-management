import { z } from "zod";

export const AddClassFormValidateSchema = z.object({
  number_class: z
    .number({
      required_error: "Vui lòng nhập số lớp cần tạo.",
    })
    .int({
      message: "Số lớp phải là số nguyên.",
    })
    .gte(1, {
      message: "Số lớp phải lớn hơn hoặc bằng 1.",
    })
    .lte(99, {
      message: "Số lớp phải nhỏ hơn hoặc bằng 99.",
    }),
  academic_year: z
    .string({
      required_error: "Khoá học không được để trống.",
    })
    .trim(),
  max_students: z
    .number({
      required_error: "Vui lòng nhập số sinh sinh tối đa.",
    })
    .int({
      message: "Số sinh viên tối đa phải là số nguyên.",
    })
    .gte(15, {
      message: "Số sinh viên tối đa phải lớn hơn hoặc bằng 15.",
    })
    .lte(60, {
      message: "Số sinh viên tối đa phải nhỏ hơn hoặc bằng 60.",
    }),
  department_id: z
    .string({
      required_error: "Khoa không được để trống.",
    })
    .min(1, {
      message: "Khoa không được để trống.",
    })
    .trim(),
});

export type AddClassFormValidate = z.infer<typeof AddClassFormValidateSchema>;
