package entity

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	ID        uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	FirstName string `json:"first_name" gorm:"not null;size:50"`
	LastName  string `json:"last_name" gorm:"not null;size:50"`
	UserName  string `json:"username" gorm:"unique;not null;size:30"`
	Password  string `json:"-" gorm:"not null;size:255"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}
