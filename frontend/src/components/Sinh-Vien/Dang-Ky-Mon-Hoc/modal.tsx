import dynamic from "next/dynamic";
import ModalLoading from "@/components/modal-loading";

export const addStudentRegistrationModalKey = "add_student_registration_modal";
export const editStudentRegistrationModalKey = "edit_student_registration_modal";
export const deleteStudentRegistrationModalKey = "delete_student_registration_modal";

export const AddStudentRegistrationModal = dynamic(
  () => import("@/components/Sinh-Vien/Dang-Ky-Mon-Hoc/add-modal"),
  {
    loading: () => <ModalLoading />,
  }
);

export const EditStudentRegistrationModal = dynamic(
  () => import("@/components/Sinh-Vien/Dang-Ky-Mon-Hoc/edit-modal"),
  {
    loading: () => <ModalLoading />,
  }
);

export const DeleteStudentRegistrationModal = dynamic(
  () => import("@/components/Sinh-Vien/Dang-Ky-Mon-Hoc/delete-modal"),
  {
    loading: () => <ModalLoading />,
  }
);
