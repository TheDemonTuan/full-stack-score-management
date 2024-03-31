import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import CrudModal from "../../crud-modal";
import { SubjectResponse } from "@/api/subjects";
import { RegistrationDeleteByIdParams, RegistrationResponse, registrationDeleteById } from "@/api/registration";
import { StudentResponse } from "@/api/students";

const DeleteStudentRegistrationModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as RegistrationResponse,
    }))
  );

  const { mutate: deleteMutate, isPending: deleteIsPending } = useMutation<
    ApiSuccessResponse,
    ApiErrorResponse,
    RegistrationDeleteByIdParams
  >({
    mutationFn: async (params) => await registrationDeleteById(params),
    onSuccess: () => {
      toast.success(`Xoá đăng ký thành công !`);
      queryClient.setQueryData(["registrations"], (oldData: ApiSuccessResponse<RegistrationResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.filter((registration) => registration.id !== modalData?.id),
            }
          : oldData
      );
      queryClient.setQueryData(["students"], (oldData: ApiSuccessResponse<StudentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((student) =>
                student.id === modalData?.student_id
                  ? {
                      ...student,
                      registrations: student.registrations.filter((registration) => registration.id !== modalData?.id),
                    }
                  : student
              ),
            }
          : oldData
      );
      queryClient.setQueryData(["subjects"], (oldData: ApiSuccessResponse<SubjectResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((subject) =>
                subject.id === modalData?.subject_id
                  ? {
                      ...subject,
                      student_registrations: subject.student_registrations.filter(
                        (registration) => registration.id !== modalData?.id
                      ),
                    }
                  : subject
              ),
            }
          : oldData
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xoá đăng ký thất bại!");
    },
    onSettled: () => {
      modalClose();
    },
  });

  const handleSubmit = () => {
    deleteMutate({ id: modalData?.id });
  };

  return (
    <CrudModal title="Xoá đăng ký" btnText="Xoá" isPending={deleteIsPending} handleSubmit={handleSubmit}>
      <p>Bạn có đồng ý xoá đăng ký này ?</p>
    </CrudModal>
  );
};

export default DeleteStudentRegistrationModal;
