"use client";

import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthLoginParams, authLogin } from "@/api/auth";
import { toast } from "react-toastify";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { LoginFormValidate, LoginFormValidateSchema } from "./login-form.validate";
import { Button, Input } from "@nextui-org/react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const LoginForm = () => {
  const queryClient = useQueryClient();
  const loginForm = useForm<LoginFormValidate>({
    resolver: zodResolver(LoginFormValidateSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const { mutate: loginMutate, isPending: loginIsPending } = useMutation<
    ApiSuccessResponse<UserResponse>,
    ApiErrorResponse,
    AuthLoginParams
  >({
    mutationFn: async (params) => await authLogin(params),
    onSuccess: (res) => {
      toast.success("Đăng nhập thành công !");
      loginForm.reset();
      queryClient.setQueryData(["auth"], res);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Đăng nhập thất bại !");
    },
  });

  const onSubmit = async (data: LoginFormValidate) => {
    loginMutate({
      username: data?.username,
      password: data?.password,
    });
  };

  return (
    <Form {...loginForm}>
      <form method="post" onSubmit={loginForm.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
          control={loginForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  isRequired
                  isInvalid={!!loginForm.formState.errors.username}
                  label="Username"
                  variant="faded"
                  onClear={() => loginForm.resetField("username")}
                  placeholder="iluvstu"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  isRequired
                  isInvalid={!!loginForm.formState.errors.password}
                  label="Password"
                  endContent={
                    <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                      {isVisible ? (
                        <FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <FaEye className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  type={isVisible ? "text" : "password"}
                  variant="faded"
                  placeholder="1234****"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button color="secondary" type="submit" className="w-full" variant="shadow" isLoading={loginIsPending}>
          Đăng nhập
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
