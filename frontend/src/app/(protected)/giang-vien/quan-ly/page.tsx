"use client";

import React, { ChangeEvent, Key, useCallback, useEffect, useMemo, useState } from "react";
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
  Card,
  CardBody,
} from "@nextui-org/react";
import { capitalize } from "@/lib/capitalize";
import { FaPlus } from "react-icons/fa6";
import { RiArrowDownSLine } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import { useSuspenseQueries } from "@tanstack/react-query";
import { ApiSuccessResponse } from "@/lib/http";
import { AiOutlineFundView } from "react-icons/ai";
import { MdOutlineDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import PreviewRelatedModal, {
  PreviewRelatedAssignmentColumns,
  PreviewRelatedClassColumns,
  PreviewRelatedGradeColumns,
  PreviewRelatedModalData,
  previewRelatedModalKey,
} from "@/components/preview-related-modal";
import { useModalStore } from "@/stores/modal-store";
import { InstructorReponse, instructorGetAll } from "@/api/instructors";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { ClassResponse } from "@/api/classes";
import {
  AddInstructorModal,
  DeleteInstructorModal,
  EditInstructorModal,
  addInstructorModalKey,
  deleteInstructorModalKey,
  editInstructorModalKey,
} from "@/components/Giang-Vien/Quan-Ly/modal";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AssignmentResponse } from "@/api/assignment";
import { EditInstructorModalData } from "@/components/Giang-Vien/Quan-Ly/edit-modal";
import { GradeResponse } from "@/api/grade";

