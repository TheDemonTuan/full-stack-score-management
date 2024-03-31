"use client";

import { UserNav } from "./user";
import SearchNav from "./search";
import { CiMenuFries } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { useSideBarStore } from "@/stores/sidebar-store";
import { useAuth } from "@/hooks/useAuth";
const Navbar = () => {
  const { isOpen, setIsOpen } = useSideBarStore();
  const { authCanUse } = useAuth();

  return (
    <>
      <div className="lg_max:fixed flex items-center justify-between w-full h-16 shadow-navbar lg:rounded-lg bg-white px-2 lg:px-4 z-50">
        <div className="flex items-center">
          {authCanUse && (
            <label className="btn btn-circle lg:hidden" onClick={() => setIsOpen(!isOpen)}>
              {!isOpen && <CiMenuFries size={30} className="animate-appearance-in duration-1000" />}
              {isOpen && <IoMdClose size={30} className="animate-appearance-in duration-1000" />}
            </label>
          )}
          <SearchNav />
        </div>
        <UserNav />
      </div>
      <div className="mt-16 lg:hidden"></div>
    </>
  );
};

export default Navbar;
