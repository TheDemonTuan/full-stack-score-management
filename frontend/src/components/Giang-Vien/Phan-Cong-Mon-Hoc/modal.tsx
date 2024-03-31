import dynamic from "next/dynamic";
import ModalLoading from "@/components/modal-loading";

export const addInstructorAssignmentModalKey = "add_instructor_assignment_modal";
export const editInstructorAssignmentModalKey = "edit_instructor_assignment_modal";
export const deleteInstructorAssignmentModalKey = "delete_instructor_assignment_modal";

export const AddInstructorAssignmentModal = dynamic(
  () => import("@/components/Giang-Vien/Phan-Cong-Mon-Hoc/add-modal"),
  {
    loading: () => <ModalLoading />,
  }
);

export const EditInstructorAssignmentModal = dynamic(
  () => import("@/components/Giang-Vien/Phan-Cong-Mon-Hoc/edit-modal"),
  {
    loading: () => <ModalLoading />,
  }
);

export const DeleteInstructorAssignmentModal = dynamic(
  () => import("@/components/Giang-Vien/Phan-Cong-Mon-Hoc/delete-modal"),
  {
    loading: () => <ModalLoading />,
  }
);
