import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useMutation, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddInstructorFormValidate, AddInstructorFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import CrudModal from "../../crud-modal";
import { AssignmentCreateParams, AssignmentResponse, assignmentCreate, assignmentGetAll } from "@/api/assignment";
import { useEffect } from "react";
import { InstructorReponse } from "@/api/instructors";
import { SubjectResponse } from "@/api/subjects";

const AddInstructorAssignmentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddInstructorFormValidate>({
    resolver: zodResolver(AddInstructorFormValidateSchema),
    defaultValues: {
      department_id: "",
      instructor_id: "",
      subject_id: "",
    },
  });

  const departmentId = addForm.watch("department_id");
  const instructorId = addForm.watch("instructor_id");

  useEffect(() => {
    addForm.setValue("instructor_id", "");
  }, [addForm, departmentId]);

  useEffect(() => {
    addForm.setValue("subject_id", "");
  }, [addForm, instructorId]);

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<AssignmentResponse>,
    ApiErrorResponse,
    AssignmentCreateParams
  >({
    mutationFn: async (params) => await assignmentCreate(params),
    onSuccess: (res) => {
      toast.success("Phân công môn học mới thành công !");
      queryClient.setQueryData(["assignments"], (oldData: ApiSuccessResponse<AssignmentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: [...oldData.data, res.data],
            }
          : oldData
      );
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((department) =>
                department.id === res.data.instructor_id
                  ? {
                      ...department,
                      assignments: [...department.assignments, res.data],
                    }
                  : department
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
                      instructor_assignments: [...subject.instructor_assignments, res.data],
                    }
                  : subject
              ),
            }
          : oldData
      );
      modalClose();
      addForm.reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Phân công môn học thất bại!");
    },
  });

  const [departmentsQuery, assignmentsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["departments"],
        queryFn: async () => await departmentGetAll(),
        select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data,
      },
      {
        queryKey: ["assignments"],
        queryFn: async () => await assignmentGetAll(),
        select: (res: ApiSuccessResponse<AssignmentResponse[]>) => res?.data,
      },
    ],
  });

  const handleSubmit = () => {
    addForm.handleSubmit((data: AddInstructorFormValidate) => {
      addMutate({
        instructor_id: data.instructor_id,
        subject_id: data.subject_id,
      });
    })();
  };

  return (
    <CrudModal title="Phân công môn học" btnText="Phân công" isPending={addIsPending} handleSubmit={handleSubmit}>
      <Form {...addForm}>
        <form method="post" className="space-y-4">
          <FormField
            control={addForm.control}
            name="department_id"
            render={({ field }) => {
              const isDisabled = departmentsQuery.isLoading || !departmentsQuery.data.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={departmentsQuery.data ?? []}
                      aria-label="Chọn khoa"
                      placeholder={isDisabled ? "Không có khoa nào" : "Nhập tên khoa"}
                      label="Chọn khoa phân công"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.department_id?.message}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isInvalid={!!addForm.formState.errors.department_id}
                      isRequired
                      isLoading={departmentsQuery.isLoading}
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {(department) => {
                        const numberOfSubjects = department.subjects?.length;
                        return (
                          <AutocompleteItem key={department.id} textValue={department.name} className="capitalize">
                            <div className="flex justify-between items-center">
                              <span>{department.name}</span>
                              <div className="grid grid-flow-row">
                                <span className="text-sm text-gray-400">{numberOfSubjects} môn học</span>
                              </div>
                            </div>
                          </AutocompleteItem>
                        );
                      }}
                    </Autocomplete>
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            control={addForm.control}
            name="instructor_id"
            render={({ field }) => {
              const intructors =
                departmentsQuery.data.find((department) => department.id === parseInt(departmentId))?.instructors ?? [];
              const isDisabled = !departmentId || !intructors.length || assignmentsQuery.isLoading;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      aria-label="Chọn giảng viên phân công"
                      placeholder={isDisabled ? "Không có giảng viên nào" : "Nhập tên giảng viên"}
                      label="Chọn giảng viên phân công"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.instructor_id?.message}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isRequired
                      isDisabled={isDisabled}
                      isLoading={assignmentsQuery.isLoading}
                      isInvalid={!!addForm.formState.errors.instructor_id}
                      allowsCustomValue
                      {...field}>
                      {intructors &&
                        intructors.map((instructor) => {
                          const numberSubjectsOfInstructor = assignmentsQuery.data.filter(
                            (assignment) => assignment.instructor_id === instructor.id
                          ).length;
                          const totalSubjects = departmentsQuery.data.find(
                            (department) => department.id === parseInt(departmentId)
                          )?.subjects.length;
                          return (
                            <AutocompleteItem
                              key={instructor.id}
                              textValue={instructor.first_name + " " + instructor.last_name}>
                              <div className="flex justify-between items-center">
                                <span> {instructor.first_name + " " + instructor.last_name}</span>
                                <div className="grid grid-flow-row">
                                  <span className="text-xs text-gray-400">
                                    {numberSubjectsOfInstructor}/{totalSubjects} môn học được phân công
                                  </span>
                                </div>
                              </div>
                            </AutocompleteItem>
                          );
                        })}
                    </Autocomplete>
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            control={addForm.control}
            name="subject_id"
            render={({ field }) => {
              const subjects =
                departmentsQuery.data.find((department) => department.id === parseInt(departmentId))?.subjects ?? [];
              const isDisabled = !instructorId || !subjects.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={subjects}
                      aria-label="Chọn môn học phân công"
                      placeholder={isDisabled ? "Không có môn học nào" : "Nhập tên môn học"}
                      label="Chọn môn học phân công"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.subject_id?.message}
                      isInvalid={!!addForm.formState.errors.subject_id}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[
                        field.value,
                        ...(assignmentsQuery.data.map((assignment) => {
                          if (assignment.instructor_id === instructorId) return assignment.subject_id;
                          return "";
                        }) ?? []),
                      ]}
                      isRequired
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {(item) => (
                        <AutocompleteItem key={item.id} textValue={item.name} className="capitalize">
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

export default AddInstructorAssignmentModal;
