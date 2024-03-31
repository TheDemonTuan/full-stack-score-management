import { z } from "zod";

export const RegisterFormValidateSchema = z.object({
  username: z
    .string({
      required_error: "Vui lòng nhập Username.",
    })
    .min(3, {
      message: "Username phải có ít nhất 3 ký tự.",
    })
    .max(30, {
      message: "Username không được quá 30 ký tự.",
    }),
  first_name: z
    .string({
      required_error: "Vui lòng nhập Họ.",
    })
    .min(3, {
      message: "Họ phải có ít nhất 3 ký tự.",
    })
    .max(30, {
      message: "Họ không được quá 30 ký tự.",
    })
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, {
      message: "Họ chỉ được phép là chữ cái",
    }),
  last_name: z
    .string({
      required_error: "Vui lòng nhập Tên.",
    })
    .min(3, {
      message: "Tên phải có ít nhất 3 ký tự.",
    })
    .max(30, {
      message: "Tên không được quá 30 ký tự.",
    })
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, {
      message: "Họ chỉ được phép là chữ cái",
    }),
  password: z
    .string({
      required_error: "Vui lòng nhập Password.",
    })
    .min(8, {
      message: "Password phải có nhất 8 ký tự.",
    }),
});

export type RegisterFormValidate = z.infer<typeof RegisterFormValidateSchema>;
