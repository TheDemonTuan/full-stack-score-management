import { z } from "zod";

export const EditInstructorFormValidateSchema = z.object({
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
  degree: z
    .string({
      required_error: "Bằng cấp không được để trống.",
    })
    .min(5, {
      message: "Bằng cấp không được ngắn hơn 5 ký tự.",
    })
    .max(50, {
      message: "Bằng cấp không được dài hơn 50 ký tự.",
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
  birth_day: z
    .date({
      required_error: "Ngày sinh không được để trống.",
    })
    .max(new Date(), {
      message: "Ngày sinh không được lớn hơn ngày hiện tại.",
    }),
  department_id: z
    .string({
      required_error: "Khoa không được để trống.",
      invalid_type_error: "Khoa không hợp lệ.",
    })
    .min(1, {
      message: "Khoa không được để trống.",
    })
    .trim(),
});

export type EditInstructorFormValidate = z.infer<typeof EditInstructorFormValidateSchema>;
