import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem, Input, Select, SelectItem } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddSubjectFormValidate, AddSubjectFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { SubjectCreateParams, SubjectResponse, subjectCreate } from "@/api/subjects";
import CrudModal from "../crud-modal";

const AddSubjectModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddSubjectFormValidate>({
    resolver: zodResolver(AddSubjectFormValidateSchema),
    defaultValues: {
      name: "",
      credits: 0,
      process_percentage: 0,
      midterm_percentage: 0,
      final_percentage: 0,
    },
  });

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<SubjectResponse>,
    ApiErrorResponse,
    SubjectCreateParams
  >({
    mutationFn: async (params) => await subjectCreate(params),
    onSuccess: (res) => {
      toast.success("Thêm môn học mới thành công !");
      queryClient.setQueryData(["subjects"], (oldData: ApiSuccessResponse<SubjectResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: [res.data, ...oldData.data],
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
                      subjects: [...department.subjects, res.data],
                    }
                  : department
              ),
            }
          : oldData
      );
      addForm.reset();
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thêm môn học thất bại!");
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
    addForm.handleSubmit((data: AddSubjectFormValidate) => {
      if (data?.process_percentage + data?.midterm_percentage + data?.final_percentage !== 100) {
        addForm.setError("process_percentage", { type: "manual", message: "Tổng % không bằng 100" });
        addForm.setError("midterm_percentage", { type: "manual", message: "Tổng % không bằng 100" });
        addForm.setError("final_percentage", { type: "manual", message: "Tổng % không bằng 100" });
        return;
      }
      addMutate({
        name: data?.name,
        credits: data?.credits,
        process_percentage: data?.process_percentage,
        midterm_percentage: data?.midterm_percentage,
        final_percentage: data?.final_percentage,
        department_id: parseInt(data?.department_id),
      });
    })();
  };

  return (
    <CrudModal title="Thêm môn học" btnText="Thêm" isPending={addIsPending} handleSubmit={handleSubmit}>
      <Form {...addForm}>
        <form method="post" className="space-y-3">
          <FormField
            control={addForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Tên"
                    placeholder="Nhập tên môn học"
                    isInvalid={!!addForm.formState.errors.name}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.name?.message}
                    onClear={() => addForm.setValue("name", "")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="credits"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Tín chỉ"
                    placeholder="Nhập số tín chỉ"
                    isInvalid={!!addForm.formState.errors.credits}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    type="number"
                    errorMessage={addForm.formState.errors.credits?.message}
                    onClear={() => addForm.setValue("credits", 0)}
                    {...field}
                    value={addForm.getValues("credits") + ""}
                    onChange={(e) => {
                      addForm.setValue("credits", parseInt(e.target.value));
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="process_percentage"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Quá trình"
                    placeholder="Nhập % quá trình"
                    isInvalid={!!addForm.formState.errors.process_percentage}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.process_percentage?.message}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">%</span>
                      </div>
                    }
                    type="number"
                    onClear={() => addForm.setValue("process_percentage", 0)}
                    {...field}
                    value={addForm.getValues("process_percentage") + ""}
                    onChange={(e) => {
                      addForm.setValue("process_percentage", parseInt(e.target.value));
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="midterm_percentage"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Giữa kì"
                    placeholder="% giữa kì"
                    isInvalid={!!addForm.formState.errors.midterm_percentage}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.midterm_percentage?.message}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">%</span>
                      </div>
                    }
                    type="number"
                    onClear={() => addForm.setValue("midterm_percentage", 0)}
                    {...field}
                    value={addForm.getValues("midterm_percentage") + ""}
                    onChange={(e) => {
                      addForm.setValue("midterm_percentage", parseInt(e.target.value));
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="final_percentage"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Cuối kì"
                    placeholder="% cuối kì"
                    isInvalid={!!addForm.formState.errors.final_percentage}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={addForm.formState.errors.final_percentage?.message}
                    endContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">%</span>
                      </div>
                    }
                    type="number"
                    onClear={() => addForm.setValue("final_percentage", 0)}
                    {...field}
                    value={addForm.getValues("final_percentage") + ""}
                    onChange={(e) => {
                      addForm.setValue("final_percentage", parseInt(e.target.value));
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

export default AddSubjectModal;
