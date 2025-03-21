package handlers

import (
	"backend/db"
	"backend/models"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetAssetByID(c *gin.Context) {
	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing asset ID"})
		return
	}

	var asset models.Asset
	err := db.DB.QueryRow("SELECT id, name, object, thumbnail FROM assets WHEREid = $1", id).
		Scan(&asset.ID, &asset.Name, &asset.Object, &asset.Thumbnail)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Asset Not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	c.JSON(http.StatusOK, asset)
}
