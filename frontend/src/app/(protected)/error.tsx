"use client";

import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useModalStore } from "@/stores/modal-store";
import { Button } from "@nextui-org/react";
import { useQueryClient, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { useEffect } from "react";
import { IoIosRefresh } from "react-icons/io";
import { VscBracketError } from "react-icons/vsc";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { toast } = useToast();
  const { reset: resetTanQuery } = useQueryErrorResetBoundary();
  const queryClient = useQueryClient();
  const { modalClose } = useModalStore();

  useEffect(() => {
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
      action: (
        <ToastAction
          onClick={() => {
            reset();
            resetTanQuery();
            modalClose();
            queryClient.clear();
          }}
          altText="Try again">
          Try again
        </ToastAction>
      ),
    });
  }, [error, modalClose, queryClient, reset, resetTanQuery, toast]);

  return (
    <>
      <div className="text-center">
        <Button
          onClick={() => {
            reset();
            resetTanQuery();
            modalClose();
            queryClient.clear();
          }}
          isIconOnly
          color="danger"
          aria-label="Like">
          <IoIosRefresh size={28} />
        </Button>
        <h1 className="mb-4 text-6xl font-semibold text-red-500">{error.message}</h1>
        <div className="animate-bounce">
          <VscBracketError size={64} className="text-red-500 mx-auto" />
        </div>
        <p className="mb-4 text-lg text-gray-600">Có gì đó không đúng đang xảy ra!</p>
        <h2 className="mb-4 text-4xl font-semibold text-red-500">{error.digest}</h2>
        <h3 className="mb-4 text-xs font-semibold text-red-500">{error.stack}</h3>
      </div>
    </>
  );
}
