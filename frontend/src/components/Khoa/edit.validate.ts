import { z } from "zod";

export const EditDepartmentFormValidateSchema = z.object({
  id: z
    .number({
      required_error: "Vui lòng nhập mã khoa.",
      invalid_type_error: "Mã khoa phải là số.",
    })
    .int({
      message: "Mã khoa phải là số nguyên.",
    })
    .gte(1, {
      message: "Mã khoa không được ít hơn 1.",
    })
    .lte(99, {
      message: "Mã khoa không được quá 99.",
    }),
  symbol: z
    .string({
      required_error: "Vui lòng nhập ký hiệu.",
    })
    .min(2, {
      message: "Ký hiệu không được ít hơn 2 ký tự.",
    })
    .max(10, {
      message: "Ký hiệu không được quá 10 ký tự.",
    })
    .trim(),
  name: z
    .string({
      required_error: "Vui lòng nhập tên.",
    })
    .min(3, {
      message: "Tên không được ít hơn 3 ký tự.",
    })
    .max(100, {
      message: "Tên không được quá 100 ký tự.",
    })
    .trim(),
});

export type EditDepartmentFormValidate = z.infer<typeof EditDepartmentFormValidateSchema>;
