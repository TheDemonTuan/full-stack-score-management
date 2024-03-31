"use client";

import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { IoIosSearch } from "react-icons/io";
import { Input, Kbd, Skeleton } from "@nextui-org/react";

const SearchNav = () => {
  const { authCanUse } = useAuth();

  if (!authCanUse) return <Skeleton className="w-12 h-12 rounded-full lg:h-11 lg:w-72 lg:rounded-xl" />;

  return (
    <Input
      type="search"
      name="search"
      variant="bordered"
      color="secondary"
      size="lg"
      startContent={<IoIosSearch size={26} />}
      endContent={<Kbd keys={["command"]}>K</Kbd>}
      placeholder="Search..."
      className="lg_max:hidden"
    />
  );
};

export default SearchNav;
