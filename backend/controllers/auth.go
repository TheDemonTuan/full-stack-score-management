package controllers

import (
	"errors"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"os"
	"qldiemsv/common"
	"qldiemsv/models/entity"
	"qldiemsv/models/req"
	"strconv"
	"time"
)

func createJWT(userId uint) (string, error) {
	// Create the Claims
	claims := jwt.MapClaims{
		"uid": strconv.Itoa(int(userId)),
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
	tokenSignedString, tokenSignedErr := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	if tokenSignedErr != nil {
		return "", errors.New("Có lỗi trong khi tạo token")
	}
	//Create cookie
	return tokenSignedString, nil
}

func AuthLogin(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.AuthLogin](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var userRecord entity.User

	if err := common.DBConn.First(&userRecord, "user_name = ?", bodyData.UserName).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusBadRequest, "Username không tồn tại")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Có lỗi trong khi truy vấn cơ sở dữ liệu")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userRecord.Password), []byte(bodyData.Password)); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Mật khẩu không đúng")
	}

	token, tokenIsErr := createJWT(userRecord.ID)

	if tokenIsErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, tokenIsErr.Error())
	}

	c.Set(os.Getenv("JWT_HEADER"), token)

	return c.Status(fiber.StatusOK).JSON(common.NewResponse(fiber.StatusOK, "Đăng nhập thành công", userRecord))
}

func AuthRegister(c *fiber.Ctx) error {
	bodyData, err := common.Validator[req.AuthRegister](c)

	if err != nil || bodyData == nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	var userRecord entity.User

	if err := common.DBConn.First(&userRecord, "user_name = ?", bodyData.UserName).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusInternalServerError, "Có lỗi trong khi truy vấn cơ sở dữ liệu")
		}
	}

	if userRecord != (entity.User{}) {
		return fiber.NewError(fiber.StatusBadRequest, "Username đã tồn tại")
	}

	hashPassword, hashPasswordErr := bcrypt.GenerateFromPassword([]byte(bodyData.Password), 11)

	if hashPasswordErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Có lỗi trong khi tạo tài khoản")
	}

	newUser := entity.User{
		FirstName: bodyData.FirstName,
		LastName:  bodyData.LastName,
		UserName:  bodyData.UserName,
		Password:  string(hashPassword),
	}

	if err := common.DBConn.Create(&newUser).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Có lỗi trong khi tạo tài khoản")
	}

	token, tokenIsErr := createJWT(newUser.ID)

	if tokenIsErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, tokenIsErr.Error())
	}

	c.Set(os.Getenv("JWT_HEADER"), token)

	return c.Status(fiber.StatusCreated).JSON(common.NewResponse(fiber.StatusOK, "Đăng ký thành công", newUser))
}

func AuthVerify(c *fiber.Ctx) error {
	currentUserId, currentUserIdIsOk := c.Locals("currentUserId").(string)

	if !currentUserIdIsOk {
		return fiber.NewError(fiber.StatusUnauthorized, "Unauthorized")
	}

	userRecord := entity.User{}

	if err := common.DBConn.First(&userRecord, "id = ?", currentUserId).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fiber.NewError(fiber.StatusUnauthorized, "Không tìm thấy user")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Có lỗi trong khi truy vấn cơ sở dữ liệu")
	}

	return c.JSON(common.NewResponse(
		fiber.StatusOK,
		"Success",
		userRecord),
	)
}
