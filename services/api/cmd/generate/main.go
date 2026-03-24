//go:build tools

package main

import (
	"fmt"
	"log"

	"github.com/usport/usport-api/internal/config"
	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"
)

type TableConfig struct {
	TableName   string
	ModelName   string
	ExtraFields []FieldConfig
}

type FieldConfig struct {
	FieldName string
	FieldType string
	Tag       string
}

var tableConfigs = []TableConfig{
	{
		TableName: "users",
		ModelName: "User",
		ExtraFields: []FieldConfig{
			{FieldName: "Openid", FieldType: "string", Tag: `json:"openid" gorm:"uniqueIndex;size:100"`},
			{FieldName: "Unionid", FieldType: "string", Tag: `json:"unionid" gorm:"index;size:100"`},
		},
	},
	{
		TableName: "venues",
		ModelName: "Venue",
		ExtraFields: []FieldConfig{
			{FieldName: "Rating", FieldType: "float64", Tag: `json:"rating" gorm:"-"`},
			{FieldName: "Distance", FieldType: "float64", Tag: `json:"distance" gorm:"-"`},
		},
	},
	{
		TableName: "activities",
		ModelName: "Activity",
		ExtraFields: []FieldConfig{
			{FieldName: "ParticipantCount", FieldType: "int", Tag: `json:"participant_count" gorm:"-"`},
		},
	},
	{
		TableName: "bookings",
		ModelName: "Booking",
		ExtraFields: []FieldConfig{
			{FieldName: "VenueName", FieldType: "string", Tag: `json:"venue_name" gorm:"-"`},
			{FieldName: "UserName", FieldType: "string", Tag: `json:"user_name" gorm:"-"`},
		},
	},
}

func buildDSN(cfg *config.DBConfig) string {
	return fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name)
}

func main() {
	cfg := config.Load()

	dsn := buildDSN(&cfg.DB)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	g := gen.NewGenerator(gen.Config{
		OutPath:       "./dal",
		ModelPkgPath:  "model",
		WithUnitTest:  false,
		FieldSignable: true,
		JSONTagName:   "json",
	})

	g.UseDB(db)

	for _, tc := range tableConfigs {
		model := g.GenerateModelAs(tc.TableName, gen.ModelOpt{
			Name: tc.ModelName,
		})

		if len(tc.ExtraFields) > 0 {
			extraFieldDefs := make([]gen.Field, len(tc.ExtraFields))
			for i, ef := range tc.ExtraFields {
				extraFieldDefs[i] = gen.Field{
					Name: ef.FieldName,
					Type: ef.FieldType,
					Tag:  ef.Tag,
				}
			}
			model = g.GenerateModelAs(tc.TableName, gen.ModelOpt{
				Name:     tc.ModelName,
				FieldNew: extraFieldDefs,
			})
		}

		g.ApplyBasic(model)
	}

	g.Execute()

	fmt.Println("✅ code generation completed!")
	fmt.Println("📁 Generated files:")
	fmt.Println("   - dal/model/*.go")
	fmt.Println("   - dal/query/*.go")
	fmt.Println("")
	fmt.Println("💡 To add custom fields, update the ExtraFields in tableConfigs")
}
