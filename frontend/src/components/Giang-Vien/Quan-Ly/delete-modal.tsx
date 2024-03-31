import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { InstructorDeleteByIdParams, InstructorReponse, instructorDeleteById } from "@/api/instructors";
import { DepartmentResponse } from "@/api/departments";
import CrudModal from "../../crud-modal";

const DeleteInstructorModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as InstructorReponse,
    }))
  );

  const { mutate: deleteMutate, isPending: deleteIsPending } = useMutation<
    ApiSuccessResponse,
    ApiErrorResponse,
    InstructorDeleteByIdParams
  >({
    mutationFn: async (params) => await instructorDeleteById(params),
    onSuccess: () => {
      toast.success(`Xoá giảng viên thành công !`);
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.filter((instructor) => instructor.id !== modalData?.id),
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
                      instructors: department.instructors.filter((instructor) => instructor.id !== modalData?.id),
                    }
                  : department
              ),
            }
          : oldData
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xoá giảng viên thất bại!");
    },
    onSettled: () => {
      modalClose();
    },
  });

  const handleSubmit = () => {
    deleteMutate({ id: modalData?.id });
  };

  return (
    <CrudModal title="Xoá giảng viên" btnText="Xoá" isPending={deleteIsPending} handleSubmit={handleSubmit}>
      <p>
        Bạn có đồng ý xoá giảng viên{" "}
        <span className="font-bold">
          {modalData?.first_name} {modalData?.last_name}
        </span>
        ?
      </p>
    </CrudModal>
  );
};

export default DeleteInstructorModal;
