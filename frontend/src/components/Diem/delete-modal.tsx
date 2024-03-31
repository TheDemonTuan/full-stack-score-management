import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import CrudModal from "../crud-modal";
import { toast } from "react-toastify";
import { GradeDeleteByIdParams, GradeResponse, gradeDeleteById } from "@/api/grade";
import { StudentResponse } from "@/api/students";
import { SubjectResponse } from "@/api/subjects";
import { InstructorReponse } from "@/api/instructors";

const DeleteGradeModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as GradeResponse,
    }))
  );

  const { mutate: deleteMutate, isPending: deleteIsPending } = useMutation<
    ApiSuccessResponse,
    ApiErrorResponse,
    GradeDeleteByIdParams
  >({
    mutationFn: async (params) => await gradeDeleteById(params),
    onSuccess: () => {
      toast.success(`Xoá điểm thành công!`);
      queryClient.setQueryData(["grades"], (oldData: ApiSuccessResponse<GradeResponse[]>) =>
        oldData ? { ...oldData, data: oldData.data.filter((grade) => grade.id !== modalData?.id) } : oldData
      );
      queryClient.setQueryData(["subjects"], (oldData: ApiSuccessResponse<SubjectResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((subject) =>
                subject.id === modalData?.subject_id
                  ? {
                      ...subject,
                      grades: subject.grades.filter((grade) => grade.id !== modalData?.id),
                    }
                  : subject
              ),
            }
          : oldData
      );
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((instructor) =>
                instructor.id === modalData?.by_instructor_id
                  ? {
                      ...instructor,
                      grades: instructor.grades.filter((grade) => grade.id !== modalData?.id),
                    }
                  : instructor
              ),
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
                      grades: student.grades.filter((grade) => grade.id !== modalData?.id),
                    }
                  : student
              ),
            }
          : oldData
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xoá điểm thất bại!");
    },
    onSettled: () => {
      modalClose();
    },
  });

  const handleSubmit = () => {
    deleteMutate({ id: modalData?.id });
  };

  return (
    <CrudModal title="Xoá điểm" btnText="Xoá" isPending={deleteIsPending} handleSubmit={handleSubmit}>
      <p>Bạn có đồng ý xoá điểm này?</p>
    </CrudModal>
  );
};

export default DeleteGradeModal;
