import dynamic from "next/dynamic";
import ModalLoading from "../modal-loading";


export const addGradeModalKey = "add_grade_modal";
export const editGradeModalKey = "edit_grade_modal";
export const deleteGradeModalKey = "delete_grade_modal";

export const AddGradeModal = dynamic(() => import("@/components/Diem/add-modal"), {
  loading: () => <ModalLoading />,
});

export const EditGradeModal = dynamic(() => import("@/components/Diem/edit-modal"), {
  loading: () => <ModalLoading />,
});

export const DeleteGradeModal = dynamic(() => import("@/components/Diem/delete-modal"), {
  loading: () => <ModalLoading />,
});