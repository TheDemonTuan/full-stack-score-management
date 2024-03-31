package controllers

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
)

// [GET] /api/departments
func DepartmentGetAll(c *fiber.Ctx) error {
	var departments []entity.Department

	if err := common.DBConn.Preload("Instructors").Preload("Subjects").Preload("Classes").Preload("Students").Find(&departments).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		departments))
}

// [POST] /api/departments
func DepartmentCreate(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.DepartmentCreate](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var department entity.Department

	if err := common.DBConn.Select("id").First(&department, "id = ? or symbol = ?", bodyData.ID, bodyData.Symbol).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Lỗi khi truy vấn cơ sở dữ liệu")
		}
	}

	if department.ID != 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Mã khoa hoặc ký hiệu đã tồn tại")
	}

	newDepartment := entity.Department{
		ID:     bodyData.ID,
		Symbol: bodyData.Symbol,
		Name:   bodyData.Name,
	}

	if err := common.DBConn.Create(&newDepartment).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi tạo khoa")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", newDepartment))
}

// [GET] /api/departments/:id
func DepartmentGetById(c *fiber.Ctx) error {
	departmentId := c.Params("id")

	var department entity.Department

	if err := common.DBConn.Preload("Instructors").
		Preload("Subjects").Preload("Classes").Preload("Students").
		First(&department, "id = ?", departmentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", department))
}

// [PUT] /api/departments/:id
func DepartmentUpdateById(c *fiber.Ctx) error {
	departmentId := c.Params("id")

	bodyData, err := common.Validator[req.DepartmentUpdateById](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var department entity.Department

	if err := common.DBConn.First(&department, "id = ?", departmentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	department.Name = bodyData.Name

	if err := common.DBConn.Save(&department).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi cập nhật khoa")
	}
	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", department))
}

// [DELETE] /api/departments/:id
func DepartmentDeleteById(c *fiber.Ctx) error {
	departmentId := c.Params("id")

	var department entity.Department

	if err := common.DBConn.First(&department, "id = ?", departmentId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi truy vấn cơ sở dữ liệu")
	}

	if err := common.DBConn.Delete(&department).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa khoa")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/departments/list
func DepartmentDeleteByListId(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.DepartmentDeleteByListId](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	if err := common.DBConn.Where("id IN ?", bodyData.ListId).Delete(&entity.Department{}).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Không tìm thấy khoa")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa nhiều khoa")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}

// [DELETE] /api/departments
func DepartmentDeleteAll(c *fiber.Ctx) error {
	if err := common.DBConn.Where("1 = 1").Delete(&entity.Department{}).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Lỗi khi xóa tất cả khoa")
	}

	return c.JSON(common.NewResponse(fiber.StatusOK, "Success", nil))
}
