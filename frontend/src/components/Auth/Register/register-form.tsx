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
import { RegisterFormValidate, RegisterFormValidateSchema } from "./register-form.validate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthRegisterParams, authRegister } from "@/api/auth";
import { toast } from "react-toastify";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { Button, Input } from "@nextui-org/react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const RegisterForm = () => {
  const queryClient = useQueryClient();

  const registerForm = useForm<RegisterFormValidate>({
    resolver: zodResolver(RegisterFormValidateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      password: "",
    },
  });

  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const { mutate: registerMutate, isPending: registerIsPending } = useMutation<
    ApiSuccessResponse<UserResponse>,
    ApiErrorResponse,
    AuthRegisterParams
  >({
    mutationFn: async (params) => await authRegister(params),
    onSuccess: (res) => {
      toast.success("Đăng ký thành công !");
      registerForm.reset();
      queryClient.setQueryData(["auth"], res);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Đăng ký thất bại!");
    },
  });

  const onSubmit = async (data: RegisterFormValidate) => {
    registerMutate({
      first_name: data?.first_name,
      last_name: data?.last_name,
      username: data?.username,
      password: data?.password,
    });
  };
  return (
    <Form {...registerForm}>
      <form method="post" onSubmit={registerForm.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-flow-col gap-2">
          <FormField
            control={registerForm.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isRequired
                    isInvalid={!!registerForm.formState.errors.first_name}
                    label="Họ"
                    variant="faded"
                    onClear={() => registerForm.resetField("first_name")}
                    placeholder="John"
                    {...field}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={registerForm.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isRequired
                    isInvalid={!!registerForm.formState.errors.last_name}
                    label="Tên"
                    variant="faded"
                    onClear={() => registerForm.resetField("last_name")}
                    placeholder="Wich"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={registerForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  isRequired
                  isInvalid={!!registerForm.formState.errors.username}
                  label="Username"
                  variant="faded"
                  onClear={() => registerForm.resetField("username")}
                  placeholder="iluvstu"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  isRequired
                  isInvalid={!!registerForm.formState.errors.password}
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
        <Button
          color="secondary"
          type="submit"
          className="w-full"
          variant="shadow"
          isLoading={registerIsPending}
        >
          Đăng ký
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
