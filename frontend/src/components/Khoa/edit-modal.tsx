import { DepartmentResponse, DepartmentUpdateByIdParams, departmentUpdateById } from "@/api/departments";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Input } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { EditDepartmentFormValidate, EditDepartmentFormValidateSchema } from "./edit.validate";
import CRUDModal from "../crud-modal";
import { useShallow } from "zustand/react/shallow";
import { capitalize } from "lodash";

const EditDepartmentModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalData: state.modalData as DepartmentResponse,
      modalClose: state.modalClose,
    }))
  );

  const editForm = useForm<EditDepartmentFormValidate>({
    resolver: zodResolver(EditDepartmentFormValidateSchema),
    values: {
      id: modalData?.id || 0,
      symbol: modalData?.symbol || "",
      name: modalData?.name || "",
    },
  });

  const { mutate: editMutate, isPending: editIsPending } = useMutation<
    ApiSuccessResponse<DepartmentResponse>,
    ApiErrorResponse,
    DepartmentUpdateByIdParams
  >({
    mutationFn: async (params) => await departmentUpdateById(params),
    onSuccess: (res) => {
      toast.success("Cập nhật khoa thành công !");
      queryClient.setQueryData(["departments"], (oldData: ApiSuccessResponse<DepartmentResponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((item) => (item.id === res.data.id ? res.data : item)),
            }
          : oldData
      );
      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật khoa thất bại!");
    },
  });

  const handleSubmit = () => {
    editForm.handleSubmit((data: EditDepartmentFormValidate) => {
      editMutate({
        id: modalData?.id || 0,
        name: capitalize(data.name),
      });
    })();
  };

  return (
    <CRUDModal title="Chỉnh sửa khoa" btnText="Cập nhật" isPending={editIsPending} handleSubmit={handleSubmit}>
      <Form {...editForm}>
        <form method="post" className="space-y-3">
          <FormField
            control={editForm.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Mã"
                    placeholder={modalData?.id + "" || "Mã khoa"}
                    isInvalid={!!editForm.formState.errors.id}
                    isDisabled
                    isRequired
                    variant="bordered"
                    type="number"
                    color="secondary"
                    errorMessage={editForm.formState.errors.id?.message}
                    onClear={() => editForm.setValue("symbol", "")}
                    {...field}
                    value={editForm.getValues("id") + ""}
                    onChange={(e) => {
                      editForm.setValue("id", parseInt(e.target.value));
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Ký hiệu"
                    isDisabled
                    placeholder={modalData?.symbol || "Ký hiệu khoa"}
                    isInvalid={!!editForm.formState.errors.symbol}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.symbol?.message}
                    onClear={() => editForm.setValue("symbol", "")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    autoFocus
                    label="Tên"
                    placeholder={modalData?.name || "Tên khoa"}
                    isInvalid={!!editForm.formState.errors.name}
                    isRequired
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.name?.message}
                    onClear={() => editForm.setValue("name", "")}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </CRUDModal>
  );
};

export default EditDepartmentModal;
