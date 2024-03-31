import { z } from "zod";

export const AddSubjectFormValidateSchema = z.object({
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
  credits: z
    .number({
      required_error: "Vui lòng nhập số tín chỉ.",
    })
    .int({
      message: "Số tín chỉ phải là số nguyên.",
    })
    .gte(1, {
      message: "Số tín chỉ phải lớn hơn hoặc bằng 1.",
    })
    .lte(128, {
      message: "Số tín chỉ phải nhỏ hơn hoặc bằng 128.",
    }),
  process_percentage: z
    .number({
      required_error: "Vui lòng nhập % quá trình.",
    })
    .int({
      message: "% quá trình phải là số nguyên.",
    })
    .gte(0, {
      message: "% quá trình không được nhỏ hơn 0.",
    })
    .lte(50, {
      message: "% quá trình không được lớn hơn 50.",
    }),
  midterm_percentage: z
    .number({
      required_error: "Vui lòng nhập % giữa kì.",
    })
    .int({
      message: "% giữa kì phải là số nguyên.",
    })
    .gte(0, {
      message: "% giữa kì không được nhỏ hơn 0.",
    })
    .lte(50, {
      message: "% giữa kì không được lớn hơn 50.",
    }),
  final_percentage: z
    .number({
      required_error: "Vui lòng nhập % cuối kì.",
    })
    .int({
      message: "% cuối kì phải là số nguyên.",
    })
    .gte(50, {
      message: "% cuối kì không được nhỏ hơn 50.",
    })
    .lte(100, {
      message: "% cuối kì không được lớn hơn 100.",
    }),
  department_id: z
    .string({
      required_error: "Khoa không được để trống.",
    })
    .trim(),
});

export type AddSubjectFormValidate = z.infer<typeof AddSubjectFormValidateSchema>;
