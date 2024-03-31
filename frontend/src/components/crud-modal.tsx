"use client";

import { useModalStore } from "@/stores/modal-store";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import React from "react";

interface CRUDModalProps {
  children: React.ReactNode;
  title: string;
  btnText: string;
  isPending: boolean;
  handleSubmit: () => void;
}

const CRUDModal = ({ children, handleSubmit, isPending, btnText, title }: CRUDModalProps) => {
  const { modalClose } = useModalStore();

  return (
    <Modal
      isOpen
      onOpenChange={modalClose}
      isDismissable={!isPending}
      hideCloseButton={isPending}
      placement="center"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
      }}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-secondary">{title}</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose} isLoading={isPending}>
                Đóng
              </Button>
              <Button onClick={handleSubmit} color="secondary" isLoading={isPending}>
                {btnText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default React.memo(CRUDModal);
