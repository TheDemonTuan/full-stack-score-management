import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem, Input, Select, SelectItem } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddClassFormValidate, AddClassFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import CrudModal from "../crud-modal";
import { ClassCreateParams, ClassResponse, classCreate } from "@/api/classes";

const currentYear = new Date().getFullYear();
const lastTwoDigits = currentYear % 100;
const AddClassModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddClassFormValidate>({
    resolver: zodResolver(AddClassFormValidateSchema),
    defaultValues: {
      number_class: 0,
      max_students: 0,
      academic_year: "",
      department_id: "",
    },
  });

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<ClassResponse>,
    ApiErrorResponse,
    ClassCreateParams
  >({
    mutationFn: async (params) => await classCreate(params),
    onSuccess: (res) => {
      toast.success("Thêm lớp mới thành công !");
      queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["departments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["instructors"],
      });
      addForm.reset();
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thêm lớp thất bại!");
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
    addForm.handleSubmit((data: AddClassFormValidate) => {
      addMutate({
        number_class: data?.number_class,
        max_students: data?.max_students,
        academic_year: parseInt(data?.academic_year),
        department_id: parseInt(data?.department_id),
      });
    })();
  };

  return (
    <CrudModal title="Thêm lớp học" btnText="Thêm" isPending={addIsPending} handleSubmit={handleSubmit}>
      <Form {...addForm}>
        <form method="post" className="space-y-3">
          <FormField
            control={addForm.control}
            name="number_class"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Số lượng lớp"
                    color="secondary"
                    placeholder="Nhập số lượng lớp học"
                    isInvalid={!!addForm.formState.errors.number_class}
                    errorMessage={addForm.formState.errors.number_class?.message}
                    isRequired
                    variant="bordered"
                    type="number"
                    onClear={() => addForm.setValue("number_class", 0)}
                    {...field}
                    value={addForm.getValues("number_class") + ""}
                    onChange={(e) => {
                      addForm.setValue("number_class", parseInt(e.target.value));
                    }}
                  />
                </FormControl>
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
                      defaultItems={academicYear}
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
                      {(year) => (
                        <AutocompleteItem key={year.value} textValue={year.label} className="capitalize">
                          {year.label}
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
            name="max_students"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Số lượng sinh viên tối đa"
                    placeholder="Nhập số lượng sinh viên tối đa"
                    color="secondary"
                    isInvalid={!!addForm.formState.errors.max_students}
                    errorMessage={addForm.formState.errors.max_students?.message}
                    isRequired
                    variant="bordered"
                    onClear={() => addForm.setValue("max_students", 0)}
                    type="number"
                    {...field}
                    value={addForm.getValues("max_students") + ""}
                    onChange={(e) => {
                      addForm.setValue("max_students", parseInt(e.target.value));
                    }}
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

export default AddClassModal;
