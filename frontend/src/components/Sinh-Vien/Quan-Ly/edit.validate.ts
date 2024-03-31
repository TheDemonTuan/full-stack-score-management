import { z } from "zod";

export const EditStudentFormValidateSchema = z.object({
  first_name: z
    .string({
      required_error: "Họ không được để trống.",
    })
    .min(3, {
      message: "Họ không được ngắn hơn 3 ký tự.",
    })
    .max(50, {
      message: "Họ không được đài hơn 50 ký tự.",
    })
    .trim(),
  last_name: z
    .string({
      required_error: "Tên không được để trống.",
    })
    .min(3, {
      message: "Tên không được ngắn hơn 3 ký tự.",
    })
    .max(30, {
      message: "Tên không được dài hơn 30 ký tự.",
    })
    .trim(),
  email: z
    .string({
      required_error: "Email không được để trống.",
    })
    .email({
      message: "Email không hợp lệ.",
    })
    .trim(),
  address: z
    .string({
      required_error: "Địa chỉ không được để trống.",
    })
    .min(5, {
      message: "Địa chỉ không được ngắn hơn 5 ký tự.",
    })
    .max(100, {
      message: "Địa chỉ không được dài hơn 100 ký tự.",
    })
    .trim(),
  phone: z
    .string({
      required_error: "Số điện thoại không được để trống.",
    })
    .min(10, {
      message: "Số điện thoại không được ngắn hơn 10 ký tự.",
    })
    .max(11, {
      message: "Số điện thoại không được dài hơn 11 ký tự.",
    })
    .trim(),
  gender: z
    .string({
      required_error: "Giới tính không được để trống.",
    })
    .trim(),
  birth_day: z.date({
    required_error: "Ngày sinh không được để trống.",
  }),
  academic_year: z
    .string({
      required_error: "Khoá học không được để trống.",
      invalid_type_error: "Khoá học không hợp lệ.",
    })
    .min(1, {
      message: "Khoá học không được để trống.",
    })
    .trim(),
  department_id: z
    .string({
      required_error: "Khoa không được để trống.",
      invalid_type_error: "Khoa không hợp lệ.",
    })
    .min(1, {
      message: "Khoa không được để trống.",
    })
    .trim(),
  class_id: z
    .string({
      required_error: "Lớp không được để trống.",
      invalid_type_error: "Lớp không hợp lệ.",
    })
    .min(1, {
      message: "Lớp không được để trống.",
    })
    .trim(),
});

export type EditStudentFormValidate = z.infer<typeof EditStudentFormValidateSchema>;
