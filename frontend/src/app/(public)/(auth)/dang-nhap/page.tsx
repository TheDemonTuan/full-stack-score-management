import React from "react";
import { Label } from "@/components/ui/v2/label";
import Link from "next/link";
import LoginForm from "@/components/Auth/Login/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

const DangNhapPage = () => {
  return (
    <div className="w-full">
      <LoginForm />
      <div className="flex items-center gap-1 text-sm justify-center mt-2">
        <Label>Chưa có tài khoản?</Label>
        <Link href={"/dang-ky"} className="link link-info">
          đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default DangNhapPage;
