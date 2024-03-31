package controllers

import (
	"github.com/gofiber/fiber/v2"
)

func UserMe(c *fiber.Ctx) error {
	return c.SendString("UserMe")
}
