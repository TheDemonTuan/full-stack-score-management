import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Button, Input, Popover, PopoverTrigger, PopoverContent, Select, SelectItem } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { EditInstructorFormValidate, EditInstructorFormValidateSchema } from "./edit.validate";
import { InstructorReponse, InstructorUpdateByIdParams, instructorUpdateById } from "@/api/instructors";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { DepartmentResponse } from "@/api/departments";
import CrudModal from "../../crud-modal";

export interface EditInstructorModalData {
  department?: DepartmentResponse;
  instructor: InstructorReponse;
}

const EditInstructorModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as EditInstructorModalData,
    }))
  );

  const editForm = useForm<EditInstructorFormValidate>({
    resolver: zodResolver(EditInstructorFormValidateSchema),
    values: {
      first_name: modalData.instructor.first_name,
      last_name: modalData.instructor.last_name,
      email: modalData.instructor.email,
      address: modalData.instructor.address,
      birth_day: modalData.instructor.birth_day,
      degree: modalData.instructor.degree,
      phone: modalData.instructor.phone,
      gender: modalData.instructor.gender ? "nu" : "nam",
      department_id: modalData.instructor.department_id + "",
    },
  });

  useEffect(() => {
    editForm.setValue("birth_day", new Date(modalData.instructor.birth_day));
  }, [editForm, modalData]);

  const { mutate: editMutate, isPending: editIsPending } = useMutation<
    ApiSuccessResponse<InstructorReponse>,
    ApiErrorResponse,
    InstructorUpdateByIdParams
  >({
    mutationFn: async (params) => await instructorUpdateById(params),
    onSuccess: (res) => {
      toast.success("Cập nhật giảng viên thành công !");
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
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
                      instructors: department.instructors.map((instructor) =>
                        instructor.id === res.data.id ? res.data : instructor
                      ),
                    }
                  : department
              ),
            }
          : oldData
      );
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật giảng viên thất bại!");
    },
  });

  const handleSubmit = () => {
    editForm.handleSubmit((data: EditInstructorFormValidate) => {
      editMutate({
        id: modalData.instructor.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        address: data.address,
        birth_day: data.birth_day,
        degree: data.degree,
        phone: data.phone,
        gender: data.gender === "nu",
      });
    })();
  };

  return (
    <CrudModal title="Chỉnh sửa giảng viên" btnText="Cập nhật" isPending={editIsPending} handleSubmit={handleSubmit}>
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
                      placeholder={modalData.instructor.first_name}
                      label="Họ"
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.first_name?.message}
                      onClear={() => editForm.setValue("first_name", "")}
                      {...field}
                      autoFocus
                    />
                  </FormControl>
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
                      placeholder={modalData.instructor.last_name}
                      label="Tên"
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.last_name?.message}
                      onClear={() => editForm.setValue("last_name", "")}
                      {...field}
                    />
                  </FormControl>
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
                    placeholder={modalData.instructor.email}
                    label="Email"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.email?.message}
                    onClear={() => editForm.setValue("email", "")}
                    {...field}
                  />
                </FormControl>
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
                    placeholder={modalData.instructor.address}
                    label="Địa chỉ"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.address?.message}
                    onClear={() => editForm.setValue("address", "")}
                    {...field}
                  />
                </FormControl>
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
                      radius="lg"
                      label="Giới tính"
                      placeholder="Chọn giới tính"
                      size="sm"
                      color="secondary"
                      errorMessage={editForm.formState.errors.gender?.message}
                      defaultSelectedKeys={[modalData.instructor.gender ? "nu" : "nam"]}
                      {...field}>
                      <SelectItem key="nam" value="nam">
                        Nam
                      </SelectItem>
                      <SelectItem key="nu" value="nu">
                        Nữ
                      </SelectItem>
                    </Select>
                  </FormControl>
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
                    placeholder={modalData.instructor.phone}
                    label="Số điện thoại"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.phone?.message}
                    onClear={() => editForm.setValue("phone", "")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!editForm.formState.errors.degree}
                    isRequired
                    placeholder={modalData.instructor.degree}
                    label="Bằng cấp"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.degree?.message}
                    onClear={() => editForm.setValue("degree", "")}
                    {...field}
                  />
                </FormControl>
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
        </form>
      </Form>
    </CrudModal>
  );
};

export default EditInstructorModal;
