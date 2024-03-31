package entity

import (
	"time"
)

type Class struct {
	ID           string `json:"id" gorm:"primaryKey;size:25"`
	Name         string `json:"name" gorm:"not null;size:100;unique"`
	MaxStudents  int    `json:"max_students" gorm:"not null"`
	AcademicYear int    `json:"academic_year" gorm:"not null"`

	DepartmentID     uint   `json:"department_id" gorm:"not null;size:100;index"`
	HostInstructorID string `json:"host_instructor_id" gorm:"index"`

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	Students []Student `json:"students" gorm:"foreignKey:ClassID"`
}
