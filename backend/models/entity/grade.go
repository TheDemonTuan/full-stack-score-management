package entity

import (
	"time"
)

type Grade struct {
	ID           uint    `json:"id" gorm:"primaryKey;autoIncrement"`
	ProcessScore float64 `json:"process_score"`
	MidtermScore float64 `json:"midterm_score"`
	FinalScore   float64 `json:"final_score"`

	SubjectID      string `json:"subject_id" gorm:"not null;size:25;index"`
	StudentID      string `json:"student_id" gorm:"not null;size:25;index"`
	ByInstructorID string `json:"by_instructor_id" gorm:"not null;size:25;index"`

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
