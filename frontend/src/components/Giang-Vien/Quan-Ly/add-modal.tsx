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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddInstructorFormValidate, AddInstructorFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { InstructorCreateParams, InstructorReponse, instructorCreate } from "@/api/instructors";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import CrudModal from "../../crud-modal";

const AddInstructorModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddInstructorFormValidate>({
    resolver: zodResolver(AddInstructorFormValidateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      address: "",
      degree: "",
      phone: "",
      department_id: "",
    },
  });

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<InstructorReponse>,
    ApiErrorResponse,
    InstructorCreateParams
  >({
    mutationFn: async (params) => await instructorCreate(params),
    onSuccess: (res) => {
      toast.success("Thêm giảng viên mới thành công !");
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: [...oldData.data, res.data],
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
                      instructors: [...department.instructors, res.data],
                    }
                  : department
              ),
            }
          : oldData
      );
      modalClose();
      addForm.reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thêm giảng viên thất bại!");
    },
  });

  const { data: departmentsData, isLoading: departmentsIsLoading } = useQuery<
    ApiSuccessResponse<DepartmentResponse[]>,
    ApiErrorResponse,
    DepartmentResponse[]
  >({
    queryKey: ["departments"],
    queryFn: async () => await departmentGetAll(),
    select: (res) => res?.data,
  });

  const handleSubmit = () => {
    addForm.handleSubmit((data: AddInstructorFormValidate) => {
      addMutate({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        address: data.address,
        birth_day: data.birth_day,
        degree: data.degree,
        phone: data.phone,
        gender: data.gender === "nu",
        department_id: parseInt(data.department_id),
      });
    })();
  };

  return (
    <CrudModal title="Thêm giảng viên" btnText="Thêm" isPending={addIsPending} handleSubmit={handleSubmit}>
      <Form {...addForm}>
        <form method="post" className="space-y-4">
          <div className="grid grid-flow-col gap-2">
            <FormField
              control={addForm.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      isInvalid={!!addForm.formState.errors.first_name}
                      isRequired
                      placeholder="John"
                      label="Họ"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.first_name?.message}
                      onClear={() => addForm.resetField("first_name")}
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={addForm.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      isInvalid={!!addForm.formState.errors.last_name}
                      isRequired
                      placeholder="Wich"
                      label="Tên"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.last_name?.message}
                      onClear={() => addForm.resetField("last_name")}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={addForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!addForm.formState.errors.email}
                    isRequired
                    placeholder="john.wick@gmail.com"
                    label="Email"
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.email?.message}
                    onClear={() => addForm.resetField("email")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!addForm.formState.errors.address}
                    isRequired
                    placeholder="New York"
                    label="Địa chỉ"
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.address?.message}
                    onClear={() => addForm.resetField("address")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid grid-flow-row lg:grid-flow-col items-center gap-2">
            <FormField
              control={addForm.control}
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
                              !!addForm.formState.errors.birth_day && "border-danger text-danger"
                            )}>
                            {field.value ? field.value.toDateString() : <span>Chọn ngày sinh</span>}
                            <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          required
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
              control={addForm.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      isInvalid={!!addForm.formState.errors.gender}
                      isRequired
                      variant="bordered"
                      radius="lg"
                      label="Giới tính"
                      placeholder="Chọn giới tính"
                      color="secondary"
                      errorMessage={addForm.formState.errors.gender?.message}
                      size="sm"
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
            control={addForm.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!addForm.formState.errors.phone}
                    isRequired
                    placeholder="0123456789"
                    label="Số điện thoại"
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.phone?.message}
                    onClear={() => addForm.resetField("phone")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    isInvalid={!!addForm.formState.errors.degree}
                    isRequired
                    placeholder="Master"
                    label="Bằng cấp"
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.degree?.message}
                    onClear={() => addForm.resetField("degree")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="department_id"
            render={({ field }) => {
              const isDisabled = departmentsIsLoading || !departmentsData?.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={departmentsData ?? []}
                      aria-label="Chọn khoa"
                      placeholder={isDisabled ? "Không có khoa nào" : "Nhập tên khoa"}
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
                      isLoading={departmentsIsLoading}
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {(department) => (
                        <AutocompleteItem key={department.id} textValue={department.name} className="capitalize">
                          {department.name}
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

export default AddInstructorModal;
