import React from "react";
import { Label } from "@/components/ui/v2/label";
import Link from "next/link";
import RegisterForm from "@/components/Auth/Register/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký",
};

const DangKyPage = () => {
  return (
    <div className="w-full">
      <RegisterForm />
      <div className="flex items-center gap-1 text-sm justify-center mt-2">
        <Label>Đã có tài khoản ư?</Label>
        <Link href={"/dang-nhap"} className="link link-info">
          đăng nhập ngay
        </Link>
      </div>
    </div>
  );
};


export default DangKyPage;
