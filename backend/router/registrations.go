package router

import (
	"github.com/gofiber/fiber/v2"
	"qldiemsv/controllers"
)

func registrationsRouter(r fiber.Router) {
	registrationsRoute := r.Group("registrations")

	registrationsRoute.Add("GET", "", controllers.RegistrationGetAll)
	registrationsRoute.Add("GET", "department/:id", controllers.RegistrationGetAllByDepartmentId)
	registrationsRoute.Add("GET", "student/:name", controllers.RegistrationGetAllStudentByFullName)
	registrationsRoute.Add("POST", "", controllers.RegistrationCreate)
	registrationsRoute.Add("PUT", ":id", controllers.RegistrationUpdateById)
	registrationsRoute.Add("DELETE", ":id", controllers.RegistrationDeleteById)
}
