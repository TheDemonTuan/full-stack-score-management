"use client";

import React, { ChangeEvent, Key, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  CardHeader,
  CardBody,
} from "@nextui-org/react";
import { capitalize } from "@/lib/capitalize";
import { FaPlus } from "react-icons/fa6";
import { RiArrowDownSLine } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import { useQuery, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { ApiSuccessResponse } from "@/lib/http";
import { MdOutlineDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { useModalStore } from "@/stores/modal-store";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  RegistrationResponse,
  registrationGetAll,
  registrationGetAllByDepartmentId,
  registrationGetAllByStudentName,
} from "@/api/registration";
import {
  AddStudentRegistrationModal,
  DeleteStudentRegistrationModal,
  EditStudentRegistrationModal,
  addStudentRegistrationModalKey,
  deleteStudentRegistrationModalKey,
  editStudentRegistrationModalKey,
} from "@/components/Sinh-Vien/Dang-Ky-Mon-Hoc/modal";
import _, { set } from "lodash";

const columns = [
  { name: "Mã", uid: "id", sortable: true },
  { name: "Họ và tên sinh viên", uid: "full_name", sortable: true },
  { name: "Tên môn học đã đăng ký", uid: "subject_name", sortable: true },
  { name: "Thuộc khoa", uid: "department_id", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = ["id", "full_name", "subject_name", "department_id", "actions"];

export default function SinhVienDangKyMonHocPage() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [canStudentSearch, setCanStudentSearch] = useState<string>("");
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);

  const hasDepartmentFilter = Boolean(departmentFilter);
  const hasStudentSearch = Boolean(canStudentSearch);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  //My Logic
  const [registrationsQuery, departmentsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["registrations"],
        queryFn: async () => await registrationGetAll(),
        select: (res: ApiSuccessResponse<RegistrationResponse[]>) => res?.data,
      },
      {
        queryKey: ["departments"],
        queryFn: async () => await departmentGetAll(),
        select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data,
      },
    ],
  });

  const { data: filterRegistrationsData, isFetching: filterRegistrationsIsFetching } = useQuery({
    queryKey: ["registrations", "department", { id: departmentFilter }],
    queryFn: async () => await registrationGetAllByDepartmentId({ id: departmentFilter }),
    enabled: hasDepartmentFilter,
    select: (res: ApiSuccessResponse<RegistrationResponse[]>) => res?.data,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const handleFilter = useCallback((query: Selection) => {
    setDepartmentFilter(Array.from(query)?.at(0) as string);
  }, []);

  const { data: searchRegistrationsData, isFetching: searchRegistrationsIsFetching } = useQuery({
    queryKey: ["registrations", "student", { name: canStudentSearch }],
    queryFn: async () => await registrationGetAllByStudentName({ name: canStudentSearch }),
    enabled: hasStudentSearch,
    select: (res: ApiSuccessResponse<RegistrationResponse[]>) => res?.data,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedHandleSearch = useCallback(
    _.debounce((keywork: string) => {
      setCanStudentSearch(keywork);
    }, 1000),
    []
  );

  const handleSearch = useCallback(
    (keywork: string) => {
      setCanStudentSearch("");
      setStudentSearch(keywork);
      debouncedHandleSearch(keywork);
    },
    [debouncedHandleSearch]
  );

  const registrationIsLoading =
    departmentsQuery.isPending ||
    registrationsQuery.isPending ||
    filterRegistrationsIsFetching ||
    searchRegistrationsIsFetching;

  const { modalOpen, setModalData, modelKey } = useModalStore();

  useEffect(() => {
    return () => {
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "registrations" && query.queryKey[1] === "department",
      });
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] === "registrations" && query.queryKey[1] === "student",
      });
    };
  }, [queryClient]);

  //End My Logic

  const filteredItems = useMemo(() => {
    if (searchRegistrationsData) return searchRegistrationsData;

    if (filterRegistrationsData) return filterRegistrationsData;

    return registrationsQuery.data;
  }, [searchRegistrationsData, filterRegistrationsData, registrationsQuery.data]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: RegistrationResponse, b: RegistrationResponse) => {
      const first = a[sortDescriptor.column as keyof RegistrationResponse] as string;
      const second = b[sortDescriptor.column as keyof RegistrationResponse] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (registration: RegistrationResponse, columnKey: Key) => {
      const cellValue = registration[columnKey as keyof RegistrationResponse];

      const currDepartment = departmentsQuery.data.find((department) =>
        department.subjects.find((subject) => subject.id === registration.subject_id)
      );
      const currStudent = currDepartment?.students.find((student) => student.id === registration.student_id);
      const currSubject = currDepartment?.subjects.find((subject) => subject.id === registration.subject_id);

      switch (columnKey) {
        case "full_name":
          return `${currStudent?.first_name} ${currStudent?.last_name}`;
        case "subject_name":
          return currSubject?.name;
        case "department_id":
          return currDepartment?.name;
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
                      setModalData({
                        department: currDepartment,
                        student: currStudent,
                        subject: currSubject,
                        registration,
                      });
                      modalOpen(editStudentRegistrationModalKey);
                    }}>
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    aria-label="Xoá"
                    startContent={
                      <MdOutlineDelete className="text-xl lg:text-2xl text-danger cursor-pointer active:opacity-50 hover:text-gray-400" />
                    }
                    onClick={() => {
                      setModalData(registration);
                      modalOpen(deleteStudentRegistrationModalKey);
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
    setStudentSearch("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <Input
            isClearable
            isDisabled={registrationsQuery.isPending || hasDepartmentFilter}
            className="w-full sm:max-w-[40%]"
            placeholder="Tìm kiếm tên sinh viên..."
            variant="underlined"
            color="secondary"
            startContent={<IoSearchOutline size={24} className="text-secondary" />}
            value={studentSearch}
            onClear={() => onClear()}
            onValueChange={handleSearch}
          />
          <div className="grid grid-flow-col gap-2 justify-between">
            <Dropdown className="col-span-1">
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<RiArrowDownSLine className="text-small" />}
                  variant="ghost"
                  color="secondary"
                  isDisabled={Boolean(studentSearch)}>
                  {departmentFilter
                    ? departmentsQuery.data.find((department) => department.id == parseInt(departmentFilter))?.name
                    : "Lọc theo khoa"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Table Columns"
                closeOnSelect={true}
                color="secondary"
                items={departmentsQuery.data}
                defaultSelectedKeys={[departmentFilter]}
                selectedKeys={[departmentFilter]}
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
              onPress={() => modalOpen(addStudentRegistrationModalKey)}
              color="secondary"
              variant="shadow"
              className="text-sm md:text-base col-span-2 sm:col-span-1"
              endContent={<FaPlus />}
              isLoading={registrationIsLoading}>
              Đăng ký môn học mới
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Có <span className="font-bold text-secondary">{filteredItems.length}</span> môn học được đăng ký
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
    registrationsQuery.isPending,
    hasDepartmentFilter,
    studentSearch,
    handleSearch,
    departmentFilter,
    departmentsQuery.data,
    handleFilter,
    visibleColumns,
    registrationIsLoading,
    filteredItems.length,
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
              emptyContent={"Không tìm thấy sinh viên nào đăng ký"}
              loadingContent={<Spinner label="Loading..." color="secondary" size="md" />}
              isLoading={registrationIsLoading}
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
      {modelKey === addStudentRegistrationModalKey && (
        <AddStudentRegistrationModal key={addStudentRegistrationModalKey} />
      )}
      {modelKey === editStudentRegistrationModalKey && (
        <EditStudentRegistrationModal key={editStudentRegistrationModalKey} />
      )}
      {modelKey === deleteStudentRegistrationModalKey && (
        <DeleteStudentRegistrationModal key={deleteStudentRegistrationModalKey} />
      )}
    </>
  );
}
