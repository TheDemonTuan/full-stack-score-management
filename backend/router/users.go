package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func usersRouter(r fiber.Router) {
	usersRoute := r.Group("users")

	usersRoute.Add("GET", "me", controllers.UserMe)
}
