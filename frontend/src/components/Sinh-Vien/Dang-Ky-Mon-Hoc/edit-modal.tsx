import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { EditStudentRegistrationFormValidate, EditStudentRegistrationFormValidateSchema } from "./edit.validate";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import CrudModal from "../../crud-modal";
import { SubjectResponse } from "@/api/subjects";
import { StudentResponse } from "@/api/students";
import {
  RegistrationResponse,
  RegistrationUpdateByIdParams,
  registrationGetAll,
  registrationUpdateById,
} from "@/api/registration";

interface EditStudentRegistrationModalData {
  department: DepartmentResponse;
  student: StudentResponse;
  subject: SubjectResponse;
  registration: RegistrationResponse;
}

const EditStudentRegistrationModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as EditStudentRegistrationModalData,
    }))
  );

  const editForm = useForm<EditStudentRegistrationFormValidate>({
    resolver: zodResolver(EditStudentRegistrationFormValidateSchema),
    values: {
      department_id: modalData?.department?.id + "",
      student_id: modalData?.registration.student_id + "",
      subject_id: modalData?.registration.subject_id + "",
    },
  });

  const { mutate: editMutate, isPending: editIsPending } = useMutation<
    ApiSuccessResponse<RegistrationResponse>,
    ApiErrorResponse,
    RegistrationUpdateByIdParams
  >({
    mutationFn: async (params) => await registrationUpdateById(params),
    onSuccess: (res) => {
      toast.success("Cập nhật đăng ký thành công !");
      queryClient.setQueryData(["registrations"], (oldData: ApiSuccessResponse<RegistrationResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((registration) => (registration.id === res.data.id ? res.data : registration)),
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
                      registrations: student.registrations.map((registration) =>
                        registration.id === res.data.id ? res.data : registration
                      ),
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
                subject.id === res.data.subject_id
                  ? {
                      ...subject,
                      student_registrations: subject.student_registrations.map((registration) =>
                        registration.id === res.data.id ? res.data : registration
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
      toast.error(error?.response?.data?.message || "Cập nhật đăng ký thất bại!");
    },
  });

  const { data: registrationsData, isLoading: registrationsIsLoading } = useQuery<
    ApiSuccessResponse<RegistrationResponse[]>,
    ApiErrorResponse,
    RegistrationResponse[]
  >({
    queryKey: ["registrations"],
    queryFn: async () => await registrationGetAll(),
    select: (res) => res?.data,
  });

  const handleSubmit = () => {
    editForm.handleSubmit((data: EditStudentRegistrationFormValidate) => {
      console.log(data);

      editMutate({
        id: modalData?.registration.id,
        student_id: data.student_id,
        subject_id: data.subject_id,
      });
    })();
  };

  return (
    <CrudModal title="Chỉnh sửa đăng ký" btnText="Cập nhật" isPending={editIsPending} handleSubmit={handleSubmit}>
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
                    label="Chọn khoa đăng ký"
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
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Autocomplete
                    aria-label={modalData.student.first_name + " " + modalData.student.last_name}
                    placeholder={modalData.student.first_name + " " + modalData.student.last_name}
                    label="Chọn giảng viên đăng ký"
                    radius="lg"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.student_id?.message}
                    isInvalid={!!editForm.formState.errors.student_id}
                    isDisabled
                    isRequired
                    selectedKey={field.value}
                    defaultSelectedKey={field.value}
                    isClearable={false}
                    {...field}>
                    <AutocompleteItem
                      key={modalData.student.id}
                      textValue={modalData.student.first_name + " " + modalData.student.last_name}>
                      {modalData.student.first_name + " " + modalData.student.last_name}
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
              const isDisabled = registrationsIsLoading || !modalData?.department.subjects.length;
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
                      isLoading={registrationsIsLoading}
                      isDisabled={isDisabled}
                      disabledKeys={[
                        field.value,
                        ...(registrationsData?.map((registration) => {
                          if (registration.student_id === modalData.student.id) return registration.subject_id;
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

export default EditStudentRegistrationModal;
