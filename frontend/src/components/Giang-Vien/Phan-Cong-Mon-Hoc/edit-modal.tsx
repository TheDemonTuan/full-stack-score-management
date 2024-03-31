import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { EditInstructorAssignmentFormValidate, EditInstructorAssignmentFormValidateSchema } from "./edit.validate";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import CrudModal from "../../crud-modal";
import {
  AssignmentResponse,
  AssignmentUpdateByIdParams,
  assignmentGetAll,
  assignmentUpdateById,
} from "@/api/assignment";
import { SubjectResponse } from "@/api/subjects";
import { InstructorReponse } from "@/api/instructors";

interface EditInstructorAssignmentModalData {
  department: DepartmentResponse;
  instructor: InstructorReponse;
  subject: SubjectResponse;
  assignment: AssignmentResponse;
}

const EditInstructorAssignmentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as EditInstructorAssignmentModalData,
    }))
  );

  const editForm = useForm<EditInstructorAssignmentFormValidate>({
    resolver: zodResolver(EditInstructorAssignmentFormValidateSchema),
    values: {
      department_id: modalData?.department?.id + "",
      instructor_id: modalData?.assignment.instructor_id + "",
      subject_id: modalData?.assignment.subject_id + "",
    },
  });

  const { mutate: editMutate, isPending: editIsPending } = useMutation<
    ApiSuccessResponse<AssignmentResponse>,
    ApiErrorResponse,
    AssignmentUpdateByIdParams
  >({
    mutationFn: async (params) => await assignmentUpdateById(params),
    onSuccess: (res) => {
      toast.success("Cập nhật phân công thành công !");
      queryClient.setQueryData(["assignments"], (oldData: ApiSuccessResponse<AssignmentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((assignment) => (assignment.id === res.data.id ? res.data : assignment)),
            }
          : oldData
      );
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((instructor) =>
                instructor.id === res.data.instructor_id
                  ? {
                      ...instructor,
                      assignments: instructor.assignments.map((assignment) =>
                        assignment.id === res.data.id ? res.data : assignment
                      ),
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
                subject.id === res.data.subject_id
                  ? {
                      ...subject,
                      instructor_assignments: subject.instructor_assignments.map((assignment) =>
                        assignment.id === res.data.id ? res.data : assignment
                      ),
                    }
                  : subject
              ),
            }
          : oldData
      );
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật phân công thất bại!");
    },
  });

  const { data: assignmentsData, isLoading: assignmentsIsLoading } = useQuery<
    ApiSuccessResponse<AssignmentResponse[]>,
    ApiErrorResponse,
    AssignmentResponse[]
  >({
    queryKey: ["assignments"],
    queryFn: async () => await assignmentGetAll(),
    select: (res) => res?.data,
  });

  const handleSubmit = () => {
    editForm.handleSubmit((data: EditInstructorAssignmentFormValidate) => {
      console.log(data);

      editMutate({
        id: modalData?.assignment.id,
        instructor_id: data.instructor_id,
        subject_id: data.subject_id,
      });
    })();
  };

  return (
    <CrudModal title="Chỉnh sửa phân công" btnText="Cập nhật" isPending={editIsPending} handleSubmit={handleSubmit}>
      <Form {...editForm}>
        <form method="post" className="space-y-4">
          <FormField
            control={editForm.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Autocomplete
                    aria-label={modalData.department.name}
                    placeholder={modalData.department.name}
                    label="Chọn khoa phân công"
                    radius="lg"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.department_id?.message}
                    isInvalid={!!editForm.formState.errors.department_id}
                    isDisabled
                    isRequired
                    selectedKey={field.value}
                    defaultSelectedKey={field.value}
                    isClearable={false}
                    {...field}>
                    <AutocompleteItem key={modalData.department.id} textValue={modalData.department.name}>
                      {modalData.department.name}
                    </AutocompleteItem>
                  </Autocomplete>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="instructor_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Autocomplete
                    aria-label={modalData.instructor.first_name + " " + modalData.instructor.last_name}
                    placeholder={modalData.instructor.first_name + " " + modalData.instructor.last_name}
                    label="Chọn giảng viên phân công"
                    radius="lg"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.instructor_id?.message}
                    isInvalid={!!editForm.formState.errors.instructor_id}
                    isDisabled
                    isRequired
                    selectedKey={field.value}
                    defaultSelectedKey={field.value}
                    isClearable={false}
                    {...field}>
                    <AutocompleteItem
                      key={modalData.instructor.id}
                      textValue={modalData.instructor.first_name + " " + modalData.instructor.last_name}>
                      {modalData.instructor.first_name + " " + modalData.instructor.last_name}
                    </AutocompleteItem>
                  </Autocomplete>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="subject_id"
            render={({ field }) => {
              const subjects = modalData?.department.subjects ?? [];
              const isDisabled = assignmentsIsLoading || !modalData?.department.subjects.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={subjects}
                      aria-label={modalData.subject.name}
                      placeholder={modalData.subject.name}
                      label="Chọn môn học phân công"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.subject_id?.message}
                      isLoading={assignmentsIsLoading}
                      isDisabled={isDisabled}
                      disabledKeys={[
                        field.value,
                        ...(assignmentsData?.map((assignment) => {
                          if (assignment.instructor_id === modalData.instructor.id) return assignment.subject_id;
                          return "";
                        }) ?? []),
                      ]}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      isInvalid={!!editForm.formState.errors.subject_id}
                      isRequired
                      defaultSelectedKey={field.value}
                      isClearable={false}
                      allowsCustomValue
                      {...field}>
                      {(item) => (
                        <AutocompleteItem key={item.id} textValue={item.name}>
                          {item.name}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  </FormControl>
                </FormItem>
              );
            }}
          />
        </form>
      </Form>
    </CrudModal>
  );
};

export default EditInstructorAssignmentModal;
