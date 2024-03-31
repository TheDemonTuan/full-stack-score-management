"use client";

import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { clearJwt } from "@/app/actions";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@nextui-org/react";

export function UserNav() {
  const { authData, authCanUse } = useAuth();
  const queryClient = useQueryClient();

  if (!authCanUse) return <Skeleton className="h-11 w-11 rounded-full" />;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="avatar online cursor-pointer rounded-full ring">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/guest-avatar.png" alt="User Avatar" />
            <AvatarFallback>avatar</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">@{authData?.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {authData?.first_name} {authData?.last_name}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await toast.promise(clearJwt(), {
              pending: "Đang đăng xuất...",
              success: "Đăng xuất thành công 👌",
              error: "Đăng xuất thất bại 🤯",
            });
            queryClient.clear();
          }}
        >
          Đăng xuất
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}