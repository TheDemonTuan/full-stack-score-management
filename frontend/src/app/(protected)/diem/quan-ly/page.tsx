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
} from "@nextui-org/react";
import { capitalize } from "@/lib/capitalize";
import { FaPlus } from "react-icons/fa6";
import { RiArrowDownSLine } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
import { IoSearchOutline } from "react-icons/io5";
import { useSuspenseQueries } from "@tanstack/react-query";
import { ApiSuccessResponse } from "@/lib/http";
import { MdOutlineDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import PreviewRelatedModal, { previewRelatedModalKey } from "@/components/preview-related-modal";
import { useModalStore } from "@/stores/modal-store";
import { DepartmentResponse, departmentGetAll } from "@/api/departments";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GradeResponse, gradeGetAll } from "@/api/grade";
import {
  AddGradeModal,
  DeleteGradeModal,
  EditGradeModal,
  addGradeModalKey,
  deleteGradeModalKey,
  editGradeModalKey,
} from "@/components/Diem/modal";
import { EditGradeModalData } from "@/components/Diem/edit-modal";

const columns = [
  { name: "Mã", uid: "id", sortable: true },
  { name: "Tên môn học", uid: "subject_name", sortable: true },
  { name: "Tên sinh viên", uid: "student_name", sortable: true },
  { name: "Giảng viên giảng dạy", uid: "instructor_name", sortable: true },
  { name: "Điểm quá trình", uid: "process_score", sortable: true },
  { name: "Điểm giữa kì", uid: "midterm_score", sortable: true },
  { name: "Điểm cuối kì", uid: "final_score", sortable: true },
  { name: "Điểm trung bình", uid: "avg_score", sortable: true },
  { name: "Hành động", uid: "actions" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "id",
  "process_score",
  "midterm_score",
  "final_score",
  "avg_score",
  "subject_name",
  "student_name",
  "instructor_name",
  "actions",
];

export default function DiemQuanLyPage() {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({});
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState<number>();
  const [filterData, setFilterData] = useState<GradeResponse[]>();
  const [searchBy, setSearchBy] = useState("môn học");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchData, setSearchData] = useState<GradeResponse[]>();

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) => Array.from(visibleColumns).includes(column.uid));
  }, [visibleColumns]);

  //My Logic

  const [departmentsQuery, gradesQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["departments"],
        queryFn: async () => await departmentGetAll(),
        select: (res: ApiSuccessResponse<DepartmentResponse[]>) => res?.data,
      },
      {
        queryKey: ["grades"],
        queryFn: async () => await gradeGetAll(),
        select: (res: ApiSuccessResponse<GradeResponse[]>) => res?.data,
      },
    ],
  });

  useEffect(() => {
    if (searchValue === "") {
      setSearchData(undefined);
    } else {
      const grades = filterData ?? gradesQuery.data;
      const search = grades?.filter((grade) => {
        const currDepartment = departmentsQuery.data?.find((department) =>
          department.instructors?.find((instructor) => instructor.id === grade.by_instructor_id)
        );
        const currInstructor = currDepartment?.instructors?.find(
          (instructor) => instructor.id === grade.by_instructor_id
        );
        const currStudent = currDepartment?.students?.find((student) => student.id === grade.student_id);
        const currSubject = currDepartment?.subjects?.find((subject) => subject.id === grade.subject_id);

        switch (searchBy) {
          case "môn học":
            return currSubject?.name.toLowerCase().includes(searchValue.toLowerCase());
          case "sinh viên":
            return `${currStudent?.first_name} ${currStudent?.last_name}`
              .toLowerCase()
              .includes(searchValue.toLowerCase());
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
  }, [departmentsQuery.data, filterData, gradesQuery.data, searchBy, searchValue]);

  const handleFilter = useCallback((query: Selection) => {
    const departmentId = parseInt(Array.from(query)?.at(0) as string);
    setFilterValue(departmentId);
    setPage(1);
  }, []);

  useEffect(() => {
    if (filterValue) {
      setFilterValue(filterValue);
      setFilterData(
        gradesQuery.data?.filter((grade) =>
          departmentsQuery.data
            ?.find((department) => department.id === filterValue)
            ?.subjects?.find((subject) => subject.id === grade.subject_id)
        )
      );
    } else {
      setFilterData(undefined);
    }
  }, [departmentsQuery.data, gradesQuery.data, filterValue]);

  const gradesIsLoading = useMemo(
    () => gradesQuery.isLoading || departmentsQuery.isLoading,
    [gradesQuery.isLoading, departmentsQuery.isLoading]
  );

  const { modalOpen, setModalData, modelKey } = useModalStore();
  //End My Logic

  const filteredItems = useMemo(
    () => searchData ?? filterData ?? gradesQuery.data,
    [filterData, gradesQuery.data, searchData]
  );

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: GradeResponse, b: GradeResponse) => {
      const first = a[sortDescriptor.column as keyof GradeResponse] as string;
      const second = b[sortDescriptor.column as keyof GradeResponse] as string;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (grade: GradeResponse, columnKey: Key) => {
      const cellValue = grade[columnKey as keyof GradeResponse];

      const currDepartment = departmentsQuery.data?.find((department) =>
        department.instructors?.find((instructor) => instructor.id === grade.by_instructor_id)
      );
      const currInstructor = currDepartment?.instructors?.find(
        (instructor) => instructor.id === grade.by_instructor_id
      );
      const currStudent = currDepartment?.students?.find((student) => student.id === grade.student_id);
      const currSubject = currDepartment?.subjects?.find((subject) => subject.id === grade.subject_id);

      function tinhPhanTram(soNhan: number, tong: number) {
        return (soNhan * tong) / 100;
      }

      switch (columnKey) {
        case "avg_score":
          return (
            tinhPhanTram(grade.process_score, currSubject?.process_percentage ?? 100) +
            tinhPhanTram(grade.midterm_score, currSubject?.midterm_percentage ?? 100) +
            tinhPhanTram(grade.final_score, currSubject?.final_percentage ?? 100)
          ).toFixed(2);
        case "subject_name":
          return `${currSubject?.name}`;
        case "student_name":
          return `
              ${currStudent?.first_name} ${currStudent?.last_name}`;
        case "instructor_name":
          return `${currInstructor?.first_name} ${currInstructor?.last_name}`;
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
                      setModalData<EditGradeModalData>({
                        department: currDepartment,
                        instructor: currInstructor,
                        student: currStudent,
                        subject: currSubject,
                        grade,
                      });
                      modalOpen(editGradeModalKey);
                    }}>
                    Chỉnh sửa
                  </DropdownItem>
                  <DropdownItem
                    aria-label="Xoá"
                    startContent={
                      <MdOutlineDelete className="text-xl lg:text-2xl text-danger cursor-pointer active:opacity-50 hover:text-gray-400" />
                    }
                    onClick={() => {
                      setModalData(grade);
                      modalOpen(deleteGradeModalKey);
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
            isDisabled={gradesIsLoading}
            className="xl:w-[45%]"
            placeholder={`Tìm kiếm theo tên ${searchBy}...`}
            variant="underlined"
            color="secondary"
            startContent={
              <Select
                labelPlacement="outside"
                startContent={<IoSearchOutline size={24} className="text-secondary" />}
                defaultSelectedKeys={["môn học"]}
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
                <SelectItem key="môn học">Tên môn học</SelectItem>
                <SelectItem key="sinh viên">Tên sinh viên</SelectItem>
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
                  disabled={gradesIsLoading}
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
              onPress={() => modalOpen(addGradeModalKey)}
              color="secondary"
              variant="shadow"
              className="text-sm md:text-base col-span-full xl:col-span-1"
              endContent={<FaPlus />}
              isLoading={gradesQuery.isPending}>
              Thêm điểm mới
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Có <span className="font-bold text-secondary">{gradesQuery.data.length}</span> điểm
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
    gradesIsLoading,
    searchBy,
    searchValue,
    filterValue,
    departmentsQuery.data,
    handleFilter,
    visibleColumns,
    gradesQuery.isPending,
    gradesQuery.data.length,
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
              <span className="font-bold">tất cả</span> các điểm
            </span>
          </Button>
        )}
        {selectedKeys !== "all" && selectedKeys.size > 0 && (
          <Button startContent={<MdOutlineDelete size={24} />} color="danger" variant="flat">
            <span>
              <span className="font-bold">{`${selectedKeys.size}/${filteredItems.length}`}</span> điểm đã chọn
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
              emptyContent={"Không tìm thấy điểm nào"}
              loadingContent={<Spinner label="Loading..." color="secondary" size="md" />}
              isLoading={gradesIsLoading}
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
      {modelKey === addGradeModalKey && <AddGradeModal key={addGradeModalKey} />}
      {modelKey === editGradeModalKey && <EditGradeModal key={editGradeModalKey} />}
      {modelKey === deleteGradeModalKey && <DeleteGradeModal key={deleteGradeModalKey} />}
    </>
  );
}
