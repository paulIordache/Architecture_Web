package models

type PlacedFurniture struct {
	ID          int       `json:"id"`
	ProjectID   int       `json:"project_id"`
	FurnitureID int       `json:"furniture_id"`
	X           float64   `json:"x"`
	Y           float64   `json:"y"`
	Z           float64   `json:"z"`
	Furniture   Furniture `json:"furniture"` // embedded Furniture details
}
