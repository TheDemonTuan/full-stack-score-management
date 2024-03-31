"use client";

import React, { useEffect } from "react";
import { MenuData } from "./menu-data";
import Link from "next/link";
import styles from "@/styles/sidebar.module.css";
import { cn } from "@/lib/cn";
import { usePathname } from "next/navigation";
import { usePathNameStore } from "@/stores/pathname-store";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@nextui-org/react";
import { useSideBarStore } from "@/stores/sidebar-store";

const MenuSide = () => {
  const pathName = usePathname();
  const { current, changeTitle, changeCurrent } = usePathNameStore();
  const { setIsOpen } = useSideBarStore();
  const { authCanUse } = useAuth();

  useEffect(() => {
    MenuData.forEach((item, index) => {
      if (pathName === item?.link || (index && pathName?.startsWith(item?.link))) {
        changeTitle(item?.title);
        changeCurrent(pathName);
        document.title = item?.title;
      }
    });
  }, [changeCurrent, changeTitle, pathName]);

  if (!authCanUse) return <Spinner label="Loading..." color="secondary" className="w-full h-full" size="lg" />;

  return (
    <ul className="menu menu-md text-gray-500 text-2xl gap-2">
      {MenuData.map((item, index) => (
        <li key={index} className={cn(current === item?.link && `${styles["active"]}`)}>
          {!item?.children && (
            <Link href={item?.link} title={item?.title} onClick={() => setIsOpen(false)}>
              <item.icon size={23} className="text-secondary" />
              {item?.title}
            </Link>
          )}
          {item?.children && (
            <details open={current.startsWith(item?.link)}>
              <summary className={cn(current.startsWith(item?.link) && "underline text-secondary")}>
                <item.icon size={23} className="text-secondary" />
                {item?.title}
              </summary>
              <ul className="space-y-2">
                {item?.children.map((child, index) => (
                  <li key={index} className={cn(current === item?.link + child?.link && `${styles["active"]}`)}>
                    <Link
                      href={item?.link + child?.link}
                      title={child?.title + " " + item?.title}
                      onClick={() => setIsOpen(false)}>
                      <child.icon size={23} className="text-secondary" />
                      {child?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
};

export default MenuSide;
