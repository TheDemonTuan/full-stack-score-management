import dynamic from "next/dynamic";
import ModalLoading from "../modal-loading";

export const addSubjectModalKey = "add_subject_modal";
export const editSubjectModalKey = "edit_subject_modal";
export const deleteSubjectModalKey = "delete_subject_modal";

export const AddSubjectModal = dynamic(() => import("@/components/Mon-Hoc/add-modal"), {
  loading: () => <ModalLoading />,
});

export const EditSubjectModal = dynamic(() => import("@/components/Mon-Hoc/edit-modal"), {
  loading: () => <ModalLoading />,
});

export const DeleteSubjectModal = dynamic(() => import("@/components/Mon-Hoc/delete-modal"), {
  loading: () => <ModalLoading />,
});
