package main

import (
	"errors"
	"fmt"
	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/etag"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"os"
	"qldiemsv/common"
	"qldiemsv/router"
)

func init() {
	common.LoadEnvVar()
	common.ConnectDB()
	folderPath := "static                    "

	// Check if the folder exists
	if _, err := os.Stat(folderPath); os.IsNotExist(err) {
		// Folder doesn't exist, create it
		err := os.MkdirAll(folderPath, 0755) // 0755 is the permission mode for the directory
		if err != nil {
			fmt.Println("Error creating folder:", err)
			return
		}
		fmt.Println("Folder created successfully")
	}
}

func main() {
	app := fiber.New(fiber.Config{
		JSONEncoder:       sonic.Marshal,
		JSONDecoder:       sonic.Unmarshal,
		CaseSensitive:     true,
		StrictRouting:     true,
		EnablePrintRoutes: false,
		ServerHeader:      "API Quan Ly Diem Sinh Vien",
		AppName:           "API Quan Ly Diem Sinh Vien",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}
			return c.Status(code).JSON(common.NewResponse(
				code,
				err.Error(),
				nil))
		},
	})

	app.Use(helmet.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:  os.Getenv("CLIENT_URL"),
		ExposeHeaders: os.Getenv("JWT_HEADER"),
	}))
	app.Use(etag.New())
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed, // 1
	}))
	if os.Getenv("APP_ENV") == "development" {
		app.Use(logger.New())
	}
	//app.Use(encryptcookie.New(encryptcookie.Config{
	//	Key:    os.Getenv("COOKIE_SECRET"),
	//	Except: []string{os.Getenv("JWT_NAME")},
	//}))

	router.SetupRouter(app)
	err := app.Listen(":" + os.Getenv("PORT"))
	if err != nil {
		panic(err)
	}
}
