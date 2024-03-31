import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { DepartmentResponse } from "@/api/departments";
import CrudModal from "../../crud-modal";
import { StudentDeleteByIdParams, StudentResponse, studentDeleteById } from "@/api/students";
import { ClassResponse } from "@/api/classes";

const DeleteStudentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as StudentResponse,
    }))
  );

  const { mutate: deleteMutate, isPending: deleteIsPending } = useMutation<
    ApiSuccessResponse,
    ApiErrorResponse,
    StudentDeleteByIdParams
  >({
    mutationFn: async (params) => await studentDeleteById(params),
    onSuccess: () => {
      toast.success(`Xoá sinh viên thành công !`);
      queryClient.setQueryData(["students"], (oldData: ApiSuccessResponse<StudentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.filter((student) => student.id !== modalData?.id),
            }
          : oldData
      );
      queryClient.setQueryData(["departments"], (oldData: ApiSuccessResponse<DepartmentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((department) =>
                department.id === modalData?.department_id
                  ? {
                      ...department,
                      students: department.students.filter((student) => student.id !== modalData?.id),
                    }
                  : department
              ),
            }
          : oldData
      );
      queryClient.setQueryData(["classes"], (oldData: ApiSuccessResponse<ClassResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((classItem) =>
                classItem.id === modalData?.class_id
                  ? {
                      ...classItem,
                      students: classItem.students.filter((student) => student.id !== modalData?.id),
                    }
                  : classItem
              ),
            }
          : oldData
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xoá sinh viên thất bại!");
    },
    onSettled: () => {
      modalClose();
    },
  });

  const handleSubmit = () => {
    deleteMutate({ id: modalData?.id });
  };

  return (
    <CrudModal title="Xoá sinh viên" btnText="Xoá" isPending={deleteIsPending} handleSubmit={handleSubmit}>
      <p>
        Bạn có đồng ý xoá sinh viên{" "}
        <span className="font-bold">
          {modalData?.first_name} {modalData?.last_name}
        </span>
        ?
      </p>
    </CrudModal>
  );
};

export default DeleteStudentModal;
