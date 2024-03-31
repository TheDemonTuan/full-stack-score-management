package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/monitor"
	"qldiemsv/middleware"
)

func SetupRouter(app *fiber.App) {
	publicAPIRoute := app.Group("api")
	publicAPIRoute.Add("GET", "metrics", monitor.New(monitor.Config{Title: "Quan Ly Diem Sinh Vien Metrics"}))
	authRouter(publicAPIRoute)

	privateAPIRoute := app.Group("api", middleware.Protected())
	usersRouter(privateAPIRoute)
	departmentsRouter(privateAPIRoute)
	subjectsRouter(privateAPIRoute)
	classesRouter(privateAPIRoute)
	instructorsRouter(privateAPIRoute)
	studentsRouter(privateAPIRoute)
	gradesRouter(privateAPIRoute)
	assignmentsRouter(privateAPIRoute)
	registrationsRouter(privateAPIRoute)
}
