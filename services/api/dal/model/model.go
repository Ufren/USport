package model

import (
	"time"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Username  string    `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string    `json:"-" gorm:"size:255;not null"`
	Email     string    `json:"email" gorm:"uniqueIndex;size:100"`
	Phone     string    `json:"phone" gorm:"index;size:20"`
	Nickname  string    `json:"nickname" gorm:"size:50"`
	Avatar    string    `json:"avatar" gorm:"size:255"`
	Status    int       `json:"status" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (User) TableName() string {
	return "users"
}

type Venue struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Name        string    `json:"name" gorm:"size:100;not null"`
	Address     string    `json:"address" gorm:"size:255"`
	Description string    `json:"description" gorm:"type:text"`
	Image       string    `json:"image" gorm:"size:255"`
	Status      int       `json:"status" gorm:"default:1"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Venue) TableName() string {
	return "venues"
}

type Activity struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Title       string    `json:"title" gorm:"size:100;not null"`
	Description string    `json:"description" gorm:"type:text"`
	Time        time.Time `json:"time" gorm:"not null"`
	VenueID     uint      `json:"venue_id" gorm:"index"`
	Venue       *Venue    `json:"venue,omitempty" gorm:"foreignKey:VenueID"`
	Status      int       `json:"status" gorm:"default:1"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Activity) TableName() string {
	return "activities"
}

type Booking struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index;not null"`
	User      *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	VenueID   uint      `json:"venue_id" gorm:"index;not null"`
	Venue     *Venue    `json:"venue,omitempty" gorm:"foreignKey:VenueID"`
	BookTime  time.Time `json:"book_time" gorm:"not null"`
	Status    int       `json:"status" gorm:"default:1"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (Booking) TableName() string {
	return "bookings"
}
