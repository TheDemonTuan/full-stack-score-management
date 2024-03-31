"use client";

import React, { ChangeEvent, Key, ReactNode, useCallback, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Selection,
  SortDescriptor,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { capitalize } from "@/lib/capitalize";
import { FaPlus } from "react-icons/fa6";
import { RiArrowDownSLine } from "react-icons/ri";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IoSearchOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { AiOutlineFundView } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import PreviewRelatedModal, {
  PreviewRelatedClassColumns,
  PreviewRelatedInstructorColumns,
  PreviewRelatedModalData,
  PreviewRelatedStudentColumns,
  PreviewRelatedSubjectColumns,
  previewRelatedModalKey,
} from "@/components/preview-related-modal";
import { useModalStore } from "@/stores/modal-store";
import { ClassResponse } from "@/api/classes";
import { InstructorReponse } from "@/api/instructors";
import { SubjectResponse } from "@/api/subjects";
import {
  AddDepartmentModal,
  DeleteDepartmentModal,
  EditDepartmentModal,
  addDepartmentModalKey,
  deleteDepartmentModalKey,
  editDepartmentModalKey,
} from "@/components/Khoa/modal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { StudentResponse } from "@/api/students";

const columns = [
  { name: "Mã khoa", uid: "id", sortable: true },
  { name: "Ký hiệu", uid: "symbol", sortable: true },
  { name: "Tên khoa", uid: "name", sortable: true },
  { name: "Số lượng sinh viên", uid: "students", sortable: true },
  { name: "Số lượng giảng viên", uid: "instructors", sortable: true },
  { name: "Số lượng lớp học", uid: "classes", sortable: true },
  { name: "Số lượng môn học", uid: "subjects", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["id", "symbol", "name", "classes", "students", "instructors", "subjects", "actions"];

export default function KhoaPage() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({});

  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  //My Logic
  const { data: departmentsData, isPending: departmentsIsPending } = useQuery<
    ApiSuccessResponse<DepartmentResponse[]>,
    ApiErrorResponse,
    DepartmentResponse[]
  >({
    queryKey: ["departments"],
    queryFn: async () => await departmentGetAll(),
    select: (res) => res?.data,
  });

  const { modalOpen, setModalData, modelKey } = useModalStore();

  //End My Logic

  const filteredItems = useMemo(() => {
    let filteredDepartments = [...(departmentsData ?? [])];

    if (hasSearchFilter) {
      filteredDepartments = filteredDepartments.filter((department) =>
        department.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredDepartments;
  }, [departmentsData, filterValue, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: DepartmentResponse, b: DepartmentResponse) => {
      const first = a[sortDescriptor.column as keyof DepartmentResponse] as number;
      const second = b[sortDescriptor.column as keyof DepartmentResponse] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (department: DepartmentResponse, columnKey: Key) => {
      const cellValue = department[columnKey as keyof DepartmentResponse];

      switch (columnKey) {
        case "classes":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{department?.classes?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  modalOpen(previewRelatedModalKey);
                  setModalData<PreviewRelatedModalData<ClassResponse>>({
                    data: department?.classes ?? [],
                    columns: PreviewRelatedClassColumns,
                  });
                }}
              />
            </div>
          );
        case "instructors":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{department?.instructors?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  {
                    modalOpen(previewRelatedModalKey);
                    setModalData<PreviewRelatedModalData<InstructorReponse>>({
                      data: department?.instructors ?? [],
                      columns: PreviewRelatedInstructorColumns,
                    });
                  }
                }}
              />
            </div>
          );
        case "students":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{department?.students?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  modalOpen(previewRelatedModalKey);
                  setModalData<PreviewRelatedModalData<StudentResponse>>({
                    data: department?.students ?? [],
                    columns: PreviewRelatedStudentColumns,
                  });
                }}
              />
            </div>
          );
        case "subjects":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{department?.subjects?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  modalOpen(previewRelatedModalKey);
                  setModalData<PreviewRelatedModalData<SubjectResponse>>({
                    data: department?.subjects ?? [],
                    columns: PreviewRelatedSubjectColumns,
                  });
                }}
              />
            </div>
          );
        case "actions":
          return (
            <div className="relative flex items-center justify-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <BsThreeDotsVertical size={21} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="action">
                  <DropdownItem
                    aria-label="Chỉnh sửa"
                    startContent={
                      <FaRegEdit className="text-lg lg:text-xl text-blue-400 cursor-pointer active:opacity-50 hover:text-gray-400" />
                    }
                    onClick={() => {
                      setModalData(department);
                      modalOpen(editDepartmentModalKey);
                    }}>
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    aria-label="Xoá"
                    startContent={
                      <MdOutlineDelete className="text-xl lg:text-2xl text-danger cursor-pointer active:opacity-50 hover:text-gray-400" />
                    }
                    onClick={() => {
                      setModalData(department);
                      modalOpen(deleteDepartmentModalKey);
                    }}>
                    Xoá
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [modalOpen, setModalData]
  );

  const onRowsPerPageChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[40%]"
            placeholder="Tìm kiếm theo tên khoa..."
            variant="underlined"
            color="secondary"
            startContent={<IoSearchOutline size={24} className="text-secondary" />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="grid grid-flow-col gap-2 justify-between">
            <Dropdown className="col-span-1 text-sm md:text-base">
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<RiArrowDownSLine className="text-small" />} color="secondary" variant="ghost">
                  Hiển thị
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}>
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              onPress={() => modalOpen(addDepartmentModalKey)}
              color="secondary"
              variant="shadow"
              className="text-sm md:text-base col-span-3 sm:col-span-1"
              endContent={<FaPlus />}
              isLoading={departmentsIsPending}>
              Thêm khoa mới
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Có <span className="font-bold text-secondary">{departmentsData?.length}</span> khoa
          </span>
          <Select
            label="Số dòng:"
            defaultSelectedKeys={rowsPerPage.toString()}
            size="sm"
            labelPlacement="outside-left"
            variant="bordered"
            className="max-w-24 sm:max-w-32"
            onChange={onRowsPerPageChange}>
            <SelectItem key={5} value="5">
              5
            </SelectItem>
            <SelectItem key={25} value="25">
              25
            </SelectItem>
            <SelectItem key={50} value="50">
              50
            </SelectItem>
            <SelectItem key={100} value="100">
              100
            </SelectItem>
          </Select>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    visibleColumns,
    departmentsIsPending,
    departmentsData?.length,
    rowsPerPage,
    onRowsPerPageChange,
    onClear,
    modalOpen,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center p-2 gap-4">
        <Pagination
          isCompact
          showControls
          showShadow
          color="secondary"
          // isDisabled={hasSearchFilter}
          page={page}
          total={pages || 1}
          variant="light"
          onChange={setPage}
        />
        {selectedKeys === "all" && (
          <Button startContent={<MdOutlineDelete size={24} />} color="danger" variant="flat">
            <span>
              <span className="font-bold">tất cả</span> các khoa
            </span>
          </Button>
        )}
        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <Button startContent={<MdOutlineDelete size={24} />} color="danger" variant="flat">
            <span>
              <span className="font-bold">{`${selectedKeys.size}/${filteredItems.length}`}</span> khoa đã chọn
            </span>
          </Button>
        )}
      </div>
    );
  }, [page, pages, selectedKeys, filteredItems.length]);

  return (
    <>
      <Card>
        <CardContent className="p-2 lg:p-4">
          <Table
            aria-label="Danh sách các khoa"
            isHeaderSticky
            color="secondary"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}>
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                  allowsSorting={column.sortable}>
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={"Không tìm thấy khoa nào"}
              loadingContent={<Spinner label="Loading..." color="secondary" size="md" />}
              loadingState={departmentsIsPending ? "loading" : "idle"}
              items={sortedItems}>
              {(item) => (
                <TableRow key={item.id}>{(columnKey) => <TableCell>{renderCell(item, columnKey) as ReactNode}</TableCell>}</TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {modelKey === previewRelatedModalKey && <PreviewRelatedModal key={previewRelatedModalKey} />}
      {modelKey === addDepartmentModalKey && <AddDepartmentModal key={addDepartmentModalKey} />}
      {modelKey === editDepartmentModalKey && <EditDepartmentModal key={editDepartmentModalKey} />}
      {modelKey === deleteDepartmentModalKey && <DeleteDepartmentModal key={deleteDepartmentModalKey} />}
    </>
  );
}
