package models

type Furniture struct {
	ID       int    `json:"id"`
	RoomID   int    `json:"room_id"`
	Type     string `json:"type"`
	Position string `json:"position"`
}
