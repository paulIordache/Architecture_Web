package handlers

import (
	"backend/db"
	"backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetFurniture handles the request to fetch furniture details
func GetFurniture(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, room_id, type, position FROM furniture")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var furniture []models.Furniture
	for rows.Next() {
		var item models.Furniture
		if err := rows.Scan(&item.ID, &item.RoomID, &item.Type, &item.Position); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		furniture = append(furniture, item)
	}

	c.JSON(http.StatusOK, furniture)
}
