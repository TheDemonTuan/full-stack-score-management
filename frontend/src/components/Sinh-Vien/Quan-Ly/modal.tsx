import dynamic from "next/dynamic";
import ModalLoading from "../../modal-loading";

export const addStudentModalKey = "add_student_modal";
export const editStudentModalKey = "edit_student_modal";
export const deleteStudentModalKey = "delete_student_modal";

export const AddStudentModal = dynamic(() => import("@/components/Sinh-Vien/Quan-Ly/add-modal"), {
  loading: () => <ModalLoading />,
});

export const EditStudentModal = dynamic(() => import("@/components/Sinh-Vien/Quan-Ly/edit-modal"), {
  loading: () => <ModalLoading />,
});

export const DeleteStudentModal = dynamic(() => import("@/components/Sinh-Vien/Quan-Ly/delete-modal"), {
  loading: () => <ModalLoading />,
});
