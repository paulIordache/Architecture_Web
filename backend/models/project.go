package models

type Project struct {
	ID          int    `json:"id"`
	User        string `json:"user_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Room        string `json:"room_layout_id"`
}
