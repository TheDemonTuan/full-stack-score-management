package controllers

import (
	"errors"
	"fmt"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"math"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
	"strconv"
	"strings"
	"sync"
)

func generateClassID(departmentID uint) string {
	const maxLength = 10
	const idPrefix = "LH"
	departmentCode := strconv.Itoa(int(departmentID))

	return idPrefix + departmentCode + common.GenerateRandNum(maxLength-len(idPrefix)-len(departmentCode))
}

// [GET] /api/classes
func ClassGetAll(c *fiber.Ctx) error {
	var classes []entity.Class

	if err := common.DBConn.Preload("Students").Find(&classes).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		classes))
}

// [GET] /api/classes/:id
func ClassGetById(c *fiber.Ctx) error {
	classId := c.Params("id")
	var class entity.Class

	if err := common.DBConn.Preload("Students").First(&class, "id = ?", classId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy lớp học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", class))
}

// [GET] /api/classes/department/:departmentID
func GetClassesByDepartmentID(c *fiber.Ctx) error {
	departmentID := c.Params("departmentID")
	var classes []entity.Class

	if err := common.DBConn.Preload("Students").Find(&classes, "department_id = ?", departmentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy lớp học")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", classes))
}

// [POST] /api/classes
func ClassCreate(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.ClassCreate](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var department entity.Department

	if err := common.DBConn.Select("symbol").First(&department, "id = ?", bodyData.DepartmentID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	//Logic
	acdYear := strconv.Itoa(bodyData.AcademicYear % 100)
	findStr := "D" + acdYear + "%"

	var classes entity.Class
	if err := common.DBConn.Order("name desc").Last(&classes, "name like ?", findStr).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	startLopStr := "00"
	if classes.ID != "" {
		startLopStr = classes.Name[len(classes.Name)-2:]
	}

	startLop, startLopErr := strconv.Atoi(startLopStr)
	if startLopErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi tạo lớp")
	}

	if startLop > 99 {
		return fiber.NewError(fiber.StatusBadRequest, "Số lớp đã vượt quá giới hạn")
	}

	maxLopCount := int(math.Min(float64(startLop+bodyData.NumberClass), 99))

	createLop := func(i int, wg *sync.WaitGroup, chErr chan error) {
		defer wg.Done()
		var classNumber string

		if i < 10 {
			classNumber = "0" + strconv.Itoa(i)
		} else {
			classNumber = strconv.Itoa(i)
		}

		newClass := entity.Class{
			ID:           generateClassID(bodyData.DepartmentID),
			Name:         "D" + acdYear + "_" + strings.ToUpper(department.Symbol) + classNumber,
			AcademicYear: bodyData.AcademicYear,
			MaxStudents:  bodyData.MaxStudents,
			DepartmentID: bodyData.DepartmentID,
		}

		if err := common.DBConn.Omit("host_instructor_id").Create(&newClass).Error; err != nil {
			chErr <- err
			return
		}
	}
	var wg sync.WaitGroup
	chErr := make(chan error)

	for i := startLop + 1; i <= maxLopCount; i++ {
		wg.Add(1)
		go createLop(i, &wg, chErr)
	}
	// Goroutine để đợi tất cả các Goroutines khác hoàn thành
	go func() {
		wg.Wait()
		close(chErr)
	}()
	// Xử lý lỗi từ các Goroutines
	for err := range chErr {
		return fiber.NewError(fiber.StatusInternalServerError, fmt.Sprintf("Lỗi khi tạo lớp: %v", err))
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [PUT] /api/classes/:id
func ClassUpdateById(c *fiber.Ctx) error {
	classId := c.Params("id")
	bodyData, err := common.Validator[req.ClassUpdateById](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var class entity.Class
	if err := common.DBConn.Preload("Students").First(&class, "id = ?", classId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy lớp")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	var instructor entity.Instructor
	if err := common.DBConn.First(&instructor, "id = ?", bodyData.HostInstructorID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy giảng viên")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if class.DepartmentID != instructor.DepartmentID {
		return fiber.NewError(fiber.StatusBadRequest, "Giảng viên không thuộc khoa của lớp")
	}

	if len(class.Students) > bodyData.MaxStudents {
		return fiber.NewError(fiber.StatusBadRequest, "Số lượng sinh viên hiện tại lớn hơn số lượng sinh viên tối đa")
	}

	class.MaxStudents = bodyData.MaxStudents
	class.HostInstructorID = bodyData.HostInstructorID

	if err := common.DBConn.Save(&class).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi cập nhật lớp")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", class))
}

// [DELETE] /api/classes/:id
func ClassDeleteById(c *fiber.Ctx) error {
	classId := c.Params("id")
	var class entity.Class

	if err := common.DBConn.First(&class, "id = ?", classId).Error; err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy lớp")
	}

	if err := common.DBConn.Delete(&class).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa lớp")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/classes
func ClassDeleteAll(c *fiber.Ctx) error {
	if err := common.DBConn.Where("1 = 1").Delete(&entity.Class{}).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa tất cả lớp")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/classes/list
func ClassDeleteByListId(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.ClassDeleteByListId](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := common.DBConn.Where("id IN ?", bodyData.ListId).Delete(&entity.Class{}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy lớp")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa nhiều lớp")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}
