package entity

import (
	"time"
)

type Instructor struct {
	ID        string    `json:"id" gorm:"primaryKey;size:25"`
	FirstName string    `json:"first_name" gorm:"not null;size:50"`
	LastName  string    `json:"last_name" gorm:"not null;size:50"`
	Email     string    `json:"email" gorm:"not null;unique;size:100"`
	Address   string    `json:"address" gorm:"not null;size:100"`
	BirthDay  time.Time `json:"birth_day" gorm:"not null"`
	Phone     string    `json:"phone" gorm:"not null;unique;size:11"`
	Gender    bool      `json:"gender" gorm:"not null"`
	Degree    string    `json:"degree" gorm:"not null;size:50"`

	DepartmentID uint `json:"department_id" gorm:"not null;size:100;index"`

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	Classes     []Class                `json:"classes" gorm:"foreignKey:HostInstructorID"`
	Grades      []Grade                `json:"grades" gorm:"foreignKey:ByInstructorID"`
	Assignments []InstructorAssignment `json:"assignments" gorm:"foreignKey:InstructorID"`
}
