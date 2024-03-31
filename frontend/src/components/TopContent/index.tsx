"use client";

import React from "react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { usePathNameStore } from "@/stores/pathname-store";
import { FaUniversity } from "react-icons/fa";

const TopContent = () => {
  const { split, title } = usePathNameStore();
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2">
      <h2 className="text-4xl font-extrabold tracking-tight capitalize text-blue-500">{title}</h2>
      <div className="flex items-center space-x-2">
        <Breadcrumbs
          underline="hover"
          classNames={{
            list: "bg-gradient-to-br from-secondary to-fuchsia-500 shadow-small",
          }}
          itemClasses={{
            item: "text-white/60 data-[current=true]:text-white",
            separator: "text-white/40",
          }}
          variant="solid">
          <BreadcrumbItem href="/">
            <FaUniversity />
          </BreadcrumbItem>
          {split.map((item, index) => (
            <BreadcrumbItem className="capitalize" key={item} href={`/${split.slice(0, index + 1).join("/")}`}>
              {item}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </div>
    </div>
  );
};

export default TopContent;