const columns = [
  { name: "Mã giảng viên", uid: "id", sortable: true },
  { name: "Họ giảng viên", uid: "first_name", sortable: true },
  { name: "Tên giảng viên", uid: "last_name", sortable: true },
  { name: "Họ tên giảng viên", uid: "full_name", sortable: true },
  { name: "Email", uid: "email", sortable: true },
  { name: "Địa chỉ", uid: "address", sortable: true },
  { name: "Ngày sinh", uid: "birth_day", sortable: true },
  { name: "Số điện thoại", uid: "phone", sortable: true },
  { name: "Giới tính", uid: "gender", sortable: true },
  { name: "Trình độ", uid: "degree", sortable: true },
  { name: "Thuộc khoa", uid: "department_id", sortable: true },
  { name: "Số lượng lớp quản lý", uid: "classes", sortable: true },
  { name: "Số lượng môn học được phân công", uid: "assignments", sortable: true },
  { name: "Số lượng điểm đã chấm", uid: "grades", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["id", "full_name", "email", "phone", "gender", "department_id", "actions"];

export default function GiangVienQuanLyPage() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({});
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState<number>();
  const [filterData, setFilterData] = useState<InstructorReponse[]>();
  const [searchBy, setSearchBy] = useState("tên giảng viên");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchData, setSearchData] = useState<InstructorReponse[]>();

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  //My Logic
  const [departmentsQuery, instructorsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["departments"],
        queryFn: async () => await departmentGetAll(),
        select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data,
      },
      {
        queryKey: ["instructors"],
        queryFn: async () => await instructorGetAll(),
        select: (res: ApiSuccessResponse<InstructorReponse[]>) => res?.data,
      },
    ],
  });

  useEffect(() => {
    if (searchValue === "") {
      setSearchData(undefined);
    } else {
      const instructors = filterData ?? instructorsQuery.data;
      const search = instructors?.filter((instructor) => {
        switch (searchBy) {
          case "tên giảng viên":
            return `${instructor?.first_name} ${instructor?.last_name}`
              .toLowerCase()
              .includes(searchValue.toLowerCase());
          case "email":
            return instructor.email.toLowerCase().includes(searchValue.toLowerCase());
          case "số điện thoại":
            return instructor.phone.toLowerCase().includes(searchValue.toLowerCase());
          default:
            return false;
        }
      });
      setSearchData(search);
    }
  }, [departmentsQuery.data, filterData, instructorsQuery.data, searchBy, searchValue]);

  const handleFilter = useCallback((query: Selection) => {
    const departmentId = parseInt(Array.from(query)?.at(0) as string);
    setFilterValue(departmentId);
    setPage(1);
  }, []);

  useEffect(() => {
    if (filterValue) {
      setFilterValue(filterValue);
      setFilterData(instructorsQuery.data.filter((instructor) => instructor.department_id === filterValue));
    } else {
      setFilterData(undefined);
    }
  }, [departmentsQuery.data, filterValue, instructorsQuery.data]);

  const instructorIsLoading = useMemo(
    () => departmentsQuery.isLoading || instructorsQuery.isLoading,
    [departmentsQuery.isLoading, instructorsQuery.isLoading]
  );

  const { modalOpen, setModalData, modelKey } = useModalStore();

  //End My Logic

  const filteredItems = useMemo(
    () => searchData ?? filterData ?? instructorsQuery.data,
    [filterData, instructorsQuery.data, searchData]
  );

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: InstructorReponse, b: InstructorReponse) => {
      const first = a[sortDescriptor.column as keyof InstructorReponse] as string;
      const second = b[sortDescriptor.column as keyof InstructorReponse] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (instructor: InstructorReponse, columnKey: Key) => {
      const cellValue = instructor[columnKey as keyof InstructorReponse];
      const currDepartment = departmentsQuery.data.find((department) => department.id === instructor.department_id);

      switch (columnKey) {
        case "full_name":
          return `${instructor.first_name} ${instructor.last_name}`;
        case "gender":
          return `${!instructor.gender ? "Nam" : "Nữ"}`;
        case "department_id":
          return `
              ${currDepartment?.name}`;
        case "classes":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{instructor?.classes?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  setModalData<PreviewRelatedModalData<ClassResponse>>({
                    data: instructor?.classes ?? [],
                    columns: PreviewRelatedClassColumns,
                  });
                  modalOpen(previewRelatedModalKey);
                }}
              />
            </div>
          );
        case "grades":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{instructor?.grades?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  setModalData<PreviewRelatedModalData<GradeResponse>>({
                    data: instructor?.grades ?? [],
                    columns: PreviewRelatedGradeColumns,
                  });
                  modalOpen(previewRelatedModalKey);
                }}
              />
            </div>
          );
        case "assignments":
          return (
            <div className="relative flex justify-center items-center gap-2">
              <p className="font-medium text-base">{instructor?.assignments?.length ?? 0}</p>
              <AiOutlineFundView
                className="elative flex justify-center items-center cursor-pointer hover:text-gray-400"
                size={24}
                onClick={() => {
                  setModalData<PreviewRelatedModalData<AssignmentResponse>>({
                    data: instructor?.assignments ?? [],
                    columns: PreviewRelatedAssignmentColumns,
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
                      setModalData<EditInstructorModalData>({
                        instructor,
                        department: currDepartment,
                      });
                      modalOpen(editInstructorModalKey);
                    }}>
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    aria-label="Xoá"
                    startContent={
                      <MdOutlineDelete className="text-xl lg:text-2xl text-danger cursor-pointer active:opacity-50 hover:text-gray-400" />
                    }
                    onClick={() => {
                      setModalData(instructor);
                      modalOpen(deleteInstructorModalKey);
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
            isDisabled={instructorIsLoading}
            className="xl:w-[45%]"
            placeholder={`Tìm kiếm theo ${searchBy}...`}
            variant="underlined"
            color="secondary"
            startContent={
              <Select
                labelPlacement="outside"
                startContent={<IoSearchOutline size={24} className="text-secondary" />}
                defaultSelectedKeys={["tên giảng viên"]}
                disallowEmptySelection
                placeholder="Chọn tìm kiếm theo"
                size="sm"
                color="secondary"
                variant="underlined"
                className="w-56"
                aria-label="Search by"
                onSelectionChange={(key) => {
                  setSearchBy(Array.from(key)?.at(0) as string);
                }}>
                <SelectItem key="tên giảng viên">Tên giảng viên</SelectItem>
                <SelectItem key="email">Email</SelectItem>
                <SelectItem key="số điện thoại">Số điện thoại</SelectItem>
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
              onPress={() => modalOpen(addInstructorModalKey)}
              color="secondary"
              variant="shadow"
              className="text-sm md:text-base col-span-2 xl:col-span-1"
              endContent={<FaPlus />}
              isLoading={instructorIsLoading}>
              Thêm giảng viên mới
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Có <span className="font-bold text-secondary">{instructorsQuery.data.length}</span> giảng viên
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
    instructorIsLoading,
    searchBy,
    searchValue,
    filterValue,
    departmentsQuery.data,
    handleFilter,
    visibleColumns,
    instructorsQuery.data.length,
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
              <span className="font-bold">tất cả</span> các giảng viên
            </span>
          </Button>
        )}
        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <Button startContent={<MdOutlineDelete size={24} />} color="danger" variant="flat">
            <span>
              <span className="font-bold">{`${selectedKeys.size}/${filteredItems.length}`}</span> giảng viên đã chọn
            </span>
          </Button>
        )}
      </div>
    );
  }, [page, pages, selectedKeys, filteredItems.length]);

  return (
    <>
      <Card className="lg:p-2" shadow="lg">
        <CardBody>
          <Table
            aria-label="Danh sách các khoa"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            color="secondary"
            shadow="lg"
            fullWidth
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
              emptyContent={"Không tìm thấy giảng viên nào"}
              loadingContent={<Spinner label="Loading..." color="secondary" size="md" />}
              isLoading={instructorIsLoading}
              items={sortedItems}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey) as any}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      {modelKey === previewRelatedModalKey && <PreviewRelatedModal key={previewRelatedModalKey} />}
      {modelKey === addInstructorModalKey && <AddInstructorModal key={addInstructorModalKey} />}
      {modelKey === editInstructorModalKey && <EditInstructorModal key={editInstructorModalKey} />}
      {modelKey === deleteInstructorModalKey && <DeleteInstructorModal key={deleteInstructorModalKey} />}
    </>
  );
}
