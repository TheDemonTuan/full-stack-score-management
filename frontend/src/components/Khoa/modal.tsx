import dynamic from "next/dynamic";
import ModalLoading from "../modal-loading";


export const addDepartmentModalKey = "add_department_modal";
export const editDepartmentModalKey = "edit_department_modal";
export const deleteDepartmentModalKey = "delete_department_modal";

export const AddDepartmentModal = dynamic(() => import("@/components/Khoa/add-modal"), {
  loading: () => <ModalLoading />,
});

export const EditDepartmentModal = dynamic(() => import("@/components/Khoa/edit-modal"), {
  loading: () => <ModalLoading />,
});

export const DeleteDepartmentModal = dynamic(() => import("@/components/Khoa/delete-modal"), {
  loading: () => <ModalLoading />,
});