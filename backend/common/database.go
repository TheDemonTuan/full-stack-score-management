package common

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
)

var DBConn *gorm.DB

func ConnectDB() {
	gormConfig := &gorm.Config{
		PrepareStmt:            false,
		SkipDefaultTransaction: true,
	}

	if os.Getenv("APP_ENV") == "production" {
		gormConfig.Logger = logger.Default.LogMode(logger.Silent)
	}

	dbConn, err := gorm.Open(postgres.Open(os.Getenv("DB1_DSN")), gormConfig)

	if err != nil {
		panic("Database connection failed")
	}

	DBConn = dbConn
	defer runMigrate()
}

func runMigrate() {
	if os.Getenv("APP_ENV") == "development" {
		//Drop table
		//if err := DBConn.Migrator().DropTable(&entity.Department{}, &entity.Instructor{}, &entity.Subject{}, &entity.Student{}, &entity.Grade{}, &entity.Class{}, &entity.InstructorAssignment{}, &entity.StudentRegistration{}, &entity.User{}); err != nil {
		//	panic(err)
		//}
		//if err := DBConn.AutoMigrate(&entity.Department{}, &entity.Instructor{}, &entity.Subject{}, &entity.Student{}, &entity.Grade{}, &entity.Class{}, &entity.InstructorAssignment{}, &entity.StudentRegistration{}, &entity.User{}); err != nil {
		//	panic(err)
		//}
		log.Println("Success to migrate")
	}
}
