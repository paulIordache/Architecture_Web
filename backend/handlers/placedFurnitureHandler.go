package handlers

import (
	"backend/db"
	"backend/models"
	"database/sql"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func GetPlacedFurnitureByProject(c *gin.Context) {
	projectIDStr := c.Param("projectId")
	projectID, err := strconv.Atoi(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid project ID"})
		return
	}

	query := `
		SELECT 
			pf.id, pf.project_id, pf.furniture_id, pf.x, pf.y, pf.z,
			f.id, f.name, f.obj_file_path, f.texture_path, f.thumbnail_path
		FROM "PlacedFurniture" pf
		JOIN furniture f ON pf.furniture_id = f.id
		WHERE pf.project_id = $1
	`

	rows, err := db.DB.Query(query, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch furniture"})
		return
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {

		}
	}(rows)

	var placedFurnitureList []models.PlacedFurniture
	for rows.Next() {
		var pf models.PlacedFurniture
		err := rows.Scan(
			&pf.ID, &pf.ProjectID, &pf.FurnitureID,
			&pf.X, &pf.Y, &pf.Z,
			&pf.Furniture.ID, &pf.Furniture.Name,
			&pf.Furniture.ObjFilePath, &pf.Furniture.TexturePath,
			&pf.Furniture.ThumbnailPath,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan furniture"})
			return
		}
		placedFurnitureList = append(placedFurnitureList, pf)
	}

	c.JSON(http.StatusOK, placedFurnitureList)
}
