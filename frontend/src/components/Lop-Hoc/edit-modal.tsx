import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { useModalStore } from "@/stores/modal-store";
import { Autocomplete, AutocompleteItem, Input } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { EditClassFormValidate, EditClassFormValidateSchema } from "./edit.validate";
import CrudModal from "../crud-modal";
import { ClassResponse, ClassUpdateByIdParams, classUpdateById } from "@/api/classes";
import { DepartmentResponse } from "@/api/departments";
import { InstructorReponse, instructorGetAll } from "@/api/instructors";

export interface EditClassModalData {
  department?: DepartmentResponse;
  instructor?: InstructorReponse;
  class: ClassResponse;
}

const EditClassModal = () => {
  const queryClient = useQueryClient();

  const { modalClose, modalData } = useModalStore(
    useShallow((state) => ({
      modalClose: state.modalClose,
      modalData: state.modalData as EditClassModalData,
    }))
  );

  const editForm = useForm<EditClassFormValidate>({
    resolver: zodResolver(EditClassFormValidateSchema),
    values: {
      max_students: modalData.class.max_students,
      department_id: modalData.department?.id + "",
      host_instructor_id: modalData.instructor?.id + "",
    },
  });

  const { mutate: editMutate, isPending: editIsPending } = useMutation<
    ApiSuccessResponse<ClassResponse>,
    ApiErrorResponse,
    ClassUpdateByIdParams
  >({
    mutationFn: async (params) => await classUpdateById(params),
    onSuccess: (res) => {
      toast.success("Cập nhật lớp học thành công !");
      queryClient.setQueryData(["classes"], (oldData: ApiSuccessResponse<ClassResponse[]>) =>
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
                      classes: department.classes.map((classData) =>
                        classData.id === res.data.id ? res.data : classData
                      ),
                    }
                  : department
              ),
            }
          : oldData
      );
      queryClient.setQueryData(["instructors"], (oldData: ApiSuccessResponse<InstructorReponse[]>) =>
        oldData
          ? {
              ...oldData,
              data: oldData.data.map((instructor) =>
                instructor.id === res.data.host_instructor_id
                  ? {
                      ...instructor,
                      classes: instructor.classes.map((classData) =>
                        classData.id === res.data.id ? res.data : classData
                      ),
                    }
                  : instructor
              ),
            }
          : oldData
      );

      modalClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Cập nhật lớp học thất bại!");
    },
  });

  const { data: instructorsData, isLoading: instructorsIsLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: async () => await instructorGetAll(),
    select: (res) => res?.data,
  });

  const handleSubmit = () => {
    editForm.handleSubmit((data: EditClassFormValidate) => {
      editMutate({
        id: modalData.class.id,
        max_students: data?.max_students,
        host_instructor_id: data?.host_instructor_id,
      });
    })();
  };

  return (
    <CrudModal title="Sửa lớp học" btnText="Cập nhật" isPending={editIsPending} handleSubmit={handleSubmit}>
      <Form {...editForm}>
        <form method="post" className="space-y-3">
          <FormField
            control={editForm.control}
            name="max_students"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    label="Số lượng sinh viên tối đa"
                    placeholder={field.value + ""}
                    color="secondary"
                    isInvalid={!!editForm.formState.errors.max_students}
                    errorMessage={editForm.formState.errors.max_students?.message}
                    isRequired
                    variant="bordered"
                    onClear={() => editForm.setValue("max_students", 0)}
                    type="number"
                    {...field}
                    value={editForm.getValues("max_students") + ""}
                    onChange={(e) => {
                      editForm.setValue("max_students", parseInt(e.target.value));
                    }}
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
                  <Autocomplete
                    aria-label="Chọn khoa"
                    placeholder={modalData.department?.name || ""}
                    label="Chọn khoa"
                    radius="lg"
                    variant="bordered"
                    color="secondary"
                    errorMessage={editForm.formState.errors.department_id?.message}
                    selectedKey={field.value}
                    onSelectionChange={field.onChange}
                    disabledKeys={[field.value]}
                    isInvalid={!!editForm.formState.errors.department_id}
                    isRequired
                    allowsCustomValue
                    isDisabled
                    {...field}>
                    <AutocompleteItem
                      key={field.value}
                      textValue={modalData.department?.name || ""}
                      className="capitalize">
                      {modalData.department?.name || ""}
                    </AutocompleteItem>
                  </Autocomplete>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="host_instructor_id"
            render={({ field }) => {
              const instructors = instructorsData?.filter(
                (instructor) => instructor.department_id === modalData.department?.id
              );
              const isDisabled = instructorsIsLoading || !instructors?.length;
              return (
                <FormItem>
                  <FormControl>
                    <Autocomplete
                      defaultItems={instructors ?? []}
                      aria-label="Chọn giảng viên chủ nhiệm"
                      placeholder={isDisabled ? "Không có giảng viên" : "Nhập giảng viên chủ nhiệm"}
                      label="Chọn giảng viên chủ nhiệm"
                      radius="lg"
                      variant="bordered"
                      color="secondary"
                      errorMessage={editForm.formState.errors.host_instructor_id?.message}
                      selectedKey={field.value}
                      onSelectionChange={field.onChange}
                      disabledKeys={[field.value]}
                      isInvalid={!!editForm.formState.errors.host_instructor_id}
                      isLoading={instructorsIsLoading}
                      isDisabled={isDisabled}
                      isRequired
                      allowsCustomValue
                      {...field}>
                      {(instructor) => (
                        <AutocompleteItem
                          key={instructor.id}
                          textValue={`${instructor?.first_name} ${instructor?.last_name}`}
                          className="capitalize">
                          {`${instructor?.first_name} ${instructor?.last_name}`}
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

export default EditClassModal;
