package controllers

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
	"strconv"
	"time"
)

func generateStudentId(departmentID uint, acdYear int) string {
	const maxLength = 10
	const idPrefix = "SV"
	departmentCode := strconv.Itoa(int(departmentID))
	acdYearStr := strconv.Itoa(acdYear % 100)

	return idPrefix + departmentCode + acdYearStr + common.GenerateRandNum(maxLength-len(idPrefix)-len(departmentCode)-len(acdYearStr))
}

// [GET] /api/students
func StudentGetAll(c *fiber.Ctx) error {
	var students []entity.Student

	if err := common.DBConn.Preload("Grades").Preload("Registrations").Find(&students).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		students))
}

// [GET] /api/students/:id
func StudentGetById(c *fiber.Ctx) error {
	studentId := c.Params("id")
	var student entity.Student

	if err := common.DBConn.Preload("Grades").Preload("Registrations").First(&student, "id = ?", studentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy sinh viên")
		}
		return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", student))
}

// [POST] /api/students
func StudentCreate(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.StudentCreate](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	today := time.Now()
	if bodyData.BirthDay.After(today) {
		return fiber.NewError(fiber.StatusBadRequest, "Ngày sinh không hợp lệ")
	}

	if bodyData.AcademicYear > today.Year() {
		return fiber.NewError(fiber.StatusBadRequest, "Năm học không hợp lệ")
	}

	var department entity.Department
	if err := common.DBConn.Select("id").First(&department, "id = ?", bodyData.DepartmentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var class entity.Class
	if err := common.DBConn.Preload("Students").First(&class, "id = ?", bodyData.ClassID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy lớp")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if class.HostInstructorID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Lớp chưa có giảng viên chủ nhiệm")
	}

	if len(class.Students) >= class.MaxStudents {
		return fiber.NewError(fiber.StatusBadRequest, "Lớp đã đủ số lượng sinh viên")
	}

	if class.DepartmentID != bodyData.DepartmentID {
		return fiber.NewError(fiber.StatusBadRequest, "Khoa của lớp không trùng với khoa của sinh viên")
	}

	if class.AcademicYear != bodyData.AcademicYear {
		return fiber.NewError(fiber.StatusBadRequest, "Khoá học của lớp không trùng với khoá học của sinh viên")
	}

	var student entity.Student
	if err := common.DBConn.First(&student, "email = ? or phone = ?", bodyData.Email, bodyData.Phone).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	if student.ID != "" {
		return fiber.NewError(fiber.StatusBadRequest, "Email hoặc số điện thoại đã tồn tại")
	}

	newStudent := entity.Student{
		ID:           generateStudentId(bodyData.DepartmentID, bodyData.AcademicYear),
		FirstName:    bodyData.FirstName,
		LastName:     bodyData.LastName,
		Email:        bodyData.Email,
		Address:      bodyData.Address,
		BirthDay:     bodyData.BirthDay,
		Phone:        bodyData.Phone,
		Gender:       bodyData.Gender,
		AcademicYear: bodyData.AcademicYear,
		ClassID:      bodyData.ClassID,
		DepartmentID: bodyData.DepartmentID,
	}

	if err := common.DBConn.Create(&newStudent).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi tạo sinh viên")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", newStudent))
}

// [PUT] /api/students/:id
func StudentUpdateById(c *fiber.Ctx) error {
	studentId := c.Params("id")
	bodyData, err := common.Validator[req.StudentUpdateById](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	//Logic check
	var student entity.Student
	if err := common.DBConn.First(&student, "id = ?", studentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy sinh viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	today := time.Now()
	if bodyData.BirthDay.After(today) {
		return fiber.NewError(fiber.StatusBadRequest, "Ngày sinh không hợp lệ")
	}

	if student.AcademicYear > today.Year() {
		return fiber.NewError(fiber.StatusBadRequest, "Năm học không hợp lệ")
	}

	var class entity.Class
	if err := common.DBConn.Preload("Students").First(&class, "id = ?", bodyData.ClassID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy lớp")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if class.HostInstructorID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Lớp chưa có giảng viên chủ nhiệm")
	}

	if len(class.Students) >= class.MaxStudents {
		return fiber.NewError(fiber.StatusBadRequest, "Lớp đã đủ số lượng sinh viên")
	}

	if class.DepartmentID != student.DepartmentID {
		return fiber.NewError(fiber.StatusBadRequest, "Khoa của lớp không trùng với khoa của sinh viên")
	}

	if class.AcademicYear != student.AcademicYear {
		return fiber.NewError(fiber.StatusBadRequest, "Khoá học của lớp không trùng với khoá học của sinh viên")
	}

	var existStudent entity.Student
	if err := common.DBConn.First(&existStudent, "id <> ? and (email = ? or phone = ?)", student.ID, bodyData.Email, bodyData.Phone).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}
	if existStudent.ID != "" {
		return fiber.NewError(fiber.StatusBadRequest, "Email hoặc số điện thoại đã tồn tại")
	}
	//End logic check

	student.FirstName = bodyData.FirstName
	student.LastName = bodyData.LastName
	student.Email = bodyData.Email
	student.Address = bodyData.Address
	student.BirthDay = bodyData.BirthDay
	student.Phone = bodyData.Phone
	student.Gender = bodyData.Gender
	student.ClassID = bodyData.ClassID

	if err := common.DBConn.Save(&student).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi cập nhật sinh viên")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", student))
}

// [DELETE] /api/student/:id
func StudentDeleteById(c *fiber.Ctx) error {
	id := c.Params("id")
	var student entity.Student

	if err := common.DBConn.First(&student, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy sinh viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if err := common.DBConn.Delete(&student).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa sinh viên")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/students/list
func StudentDeleteByListId(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.StudentDeleteByListId](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := common.DBConn.Where("id IN ?", bodyData.ListId).Delete(&entity.Student{}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy sinh viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa nhiều sinh viên")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/students
func StudentDeleteAll(c *fiber.Ctx) error {
	if err := common.DBConn.Where("1 = 1").Delete(&entity.Student{}).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa tất cả sinh viên")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [GET] /api/students/departments/:departmentID
func GetStudentsByDepartmentID(c *fiber.Ctx) error {
	departmentID := c.Params("departmentID")
	var students []entity.Student

	if err := common.DBConn.Preload("Grades").Find(&students, "department_id = ?", departmentID).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", students))
}
