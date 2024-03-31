import dynamic from "next/dynamic";
import ModalLoading from "../modal-loading";


export const addClassModalKey = "add_class_modal";
export const editClassModalKey = "edit_class_modal";
export const deleteClassModalKey = "delete_class_modal";

export const AddClassModal = dynamic(() => import("@/components/Lop-Hoc/add-modal"), {
  loading: () => <ModalLoading />,
});

export const EditClassModal = dynamic(() => import("@/components/Lop-Hoc/edit-modal"), {
  loading: () => <ModalLoading />,
});

export const DeleteClassModal = dynamic(() => import("@/components/Lop-Hoc/delete-modal"), {
  loading: () => <ModalLoading />,
});