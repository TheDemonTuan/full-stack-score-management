package entity

import "time"

type StudentRegistration struct {
	ID        uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	SubjectID string `json:"subject_id" gorm:"not null;size:25;index"`
	StudentID string `json:"student_id" gorm:"not null;size:25;index"`

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
