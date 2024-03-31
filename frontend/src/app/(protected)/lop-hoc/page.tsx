"use client";

import React, { ChangeEvent, Key, use, useCallback, useEffect, useMemo, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { IoSearchOutline } from "react-icons/io5";
import { useSuspenseQueries } from "@tanstack/react-query";
import { ApiSuccessResponse } from "@/lib/http";
import { AiOutlineFundView } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import PreviewRelatedModal, {
  PreviewRelatedStudentColumns,
  previewRelatedModalKey,
} from "@/components/preview-related-modal";
import { useModalStore } from "@/stores/modal-store";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { ClassResponse, classGetAll } from "@/api/classes";
import {
  AddClassModal,
  DeleteClassModal,
  EditClassModal,
  addClassModalKey,
  deleteClassModalKey,
  editClassModalKey,
} from "@/components/Lop-Hoc/modal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { EditClassModalData } from "@/components/Lop-Hoc/edit-modal";

const columns = [
  { name: "Mã lớp", uid: "id", sortable: true },
  { name: "Tên lớp", uid: "name", sortable: true },
  { name: "Số lượng tối đa", uid: "max_students", sortable: true },
  { name: "Khoá học", uid: "academic_year", sortable: true },
  { name: "Thuộc khoa", uid: "department_id", sortable: true },
  { name: "Chủ nhiệm bởi", uid: "host_instructor_id", sortable: true },
  { name: "Số lượng sinh viên", uid: "students", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "name",
  "max_students",
  "academic_year",
  "department_id",
  "host_instructor_id",
  "students",
  "actions",
];

export default function LopHocPage() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({});
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState<number>();
  const [filterData, setFilterData] = useState<ClassResponse[]>();
  const [searchBy, setSearchBy] = useState("lớp học");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchData, setSearchData] = useState<ClassResponse[]>();

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  //My Logic

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

  useEffect(() => {
    if (searchValue === "") {
      setSearchData(undefined);
    } else {
      const classes = filterData ?? classesQuery.data;
      const search = classes?.filter((classItem) => {
        const currDepartment = departmentsQuery.data?.find((department) => department.id === classItem.department_id);
        const currInstructor = currDepartment?.instructors?.find(
          (instructor) => instructor.id === classItem.host_instructor_id
        );
        switch (searchBy) {
          case "lớp học":
            return classItem.name.toLowerCase().includes(searchValue.toLowerCase());
          case "giảng viên":
            return `${currInstructor?.first_name} ${currInstructor?.last_name}`
              .toLowerCase()
              .includes(searchValue.toLowerCase());
          default:
            return false;
        }
      });
      setSearchData(search);
    }
  }, [classesQuery.data, departmentsQuery.data, filterData, searchBy, searchValue]);

  const handleFilter = useCallback((query: Selection) => {
    const departmentId = parseInt(Array.from(query)?.at(0) as string);
    setFilterValue(departmentId);
    setPage(1);
  }, []);

  useEffect(() => {
    if (filterValue) {
      setFilterValue(filterValue);
      setFilterData(classesQuery.data.filter((classItem) => classItem.department_id === filterValue));
    } else {
      setFilterData(undefined);
    }
  }, [departmentsQuery.data, filterValue, classesQuery.data]);

  const classIsLoading = useMemo(
    () => departmentsQuery.isLoading || classesQuery.isLoading,
    [departmentsQuery.isLoading, classesQuery.isLoading]
  );

  const { modalOpen, setModalData, modelKey } = useModalStore();

  //End My Logic

  const filteredItems = useMemo(
    () => searchData ?? filterData ?? classesQuery.data,
    [searchData, filterData, classesQuery.data]
  );

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: ClassResponse, b: ClassResponse) => {
      const first = a[sortDescriptor.column as keyof ClassResponse] as string;
      const second = b[sortDescriptor.column as keyof ClassResponse] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (classData: ClassResponse, columnKey: Key) => {
      const cellValue = classData[columnKey as keyof ClassResponse];

      const currDepartment = departmentsQuery.data?.find((department) => department.id === classData.department_id);
      const currInstructor = currDepartment?.instructors?.find(
        (instructor) => instructor.id === classData.host_instructor_id
      );

      switch (columnKey) {
        case "host_instructor_id":
          return currInstructor ? `${currInstructor?.first_name} ${currInstructor?.last_name}` : "Chưa có";
        case "department_id":
          return `
              ${currDepartment?.name}`;
        case "students":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{classData?.students?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  setModalData({
                    data: classData?.students ?? [],
                    columns: PreviewRelatedStudentColumns,
                  });
                  modalOpen(previewRelatedModalKey);
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
                      setModalData<EditClassModalData>({
                        class: classData,
                        department: currDepartment,
                        instructor: currInstructor,
                      });
                      modalOpen(editClassModalKey);
                    }}>
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    aria-label="Xoá"
                    startContent={
                      <MdOutlineDelete className="text-xl lg:text-2xl text-danger cursor-pointer active:opacity-50 hover:text-gray-400" />
                    }
                    onClick={() => {
                      setModalData(classData);
                      modalOpen(deleteClassModalKey);
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
    [departmentsQuery.data, setModalData, modalOpen]
  );

  const onRowsPerPageChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3">
          <Input
            isDisabled={classIsLoading}
            className="xl:w-[45%]"
            placeholder={`Tìm kiếm theo tên ${searchBy}...`}
            variant="underlined"
            color="secondary"
            startContent={
              <Select
                labelPlacement="outside"
                defaultSelectedKeys={["lớp học"]}
                disallowEmptySelection
                placeholder="Chọn tìm kiếm theo"
                startContent={<IoSearchOutline size={24} className="text-secondary" />}
                size="sm"
                color="secondary"
                variant="underlined"
                className="w-56"
                aria-label="Search by"
                onSelectionChange={(key) => {
                  setSearchBy(Array.from(key)?.at(0) as string);
                }}>
                <SelectItem key="lớp học">Tên lớp học</SelectItem>
                <SelectItem key="giảng viên">Tên giảng viên</SelectItem>
              </Select>
            }
            value={searchValue}
            onClear={() => onClear()}
            isClearable
            onValueChange={setSearchValue}
          />
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 justify-between">
            <Dropdown className="col-span-1">
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<RiArrowDownSLine className="text-small" />}
                  disabled={false}
                  color="secondary"
                  variant="ghost">
                  {filterValue
                    ? departmentsQuery.data.find((department) => department.id == filterValue)?.name
                    : "Lọc theo khoa"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Table Columns"
                closeOnSelect={true}
                color="secondary"
                items={departmentsQuery.data}
                defaultSelectedKeys={[filterValue + ""]}
                selectedKeys={[filterValue + ""]}
                selectionMode="single"
                onSelectionChange={handleFilter}>
                {(item) => (
                  <DropdownItem key={item.id} className="capitalize">
                    {capitalize(item.name)}
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
            <Dropdown className="col-span-1 text-sm md:text-base">
              <DropdownTrigger className="hidden sm:flex">
                <Button endContent={<RiArrowDownSLine className="text-small" />} color="secondary" variant="bordered">
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
              onPress={() => modalOpen(addClassModalKey)}
              color="secondary"
              variant="shadow"
              className="text-sm md:text-base col-span-full xl:col-span-1"
              endContent={<FaPlus />}
              isDisabled={classIsLoading}
              isLoading={classIsLoading}>
              Thêm lớp học mới
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Có <span className="font-bold text-secondary">{classesQuery.data.length}</span> lớp học
          </span>
          <Select
            label="Số dòng"
            defaultSelectedKeys={rowsPerPage.toString()}
            size="sm"
            color="secondary"
            labelPlacement="outside-left"
            variant="bordered"
            className="max-w-28 sm:max-w-32"
            onChange={onRowsPerPageChange}>
            <SelectItem color="secondary" key={5} value="5">
              5
            </SelectItem>
            <SelectItem color="secondary" key={25} value="25">
              25
            </SelectItem>
            <SelectItem color="secondary" key={50} value="50">
              50
            </SelectItem>
            <SelectItem color="secondary" key={100} value="100">
              100
            </SelectItem>
          </Select>
        </div>
      </div>
    );
  }, [
    classIsLoading,
    searchBy,
    searchValue,
    filterValue,
    departmentsQuery.data,
    handleFilter,
    visibleColumns,
    classesQuery.data.length,
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
              <span className="font-bold">tất cả</span> các lớp học
            </span>
          </Button>
        )}
        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <Button startContent={<MdOutlineDelete size={24} />} color="danger" variant="flat">
            <span>
              <span className="font-bold">{`${selectedKeys.size}/${filteredItems.length}`}</span> lớp học đã chọn
            </span>
          </Button>
        )}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pages, selectedKeys, items.length, filteredItems.length]);

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
              emptyContent={"Không tìm thấy lớp học nào"}
              loadingContent={<Spinner label="Loading..." color="secondary" size="md" />}
              isLoading={classIsLoading}
              items={sortedItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey) as any}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {modelKey === previewRelatedModalKey && <PreviewRelatedModal key={previewRelatedModalKey} />}
      {modelKey === addClassModalKey && <AddClassModal key={addClassModalKey} />}
      {modelKey === editClassModalKey && <EditClassModal key={editClassModalKey} />}
      {modelKey === deleteClassModalKey && <DeleteClassModal key={deleteClassModalKey} />}
    </>
  );
}
