import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import CrudModal from "../crud-modal";
import { SubjectDeleteByIdParams, SubjectResponse, subjectDeleteById } from "@/api/subjects";
import { DepartmentResponse } from "@/api/departments";

const DeleteSubjectModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as SubjectResponse,
    }))
  );

  const { mutate: deleteMutate, isPending: deleteIsPending } = useMutation<
    ApiSuccessResponse,
    ApiErrorResponse,
    SubjectDeleteByIdParams
  >({
    mutationFn: async (params) => await subjectDeleteById(params),
    onSuccess: () => {
      toast.success(`Xoá môn học thành công!`);
      queryClient.setQueryData(["subjects"], (oldData: ApiSuccessResponse<SubjectResponse[]>) =>
        oldData ? { ...oldData, data: oldData.data.filter((item) => item.id !== modalData?.id) } : oldData
      );
      queryClient.setQueryData(["departments"], (oldData: ApiSuccessResponse<DepartmentResponse[]>) =>
      oldData
        ? {
            ...oldData,
            data: oldData.data.map((department) =>
              department.id === modalData?.department_id
                ? {
                    ...department,
                    subjects: department.subjects.filter((subject) => subject.id !== modalData?.id),
                  }
                : department
            ),
          }
        : oldData
    );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xoá môn học thất bại!");
    },
    onSettled: () => {
      modalClose();
    },
  });

  const handleSubmit = () => {
    deleteMutate({ id: modalData?.id });
  };

  return (
    <CrudModal title="Xoá môn học" btnText="Xoá" isPending={deleteIsPending} handleSubmit={handleSubmit}>
      <p>
        Bạn có đồng ý xoá môn học <span className="font-bold">{modalData?.name}</span> ?
      </p>
    </CrudModal>
  );
};

export default DeleteSubjectModal;
