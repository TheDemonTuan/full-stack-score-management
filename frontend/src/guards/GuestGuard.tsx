"use client";

import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const GuestGuard = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { authIsSuccess, authIsError, authIsFetching } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authIsSuccess) {
      router.replace("/");
    }
  }, [authIsSuccess, router]);

  return (
    <>
      {!authIsFetching && authIsError ? children : <Spinner label="Loading..." color="secondary" />}
    </>
  );
};

export default GuestGuard;
