import { DepartmentDeleteByIdParams, DepartmentResponse, departmentDeleteById } from "@/api/departments";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import CrudModal from "../crud-modal";

const DeleteDepartmentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore();

  const { mutate: deleteMutate, isPending: deleteIsPending } = useMutation<
    ApiSuccessResponse,
    ApiErrorResponse,
    DepartmentDeleteByIdParams
  >({
    mutationFn: async (params) => await departmentDeleteById(params),
    onSuccess: () => {
      toast.success(`Xoá khoa thành công !`);
      queryClient.setQueryData(["departments"], (oldData: ApiSuccessResponse<DepartmentResponse[]>) =>
        oldData ? { ...oldData, data: oldData.data.filter((item) => item.id !== modalData?.id) } : oldData
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xoá khoa thất bại!");
    },
    onSettled: () => {
      modalClose();
    },
  });

  const handleSubmit = () => {
    deleteMutate({ id: modalData?.id });
  };

  return (
    <CrudModal title="Xoá khoá" btnText="Xoá" isPending={deleteIsPending} handleSubmit={handleSubmit}>
      <p>
        Bạn có đồng ý xoá khoa <span className="font-bold">{modalData?.name}</span> ?
      </p>
    </CrudModal>
  );
};

export default DeleteDepartmentModal;
