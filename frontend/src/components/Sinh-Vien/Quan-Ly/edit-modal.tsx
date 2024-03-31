import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import {
  Button,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { EditStudentFormValidate, EditStudentFormValidateSchema } from "./edit.validate";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { DepartmentResponse } from "@/api/departments";
import CrudModal from "../../crud-modal";
import { StudentResponse, StudentUpdateByIdParams, studentUpdateById } from "@/api/students";
import { ClassResponse } from "@/api/classes";

export interface EditStudentModalData {
  department?: DepartmentResponse;
  class?: ClassResponse;
  student: StudentResponse;
}

const EditStudentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as EditStudentModalData,
    }))
  );

  const editForm = useForm<EditStudentFormValidate>({
    resolver: zodResolver(EditStudentFormValidateSchema),
    values: {
      first_name: modalData.student.first_name,
      last_name: modalData.student.last_name,
      email: modalData.student.email,
      address: modalData.student.address,
      birth_day: modalData.student.birth_day,
      phone: modalData.student.phone,
      gender: modalData.student.gender ? "nu" : "nam",
      academic_year: modalData.student.academic_year + "",
      department_id: modalData.student.department_id + "",
      class_id: modalData.student.class_id + "",
    },
  });

  useEffect(() => {
    editForm.setValue("birth_day", new Date(modalData.student.birth_day));
  }, [editForm, modalData]);

  const { mutate: editMutate, isPending: editIsPending } = useMutation<
    ApiSuccessResponse<StudentResponse>,
    ApiErrorResponse,
    StudentUpdateByIdParams
  >({
    mutationFn: async (params) => await studentUpdateById(params),
    onSuccess: (res) => {
      toast.success("Cập nhật sinh viên thành công !");
      queryClient.setQueryData(["students"], (oldData: ApiSuccessResponse<StudentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((item) => (item.id === res.data.id ? res.data : item)),
            }
          : oldData
      );
      queryClient.setQueryData(["departments"], (oldData: ApiSuccessResponse<DepartmentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((department) =>
                department.id === res.data.department_id
                  ? {
                      ...department,
                      students: department.students.map((student) => (student.id === res.data.id ? res.data : student)),
                    }
                  : department
              ),
            }
          : oldData
      );
      queryClient.setQueryData(["classes"], (oldData: ApiSuccessResponse<ClassResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((classItem) =>
                classItem.id === res.data.class_id
                  ? {
                      ...classItem,
                      students: classItem.students.map((student) => (student.id === res.data.id ? res.data : student)),
                    }
                  : classItem
              ),
            }
          : oldData
      );
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật sinh viên thất bại!");
    },
  });

  const handleSubmit = () => {
    editForm.handleSubmit((data: EditStudentFormValidate) => {
      editMutate({
        id: modalData.student.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        address: data.address,
        birth_day: data.birth_day,
        phone: data.phone,
        gender: data.gender === "nu",
        class_id: data.class_id,
      });
    })();
  };

  return (
    <CrudModal title="Chỉnh sửa sinh viên" btnText="Cập nhật" isPending={editIsPending} handleSubmit={handleSubmit}>
      <Form {...editForm}>
        <form method="post" className="space-y-4">
          <div className="grid grid-flow-col gap-2">
            <FormField
              control={editForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      isInvalid={!!editForm.formState.errors.first_name}
                      isRequired
                      placeholder={modalData.student.first_name}
                      label="Họ"
                      variant="bordered"
                      color="secondary"
                      onClear={() => editForm.setValue("first_name", "")}
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      isInvalid={!!editForm.formState.errors.last_name}
                      isRequired
                      placeholder={modalData.student.last_name}
                      label="Tên"
                      variant="bordered"
                      color="secondary"
                      onClear={() => editForm.setValue("last_name", "")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={editForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!editForm.formState.errors.email}
                    isRequired
                    placeholder={modalData.student.email}
                    label="Email"
                    variant="bordered"
                    color="secondary"
                    onClear={() => editForm.setValue("email", "")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!editForm.formState.errors.address}
                    isRequired
                    placeholder={modalData.student.address}
                    label="Địa chỉ"
                    variant="bordered"
                    color="secondary"
                    onClear={() => editForm.setValue("address", "")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-flow-row lg:grid-flow-col items-center gap-2">
            <FormField
              control={editForm.control}
              name="birth_day"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Popover>
                      <PopoverTrigger>
                        <FormControl>
                          <Button
                            size="lg"
                            about="Chọn ngày sinh"
                            variant="bordered"
                            className={cn(
                              "pl-3 text-left text-sm",
                              !field.value && "text-muted-foreground",
                              !!editForm.formState.errors.birth_day && "border-danger text-danger"
                            )}>
                            {field.value ? (
                              <span>{new Date(field.value).toDateString()}</span>
                            ) : (
                              <span>Chọn ngày sinh</span>
                            )}
                            <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      isInvalid={!!editForm.formState.errors.gender}
                      isRequired
                      variant="bordered"
                      color="secondary"
                      radius="lg"
                      label="Giới tính"
                      size="sm"
                      defaultSelectedKeys={[modalData.student.gender ? "nu" : "nam"]}
                      {...field}>
                      <SelectItem key="nam" value="nam">
                        Nam
                      </SelectItem>
                      <SelectItem key="nu" value="nu">
                        Nữ
                      </SelectItem>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={editForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!editForm.formState.errors.phone}
                    isRequired
                    placeholder={modalData.student.phone}
                    label="Số điện thoại"
                    color="secondary"
                    variant="bordered"
                    onClear={() => editForm.setValue("phone", "")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="academic_year"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    isInvalid={!!editForm.formState.errors.academic_year}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    disabledKeys={[field.value]}
                    label="Chọn khoá học"
                    onChange={field.onChange}
                    isDisabled
                    selectedKeys={[field.value]}>
                    <SelectItem key={modalData.student.academic_year}>
                      {modalData.student.academic_year + ""}
                    </SelectItem>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    isInvalid={!!editForm.formState.errors.department_id}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    defaultSelectedKeys={[field.value]}
                    selectedKeys={[field.value]}
                    isDisabled
                    label="Khoa"
                    {...field}>
                    <SelectItem key={field.value} textValue={modalData.department?.name} className="capitalize">
                      {modalData.department?.name}
                    </SelectItem>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="class_id"
            render={({ field }) => {
              const classes =
                modalData.department?.classes.filter(
                  (classItem) => classItem.academic_year === modalData.student.academic_year
                ) ?? [];
              const isDisabled = !classes?.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      aria-label="Chọn lớp"
                      placeholder={modalData.class?.name}
                      label="Chọn lớp"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.class_id?.message}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isInvalid={!!editForm.formState.errors.class_id}
                      isRequired
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {classes &&
                        classes.map((classItem) => {
                          const numberOfStudents = modalData.department?.students.filter(
                            (student) => student.class_id === classItem.id
                          ).length;
                          const hostInstructor = modalData.department?.instructors.find(
                            (instructor) => instructor.id === classItem.host_instructor_id
                          );
                          return (
                            <AutocompleteItem key={classItem.id} textValue={classItem.name} className="capitalize">
                              <div className="flex justify-between items-center">
                                <span>{classItem.name}</span>
                                <div className="grid grid-flow-row">
                                  <div className="grid grid-flow-row">
                                    <span className="text-sm text-gray-400 text-center">
                                      {numberOfStudents}/{classItem.max_students} sinh viên
                                    </span>
                                    <span className="text-sm text-gray-400 text-center">
                                      {hostInstructor
                                        ? `${hostInstructor.first_name} ${hostInstructor.last_name}`
                                        : "N/A"}
                                    </span>
                                  </div>
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
        </form>
      </Form>
    </CrudModal>
  );
};

export default EditStudentModal;
