import dynamic from "next/dynamic";
import ModalLoading from "@/components/modal-loading";

export const addInstructorModalKey = "add_instructor_modal";
export const editInstructorModalKey = "edit_instructor_modal";
export const deleteInstructorModalKey = "delete_instructor_modal";

export const AddInstructorModal = dynamic(() => import("@/components/Giang-Vien/Quan-Ly/add-modal"), {
  loading: () => <ModalLoading />,
});

export const EditInstructorModal = dynamic(() => import("@/components/Giang-Vien/Quan-Ly/edit-modal"), {
  loading: () => <ModalLoading />,
});

export const DeleteInstructorModal = dynamic(() => import("@/components/Giang-Vien/Quan-Ly/delete-modal"), {
  loading: () => <ModalLoading />,
});
