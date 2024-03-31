import { z } from "zod";

export const LoginFormValidateSchema = z.object({
  username: z
    .string({
      required_error: "Vui lòng nhập username.",
    })
    .min(3, {
      message: "Username phải có ít nhất 3 ký tự.",
    })
    .max(30, {
      message: "Username không được quá 30 ký tự.",
    }),
  password: z
    .string({
      required_error: "Vui lòng nhập Password.",
    })
    .min(8, {
      message: "Password phải có nhất 8 ký tự.",
    }),
});

export type LoginFormValidate = z.infer<typeof LoginFormValidateSchema>;
