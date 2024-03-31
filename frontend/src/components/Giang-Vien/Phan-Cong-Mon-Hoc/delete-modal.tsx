import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import CrudModal from "../../crud-modal";
import { AssignmentDeleteByIdParams, AssignmentResponse, assignmentDeleteById } from "@/api/assignment";
import { InstructorReponse } from "@/api/instructors";
import { SubjectResponse } from "@/api/subjects";

const DeleteInstructorAssignmentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as AssignmentResponse,
    }))
  );

  const { mutate: deleteMutate, isPending: deleteIsPending } = useMutation<
    ApiSuccessResponse,
    ApiErrorResponse,
    AssignmentDeleteByIdParams
  >({
    mutationFn: async (params) => await assignmentDeleteById(params),
    onSuccess: () => {
      toast.success(`Xoá phân công thành công !`);
      queryClient.setQueryData(["assignments"], (oldData: ApiSuccessResponse<AssignmentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.filter((assignment) => assignment.id !== modalData?.id),
            }
          : oldData
      );
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((instructor) =>
                instructor.id === modalData?.instructor_id
                  ? {
                      ...instructor,
                      assignments: instructor.assignments.filter((assignment) => assignment.id !== modalData?.id),
                    }
                  : instructor
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
                      instructor_assignments: subject.instructor_assignments.filter(
                        (assignment) => assignment.id !== modalData?.id
                      ),
                    }
                  : subject
              ),
            }
          : oldData
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xoá phân công thất bại!");
    },
    onSettled: () => {
      modalClose();
    },
  });

  const handleSubmit = () => {
    deleteMutate({ id: modalData?.id });
  };

  return (
    <CrudModal title="Xoá phân công" btnText="Xoá" isPending={deleteIsPending} handleSubmit={handleSubmit}>
      <p>Bạn có đồng ý xoá phân công này ?</p>
    </CrudModal>
  );
};

export default DeleteInstructorAssignmentModal;
