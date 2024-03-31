import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { useMutation, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddClassFormValidate, AddClassFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import CrudModal from "../crud-modal";
import { GradeCreateParams, GradeResponse, gradeCreate, gradeGetAll } from "@/api/grade";
import { useEffect } from "react";
import { isNaN } from "lodash";
import { AssignmentResponse, assignmentGetAll } from "@/api/assignment";
import { RegistrationResponse, registrationGetAll } from "@/api/registration";
import { SubjectResponse } from "@/api/subjects";
import { StudentResponse } from "@/api/students";
import { InstructorReponse } from "@/api/instructors";

const AddGradeModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddClassFormValidate>({
    resolver: zodResolver(AddClassFormValidateSchema),
    defaultValues: {
      department_id: "",
      subject_id: "",
      by_instructor_id: "",
      student_id: "",
      process_score: "",
      midterm_score: "",
      final_score: "",
    },
  });

  const departmentId = addForm.watch("department_id");
  const subjectId = addForm.watch("subject_id");
  const instructorId = addForm.watch("by_instructor_id");
  const studentId = addForm.watch("student_id");

  useEffect(() => {
    addForm.setValue("subject_id", "");
  }, [addForm, departmentId]);

  useEffect(() => {
    addForm.setValue("by_instructor_id", "");
    addForm.setValue("student_id", "");
  }, [addForm, subjectId]);

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<GradeResponse>,
    ApiErrorResponse,
    GradeCreateParams
  >({
    mutationFn: async (params) => await gradeCreate(params),
    onSuccess: (res) => {
      toast.success("Thêm điểm mới thành công !");
      queryClient.setQueryData(["grades"], (oldData: ApiSuccessResponse<GradeResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: [res.data, ...oldData.data],
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
                      grades: [...subject.grades, res.data],
                    }
                  : subject
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
                      grades: [...student.grades, res.data],
                    }
                  : student
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
                      grades: [...instructor.grades, res.data],
                    }
                  : instructor
              ),
            }
          : oldData
      );
      addForm.reset();
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thêm điểm thất bại!");
    },
  });

  const [departmentQuery, assignmentQuery, registrationQuery, gradeQuery] = useSuspenseQueries({
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
      {
        queryKey: ["registrations"],
        queryFn: async () => await registrationGetAll(),
        select: (res: ApiSuccessResponse<RegistrationResponse[]>) => res?.data,
      },
      {
        queryKey: ["grades"],
        queryFn: async () => await gradeGetAll(),
        select: (res: ApiSuccessResponse<GradeResponse[]>) => res?.data,
      },
    ],
  });

  const addGradeIsLoading =
    departmentQuery.isLoading || assignmentQuery.isLoading || registrationQuery.isLoading || gradeQuery.isLoading;

  const handleSubmit = () => {
    addForm.handleSubmit((data: AddClassFormValidate) => {
      const process_score = parseFloat(data.process_score);
      const midterm_score = parseFloat(data.midterm_score);
      const final_score = parseFloat(data.final_score);

      if (isNaN(process_score)) {
        addForm.setError("process_score", {
          type: "manual",
          message: "Điểm quá trình phải là số",
        });
        return;
      }

      if (isNaN(midterm_score)) {
        addForm.setError("midterm_score", {
          type: "manual",
          message: "Điểm giữa kỳ phải là số",
        });
        return;
      }

      if (isNaN(final_score)) {
        addForm.setError("final_score", {
          type: "manual",
          message: "Điểm cuối kỳ phải là số",
        });
        return;
      }

      if (process_score < 0 || process_score > 10) {
        addForm.setError("process_score", {
          type: "manual",
          message: "Điểm quá trình phải nằm trong khoảng từ 0 đến 10",
        });
        return;
      }

      if (midterm_score < 0 || midterm_score > 10) {
        addForm.setError("midterm_score", {
          type: "manual",
          message: "Điểm giữa kỳ phải nằm trong khoảng từ 0 đến 10",
        });
        return;
      }

      if (final_score < 0 || final_score > 10) {
        addForm.setError("final_score", {
          type: "manual",
          message: "Điểm cuối kỳ phải nằm trong khoảng từ 0 đến 10",
        });
        return;
      }

      addMutate({
        subject_id: data.subject_id,
        by_instructor_id: data.by_instructor_id,
        student_id: data.student_id,
        process_score: process_score,
        midterm_score: midterm_score,
        final_score: final_score,
      });
    })();
  };

  return (
    <CrudModal title="Thêm điểm" btnText="Thêm" isPending={addIsPending} handleSubmit={handleSubmit}>
      <Form {...addForm}>
        <form method="post" className="space-y-3">
          <FormField
            control={addForm.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Autocomplete
                    defaultItems={departmentQuery.data ?? []}
                    aria-label="Chọn khoa"
                    placeholder="Nhập tên khoa"
                    label="Chọn khoa"
                    radius="lg"
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.department_id?.message}
                    selectedKey={field.value}
                    onSelectionChange={field.onChange}
                    disabledKeys={[field.value]}
                    isInvalid={!!addForm.formState.errors.department_id}
                    isRequired
                    isLoading={addGradeIsLoading}
                    isDisabled={addGradeIsLoading}
                    allowsCustomValue
                    {...field}>
                    {(department) => {
                      const numberOfSubjects = department.subjects.length;
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
            )}
          />
          <FormField
            control={addForm.control}
            name="subject_id"
            render={({ field }) => {
              const subjects =
                departmentQuery.data.find((department) => department.id === parseInt(departmentId))?.subjects ?? [];
              const isDisabled = !departmentId || subjects?.length === 0;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={subjects}
                      aria-label="Chọn môn học chấm điểm"
                      placeholder={isDisabled ? "Không có môn học" : "Nhập tên môn học"}
                      label="Chọn môn học chấm điểm"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.subject_id?.message}
                      isInvalid={!!addForm.formState.errors.subject_id}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isRequired
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {(subject) => {
                        const numberOfInstructors = assignmentQuery.data.filter(
                          (assignment) => assignment.subject_id === subject.id
                        ).length;
                        const numberOfStudents = registrationQuery.data.filter(
                          (registration) => registration.subject_id === subject.id
                        ).length;
                        return (
                          <AutocompleteItem key={subject.id} textValue={subject.name} className="capitalize">
                            <div className="flex justify-between items-center">
                              <span>{subject.name}</span>
                              <div className="grid grid-flow-row">
                                <span className="text-sm text-gray-400">{numberOfInstructors} giảng viên</span>
                                <span className="text-sm text-gray-400">{numberOfStudents} sinh viên</span>
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
            name="by_instructor_id"
            render={({ field }) => {
              const instructors =
                departmentQuery.data
                  .find((department) => department.id === parseInt(departmentId))
                  ?.instructors.filter((instructor) =>
                    assignmentQuery.data.find(
                      (assignment) => assignment.subject_id === subjectId && assignment.instructor_id === instructor.id
                    )
                  ) ?? [];
              const isDisabled = !subjectId || instructors?.length === 0;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={instructors}
                      aria-label="Chọn giảng viên dạy"
                      placeholder={isDisabled ? "Không có giảng viên" : "Nhập tên giảng viên"}
                      label="Chọn giảng viên dạy"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.by_instructor_id?.message}
                      isInvalid={!!addForm.formState.errors.by_instructor_id}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isRequired
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {(instructor) => (
                        <AutocompleteItem
                          key={instructor.id}
                          textValue={`${instructor.first_name} ${instructor.last_name}`}
                          className="capitalize">
                          {`${instructor.first_name} ${instructor.last_name}`}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <FormField
            control={addForm.control}
            name="student_id"
            render={({ field }) => {
              const students =
                departmentQuery.data
                  .find((department) => department.id === parseInt(departmentId))
                  ?.students.filter((student) =>
                    registrationQuery.data.find(
                      (registration) => registration.subject_id === subjectId && registration.student_id === student.id
                    )
                  ) ?? [];

              const disableStudent = students
                .filter((student) =>
                  gradeQuery.data.find((grade) => grade.subject_id === subjectId && grade.student_id === student.id)
                )
                .map((student) => student.id);
              const isDisabled = !subjectId || students?.length === 0;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={students}
                      aria-label="Chọn sinh viên học"
                      placeholder={isDisabled ? "Không có sinh viên" : "Nhập tên sinh viên"}
                      label="Chọn sinh viên học"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.student_id?.message}
                      isInvalid={!!addForm.formState.errors.student_id}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value, ...disableStudent]}
                      isRequired
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {(student) => (
                        <AutocompleteItem
                          key={student.id}
                          textValue={`${student.first_name} ${student.last_name}`}
                          className="capitalize">
                          <div className="flex justify-between items-center">
                            <span> {`${student.first_name} ${student.last_name}`}</span>
                            {disableStudent.some((id) => id === student.id) && (
                              <div className="grid grid-flow-row">
                                <span className="text-sm text-gray-400">đã có điểm</span>
                              </div>
                            )}
                          </div>
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <div className="grid grid-flow-col gap-1">
            <FormField
              control={addForm.control}
              name="process_score"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      autoFocus
                      label="Điểm quá trình"
                      placeholder="Nhập điểm quá trình"
                      isInvalid={!!addForm.formState.errors.process_score}
                      isRequired
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.process_score?.message}
                      onClear={() => addForm.setValue("process_score", "")}
                      isDisabled={!studentId || !instructorId}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={addForm.control}
              name="midterm_score"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      autoFocus
                      label="Điểm giữa kỳ"
                      placeholder="Nhập điểm giữa kỳ"
                      isInvalid={!!addForm.formState.errors.midterm_score}
                      isRequired
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.midterm_score?.message}
                      onClear={() => addForm.setValue("midterm_score", "")}
                      isDisabled={!studentId || !instructorId}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={addForm.control}
            name="final_score"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Điểm cuối kỳ"
                    placeholder="Nhập điểm cuối kỳ"
                    isInvalid={!!addForm.formState.errors.final_score}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.final_score?.message}
                    onClear={() => addForm.setValue("final_score", "")}
                    isDisabled={!studentId || !instructorId}
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

export default AddGradeModal;
