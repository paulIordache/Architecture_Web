package models

type Project struct {
	ID          int    `json:"id"`
	User        int    `json:"user_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Room        int    `json:"room_layout_id"`
}
