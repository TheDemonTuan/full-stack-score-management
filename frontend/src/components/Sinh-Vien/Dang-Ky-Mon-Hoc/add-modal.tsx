import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useMutation, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddStudentRegistrationFormValidate, AddStudentRegistrationFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import CrudModal from "../../crud-modal";
import { useEffect } from "react";
import { SubjectResponse } from "@/api/subjects";
import { StudentResponse } from "@/api/students";
import {
  RegistrationCreateParams,
  RegistrationResponse,
  registrationCreate,
  registrationGetAll,
} from "@/api/registration";

const AddStudentRegistrationModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddStudentRegistrationFormValidate>({
    resolver: zodResolver(AddStudentRegistrationFormValidateSchema),
    defaultValues: {
      department_id: "",
      student_id: "",
      subject_id: "",
    },
  });

  const departmentId = addForm.watch("department_id");
  const studentId = addForm.watch("student_id");

  useEffect(() => {
    addForm.setValue("student_id", "");
  }, [addForm, departmentId]);

  useEffect(() => {
    addForm.setValue("subject_id", "");
  }, [addForm, studentId]);

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<RegistrationResponse>,
    ApiErrorResponse,
    RegistrationCreateParams
  >({
    mutationFn: async (params) => await registrationCreate(params),
    onSuccess: (res) => {
      toast.success("Đăng ký môn học mới thành công !");
      queryClient.setQueryData(["registrations"], (oldData: ApiSuccessResponse<RegistrationResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: [...oldData.data, res.data],
            }
          : oldData
      );
      queryClient.setQueryData(["students"], (oldData: ApiSuccessResponse<StudentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((department) =>
                department.id === res.data.student_id
                  ? {
                      ...department,
                      registrations: [...department.registrations, res.data],
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
                      student_registrations: [...subject.student_registrations, res.data],
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
      toast.error(error?.response?.data?.message || "Đăng ký môn học thất bại!");
    },
  });

  const [departmentsQuery, registrationsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["departments"],
        queryFn: async () => await departmentGetAll(),
        select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data,
      },
      {
        queryKey: ["registrations"],
        queryFn: async () => await registrationGetAll(),
        select: (res: ApiSuccessResponse<RegistrationResponse[]>) => res?.data,
      },
    ],
  });

  const handleSubmit = () => {
    addForm.handleSubmit((data: AddStudentRegistrationFormValidate) => {
      addMutate({
        student_id: data.student_id,
        subject_id: data.subject_id,
      });
    })();
  };

  return (
    <CrudModal title="Đăng ký môn học" btnText="Đăng ký" isPending={addIsPending} handleSubmit={handleSubmit}>
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
            name="student_id"
            render={({ field }) => {
              const students =
                departmentsQuery.data.find((department) => department.id === parseInt(departmentId))?.students ?? [];
              const isDisabled = !departmentId || !students.length || registrationsQuery.isLoading;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      aria-label="Chọn sinh viên đăng ký"
                      placeholder={isDisabled ? "Không có sinh viên nào" : "Nhập tên sinh viên"}
                      label="Chọn sinh viên đăng ký"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.student_id?.message}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isRequired
                      isDisabled={isDisabled}
                      isLoading={registrationsQuery.isLoading}
                      isInvalid={!!addForm.formState.errors.student_id}
                      allowsCustomValue
                      {...field}>
                      {students &&
                        students.map((student) => {
                          const numberSubjectsOfInstructor = registrationsQuery.data.filter(
                            (registration) => registration.student_id === student.id
                          ).length;
                          const totalSubjects = departmentsQuery.data.find(
                            (department) => department.id === parseInt(departmentId)
                          )?.subjects.length;
                          return (
                            <AutocompleteItem key={student.id} textValue={student.first_name + " " + student.last_name}>
                              <div className="flex justify-between items-center">
                                <span> {student.first_name + " " + student.last_name}</span>
                                <div className="grid grid-flow-row">
                                  <span className="text-xs text-gray-400">
                                    {numberSubjectsOfInstructor}/{totalSubjects} môn học đã đăng ký
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
              const isDisabled = !studentId || !subjects.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={subjects}
                      aria-label="Chọn môn học đăng ký"
                      placeholder={isDisabled ? "Không có môn học nào" : "Nhập tên môn học"}
                      label="Chọn môn học đăng ký"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.subject_id?.message}
                      isInvalid={!!addForm.formState.errors.subject_id}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[
                        field.value,
                        ...(registrationsQuery.data.map((registration) => {
                          if (registration.student_id === studentId) return registration.subject_id;
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

export default AddStudentRegistrationModal;
