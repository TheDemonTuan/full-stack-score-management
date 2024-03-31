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
import { useMutation, useQuery, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddStudentFormValidate, AddStudentFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Calendar } from "@/components/ui/calendar";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import CrudModal from "@/components/crud-modal";
import { StudentCreateParams, StudentResponse, studentCreate } from "@/api/students";
import { ClassResponse, classGetAll } from "@/api/classes";
import { useEffect } from "react";

const currentYear = new Date().getFullYear();
const lastTwoDigits = currentYear % 100;
const AddStudentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddStudentFormValidate>({
    resolver: zodResolver(AddStudentFormValidateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      address: "",
      phone: "",
      department_id: "",
      academic_year: "",
      class_id: "",
    },
  });

  const departmentId = addForm.watch("department_id");
  const academicYear = addForm.watch("academic_year");

  useEffect(() => {
    addForm.setValue("class_id", "");
  }, [addForm, departmentId, academicYear]);

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<StudentResponse>,
    ApiErrorResponse,
    StudentCreateParams
  >({
    mutationFn: async (params) => await studentCreate(params),
    onSuccess: (res) => {
      toast.success("Thêm sinh viên mới thành công !");
      queryClient.setQueryData(["students"], (oldData: ApiSuccessResponse<StudentResponse[]>) =>
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
                      students: [...department.students, res.data],
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
                      students: [...classItem.students, res.data],
                    }
                  : classItem
              ),
            }
          : oldData
      );
      modalClose();
      addForm.reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thêm sinh viên thất bại!");
    },
  });

  const [departmentsQuery, classesQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["departments"],
        queryFn: async () => await departmentGetAll(),
        select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data,
      },
      {
        queryKey: ["classes"],
        queryFn: async () => await classGetAll(),
        select: (res: ApiSuccessResponse<ClassResponse[]>) => res?.data,
      },
    ],
  });

  const handleSubmit = () => {
    addForm.handleSubmit((data: AddStudentFormValidate) => {
      addMutate({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        address: data.address,
        birth_day: data.birth_day,
        phone: data.phone,
        gender: data.gender === "nu",
        academic_year: parseInt(data.academic_year),
        department_id: parseInt(data.department_id),
        class_id: data.class_id,
      });
    })();
  };

  return (
    <CrudModal title="Thêm sinh viên" btnText="Thêm" isPending={addIsPending} handleSubmit={handleSubmit}>
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
                      autoFocus
                      {...field}
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
                            variant="ghost"
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
                      <SelectItem color="secondary" key="nam" value="nam">
                        Nam
                      </SelectItem>
                      <SelectItem color="secondary" key="nu" value="nu">
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="academic_year"
            render={({ field }) => {
              const academicYear = [...Array(lastTwoDigits)].map((_, index) => {
                return index < 9
                  ? { value: 2000 + index + 1, label: `200${index + 1}` }
                  : {
                      value: 2000 + index + 1,
                      label: `20${index + 1}`,
                    };
              });
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={academicYear || []}
                      aria-label="Chọn khoa"
                      label="Khoá học"
                      placeholder="Chọn khoá học"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      isInvalid={!!addForm.formState.errors.academic_year}
                      errorMessage={addForm.formState.errors.academic_year?.message}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isRequired
                      allowsCustomValue
                      {...field}>
                      {(year) => {
                        const numberOfClasses = classesQuery.data?.filter(
                          (classItem) => classItem.academic_year === year.value
                        ).length;
                        return (
                          <AutocompleteItem key={year.value} textValue={year.label} className="capitalize">
                            <div className="flex justify-between items-center">
                              <span> {year.label}</span>
                              <div className="grid grid-flow-row">
                                <span className="text-sm text-gray-400">{numberOfClasses} lớp học</span>
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
            name="department_id"
            render={({ field }) => {
              const isDisabled =
                departmentsQuery.isLoading || classesQuery.isLoading || !departmentsQuery.data.length || !academicYear;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
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
                      isLoading={departmentsQuery.isLoading}
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {departmentsQuery.data &&
                        departmentsQuery.data.map((department) => {
                          const numberOfClasses = classesQuery.data.filter(
                            (classItem) =>
                              classItem.department_id === department.id &&
                              classItem.academic_year === parseInt(academicYear)
                          ).length;
                          return (
                            <AutocompleteItem key={department.id} textValue={department.name} className="capitalize">
                              <div className="flex justify-between items-center">
                                <span>{department.name}</span>
                                <div className="grid grid-flow-row">
                                  <span className="text-sm text-gray-400">{numberOfClasses} lớp học</span>
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
            name="class_id"
            render={({ field }) => {
              const classes = classesQuery.data?.filter(
                (classItem) =>
                  classItem.department_id === parseInt(departmentId) &&
                  classItem.academic_year === parseInt(academicYear)
              );
              const isDisabled = classesQuery.isLoading || !departmentId || !academicYear || !classes?.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      aria-label="Chọn lớp"
                      placeholder={isDisabled ? "Không có lớp" : "Nhập tên lớp"}
                      label="Chọn lớp"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={addForm.formState.errors.class_id?.message}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isInvalid={!!addForm.formState.errors.class_id}
                      isRequired
                      isDisabled={isDisabled}
                      allowsCustomValue
                      {...field}>
                      {classes &&
                        classes.map((classItem) => {
                          const numberOfStudents = classItem.students.length;
                          const hostInstructor = departmentsQuery.data
                            .find((department) => department.id === classItem.department_id)
                            ?.instructors.find((instructor) => instructor.id === classItem.host_instructor_id);
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

export default AddStudentModal;
