"use client";

import Link from "next/link";
import MenuSide from "./menu";
import { useSideBarStore } from "@/stores/sidebar-store";
import NextImage from "next/image";
import { cn } from "@/lib/cn";
import styles from "@/styles/sidebar.module.css";
import { Image } from "@nextui-org/react";

const Sidebar = () => {
  const { isOpen } = useSideBarStore();

  return (
    <div
      className={cn(
        "flex flex-col w-[80%] sm:w-64 h-dvh shadow-sidebar bg-white sticky top-0 space-y-2 transition-all z-50",
        isOpen && styles.sidebarOpen,
        !isOpen && "lg_max:animate-appearance-out lg_max:hidden"
      )}>
      <div className="flex items-center gap-2 h-16 border-b border-gray-300">
        <Link href={"/"}>
          <Image
            as={NextImage}
            className="object-contain w-16 h-16"
            src="/logo.webp"
            priority={true}
            alt="logo"
            width={500}
            height={500}
            quality={100}
            isBlurred
          />
        </Link>
        <div className="text-sm lg:text-md">
          <h6 className="font-bold">T&Đ Score Management</h6>
          <p className="text-xs lg_max:text-center">Hệ thống quản lý điểm sinh viên</p>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <MenuSide />
      </div>
    </div>
  );
};

export default Sidebar;
