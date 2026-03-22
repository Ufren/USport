package query

import (
	"gorm.io/gorm"
)

type Query struct {
	*gorm.DB
}

func NewQuery(db *gorm.DB) *Query {
	return &Query{DB: db}
}
