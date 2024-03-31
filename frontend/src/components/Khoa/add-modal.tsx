import { DepartmentCreateParams, DepartmentResponse, departmentCreate } from "@/api/departments";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Input } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AddDepartmentFormValidate, AddDepartmentFormValidateSchema } from "./add.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import CrudModal from "../crud-modal";
import { capitalize, upperCase } from "lodash";

const AddDepartmentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose } = useModalStore();

  const addForm = useForm<AddDepartmentFormValidate>({
    resolver: zodResolver(AddDepartmentFormValidateSchema),
    defaultValues: {
      id: 0,
      symbol: "",
      name: "",
    },
  });

  const { mutate: addMutate, isPending: addIsPending } = useMutation<
    ApiSuccessResponse<DepartmentResponse>,
    ApiErrorResponse,
    DepartmentCreateParams
  >({
    mutationFn: async (params) => await departmentCreate(params),
    onSuccess: (res) => {
      toast.success("Thêm khoa mới thành công !");
      queryClient.setQueryData(["departments"], (oldData: ApiSuccessResponse<DepartmentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: [res.data, ...oldData.data],
            }
          : oldData
      );
      addForm.reset();
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Thêm khoa thất bại!");
    },
  });

  const handleSubmit = () => {
    addForm.handleSubmit((data: AddDepartmentFormValidate) => {
      addMutate({
        id: data.id,
        symbol: upperCase(data.symbol),
        name: capitalize(data.name),
      });
    })();
  };

  return (
    <CrudModal title="Thêm khoa" btnText="Thêm" isPending={addIsPending} handleSubmit={handleSubmit}>
      <Form {...addForm}>
        <form method="post" className="space-y-3">
          <FormField
            control={addForm.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Mã"
                    placeholder="Nhập mã khoa"
                    isInvalid={!!addForm.formState.errors.id}
                    isRequired
                    color="secondary"
                    variant="bordered"
                    errorMessage={addForm.formState.errors.id?.message}
                    type="number"
                    onClear={() => addForm.setValue("id", 0)}
                    {...field}
                    value={addForm.getValues("id") + ""}
                    onChange={(e) => {
                      addForm.setValue("id", e.target.value ? parseInt(e.target.value) : 0);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Ký hiệu"
                    placeholder="Nhập ký hiệu khoa"
                    isInvalid={!!addForm.formState.errors.symbol}
                    isRequired
                    color="secondary"
                    errorMessage={addForm.formState.errors.symbol?.message}
                    variant="bordered"
                    onClear={() => addForm.setValue("symbol", "")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={addForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Tên"
                    placeholder="Nhập tên khoa"
                    isInvalid={!!addForm.formState.errors.name}
                    isRequired
                    color="secondary"
                    errorMessage={addForm.formState.errors.name?.message}
                    variant="bordered"
                    onClear={() => addForm.resetField("name")}
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

export default AddDepartmentModal;
