import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { EditGradeFormValidate, EditGradeFormValidateSchema } from "./edit.validate";
import CrudModal from "../crud-modal";
import { DepartmentResponse } from "@/api/departments";
import { InstructorReponse } from "@/api/instructors";
import { SubjectResponse } from "@/api/subjects";
import { StudentResponse } from "@/api/students";
import { GradeResponse, GradeUpdateByIdParams, gradeUpdateById } from "@/api/grade";

export interface EditGradeModalData {
  department?: DepartmentResponse;
  subject?: SubjectResponse;
  instructor?: InstructorReponse;
  student?: StudentResponse;
  grade: GradeResponse;
}

const EditGradeModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as EditGradeModalData,
    }))
  );

  const editForm = useForm<EditGradeFormValidate>({
    resolver: zodResolver(EditGradeFormValidateSchema),
    values: {
      department_id: modalData.department?.id + "",
      subject_id: modalData.subject?.id + "",
      by_instructor_id: modalData.instructor?.id + "",
      student_id: modalData.student?.id + "",
      process_score: modalData.grade.process_score + "",
      midterm_score: modalData.grade.midterm_score + "",
      final_score: modalData.grade.final_score + "",
    },
  });

  const { mutate: editMutate, isPending: editIsPending } = useMutation<
    ApiSuccessResponse<GradeResponse>,
    ApiErrorResponse,
    GradeUpdateByIdParams
  >({
    mutationFn: async (params) => await gradeUpdateById(params),
    onSuccess: (res) => {
      toast.success("Cập nhật điểm thành công !");
      queryClient.setQueryData(["grades"], (oldData: ApiSuccessResponse<GradeResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((grade) => (grade.id === res.data.id ? res.data : grade)),
            }
          : oldData
      );
      queryClient.setQueryData(["subjects"], (oldData: ApiSuccessResponse<SubjectResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((subject) =>
                subject.id === res.data.subject_id
                  ? {
                      ...subject,
                      grades: subject.grades.map((grade) => (grade.id === res.data.id ? res.data : grade)),
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
                instructor.id === res.data.by_instructor_id
                  ? {
                      ...instructor,
                      grades: instructor.grades.map((grade) => (grade.id === res.data.id ? res.data : grade)),
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
                student.id === res.data.student_id
                  ? {
                      ...student,
                      grades: student.grades.map((grade) => (grade.id === res.data.id ? res.data : grade)),
                    }
                  : student
              ),
            }
          : oldData
      );
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật lớp học thất bại!");
    },
  });

  const handleSubmit = () => {
    editForm.handleSubmit((data: EditGradeFormValidate) => {
      const process_score = parseFloat(data.process_score);
      const midterm_score = parseFloat(data.midterm_score);
      const final_score = parseFloat(data.final_score);

      if (isNaN(process_score)) {
        editForm.setError("process_score", {
          type: "manual",
          message: "Điểm quá trình phải là số",
        });
        return;
      }

      if (isNaN(midterm_score)) {
        editForm.setError("midterm_score", {
          type: "manual",
          message: "Điểm giữa kỳ phải là số",
        });
        return;
      }

      if (isNaN(final_score)) {
        editForm.setError("final_score", {
          type: "manual",
          message: "Điểm cuối kỳ phải là số",
        });
        return;
      }

      if (process_score < 0 || process_score > 10) {
        editForm.setError("process_score", {
          type: "manual",
          message: "Điểm quá trình phải nằm trong khoảng từ 0 đến 10",
        });
        return;
      }

      if (midterm_score < 0 || midterm_score > 10) {
        editForm.setError("midterm_score", {
          type: "manual",
          message: "Điểm giữa kỳ phải nằm trong khoảng từ 0 đến 10",
        });
        return;
      }

      if (final_score < 0 || final_score > 10) {
        editForm.setError("final_score", {
          type: "manual",
          message: "Điểm cuối kỳ phải nằm trong khoảng từ 0 đến 10",
        });
        return;
      }
      editMutate({
        id: modalData.grade.id,
        process_score,
        midterm_score,
        final_score,
      });
    })();
  };

  return (
    <CrudModal title="Sửa điểm" btnText="Cập nhật" isPending={editIsPending} handleSubmit={handleSubmit}>
      <Form {...editForm}>
        <form method="post" className="space-y-3">
          <FormField
            control={editForm.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Autocomplete
                    aria-label="Chọn khoa"
                    placeholder={modalData.department?.name}
                    label="Chọn khoa"
                    radius="lg"
                    variant="bordered"
                    color="secondary"
                    isInvalid={!!editForm.formState.errors.department_id}
                    errorMessage={editForm.formState.errors.department_id?.message}
                    selectedKey={field.value}
                    isRequired
                    isDisabled
                    allowsCustomValue
                    {...field}>
                    <AutocompleteItem key={field.value} textValue={modalData.department?.name} className="capitalize">
                      {modalData.department?.name}
                    </AutocompleteItem>
                  </Autocomplete>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="subject_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Autocomplete
                    aria-label="Chọn môn học chấm điểm"
                    placeholder={modalData.subject?.name}
                    label="Chọn môn học chấm điểm"
                    radius="lg"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.subject_id?.message}
                    isInvalid={!!editForm.formState.errors.subject_id}
                    selectedKey={field.value}
                    isRequired
                    isDisabled
                    allowsCustomValue
                    {...field}>
                    <AutocompleteItem key={field.value} textValue={modalData.subject?.name} className="capitalize">
                      {modalData.subject?.name}
                    </AutocompleteItem>
                  </Autocomplete>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid grid-flow-col gap-1">
            <FormField
              control={editForm.control}
              name="by_instructor_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      aria-label="Chọn giảng viên dạy"
                      placeholder={modalData.instructor?.first_name + " " + modalData.instructor?.last_name}
                      label="Chọn giảng viên dạy"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.by_instructor_id?.message}
                      isInvalid={!!editForm.formState.errors.by_instructor_id}
                      isRequired
                      isDisabled
                      allowsCustomValue
                      {...field}>
                      <AutocompleteItem
                        key={field.value}
                        textValue={modalData.instructor?.first_name + " " + modalData.instructor?.last_name}
                        className="capitalize">
                        {modalData.instructor?.first_name + " " + modalData.instructor?.last_name}
                      </AutocompleteItem>
                    </Autocomplete>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      aria-label="Chọn sinh viên học"
                      placeholder={modalData.student?.first_name + " " + modalData.student?.last_name}
                      label="Chọn sinh viên học"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.student_id?.message}
                      isInvalid={!!editForm.formState.errors.student_id}
                      selectedKey={field.value}
                      isRequired
                      isDisabled
                      allowsCustomValue
                      {...field}>
                      <AutocompleteItem
                        key={field.value}
                        textValue={modalData.student?.first_name + " " + modalData.student?.last_name}
                        className="capitalize">
                        {modalData.student?.first_name + " " + modalData.student?.last_name}
                      </AutocompleteItem>
                    </Autocomplete>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-flow-col gap-1">
            <FormField
              control={editForm.control}
              name="process_score"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      autoFocus
                      label="Điểm quá trình"
                      placeholder="Nhập điểm quá trình"
                      isInvalid={!!editForm.formState.errors.process_score}
                      isRequired
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.process_score?.message}
                      onClear={() => editForm.setValue("process_score", "")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="midterm_score"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      autoFocus
                      label="Điểm giữa kỳ"
                      placeholder="Nhập điểm giữa kỳ"
                      isInvalid={!!editForm.formState.errors.midterm_score}
                      isRequired
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.midterm_score?.message}
                      onClear={() => editForm.setValue("midterm_score", "")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={editForm.control}
            name="final_score"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Điểm cuối kỳ"
                    placeholder="Nhập điểm cuối kỳ"
                    isInvalid={!!editForm.formState.errors.final_score}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.final_score?.message}
                    onClear={() => editForm.setValue("final_score", "")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CrudModal>
  );
};

export default EditGradeModal;
