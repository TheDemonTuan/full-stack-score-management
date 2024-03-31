import { z } from "zod";

export const EditClassFormValidateSchema = z.object({
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
  host_instructor_id: z
    .string({
      required_error: "Giảng viên chủ nhiệm không được để trống.",
    })
    .min(1, {
      message: "Giảng viên chủ nhiệm không được để trống.",
    })
    .trim(),
});

export type EditClassFormValidate = z.infer<typeof EditClassFormValidateSchema>;
