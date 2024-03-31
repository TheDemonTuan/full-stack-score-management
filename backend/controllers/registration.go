package controllers

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"net/url"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
)

// [GET] /api/registrations
func RegistrationGetAll(c *fiber.Ctx) error {
	var registrations []entity.StudentRegistration

	if err := common.DBConn.Find(&registrations).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		registrations))
}

// [GET] /api/registrations/student/:name
func RegistrationGetAllStudentByFullName(c *fiber.Ctx) error {
	studentNameRaw := c.Params("name")
	studentName, err := url.QueryUnescape(studentNameRaw)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Tên sinh viên không hợp lệ")
	}

	var studentsId []string

	if err := common.DBConn.Model(&entity.Student{}).Select("id").Where("LOWER(CONCAT(first_name,' ',last_name)) LIKE LOWER(?)", "%"+studentName+"%").Find(&studentsId).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var registrations []entity.StudentRegistration
	if err := common.DBConn.Where("student_id IN ?", studentsId).Find(&registrations).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		registrations))
}

// [GET] /api/registrations/department/:id
func RegistrationGetAllByDepartmentId(c *fiber.Ctx) error {
	departmentId := c.Params("id")

	var subjectsId []string

	if err := common.DBConn.Model(&entity.Subject{}).Select("id").Where("department_id = ?", departmentId).Find(&subjectsId).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var registrations []entity.StudentRegistration
	if err := common.DBConn.Where("subject_id IN ?", subjectsId).Find(&registrations).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		registrations))
}

// [POST] /api/registrations
func RegistrationCreate(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.RegistrationCreate](c)
	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var subject entity.Subject
	if err := common.DBConn.First(&subject, "id = ?", bodyData.SubjectID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var student entity.Student
	if err := common.DBConn.First(&student, "id = ?", bodyData.StudentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy sinh viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if student.DepartmentID != subject.DepartmentID {
		return fiber.NewError(fiber.StatusBadRequest, "Sinh viên không thuộc khoa của môn học")
	}

	var registration entity.StudentRegistration
	if err := common.DBConn.First(&registration, "subject_id = ? AND student_id = ?", subject.ID, student.ID).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	if registration.ID != 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Sinh viên đã đăng ký môn học này")
	}

	newRegistration := entity.StudentRegistration{
		SubjectID: bodyData.SubjectID,
		StudentID: bodyData.StudentID,
	}

	if err := common.DBConn.Create(&newRegistration).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi đăng ký môn học")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", newRegistration))
}

// [PUT] /api/registrations/:id
func RegistrationUpdateById(c *fiber.Ctx) error {
	registrationId := c.Params("id")

	bodyData, err := common.Validator[req.RegistrationUpdateById](c)
	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var registration entity.StudentRegistration
	if err := common.DBConn.First(&registration, "id = ?", registrationId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy đăng ký")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var subject entity.Subject
	if err := common.DBConn.First(&subject, "id = ?", bodyData.SubjectID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy môn học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var student entity.Student
	if err := common.DBConn.First(&student, "id = ?", bodyData.StudentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy sinh viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if student.DepartmentID != subject.DepartmentID {
		return fiber.NewError(fiber.StatusBadRequest, "Sinh viên không thuộc khoa của môn học")
	}

	var existRegistration entity.StudentRegistration
	if err := common.DBConn.First(&existRegistration, "subject_id = ? AND student_id = ?", subject.ID, student.ID).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	if existRegistration.ID != 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Sinh viên đã được phân công môn học này")
	}

	registration.SubjectID = subject.ID
	registration.StudentID = student.ID

	if err := common.DBConn.Save(&registration).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi cập nhật đăng ký")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", registration))
}

// [DELETE] /api/registrations/:id
func RegistrationDeleteById(c *fiber.Ctx) error {
	registrationId := c.Params("id")

	var registration entity.StudentRegistration
	if err := common.DBConn.First(&registration, "id = ?", registrationId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy đăng ký")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if err := common.DBConn.Delete(&registration).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa đăng ký")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}
