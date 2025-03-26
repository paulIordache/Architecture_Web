package handlers

import (
	"backend/db"
	"backend/models"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetProjectsByUser(c *gin.Context) {
	// get username from middleware
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// query to fetch projects of the user
	rows, err := db.DB.Query(`
		SELECT p.id, p.user_id, p.name, p.description, p.room_layout_id
		FROM projects p
		JOIN users u ON p.user_id = u.id
		WHERE u.username = $1
	`, username)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var project models.Project
		if err := rows.Scan(&project.ID, &project.User, &project.Name, &project.Description, &project.Room); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		projects = append(projects, project)
	}

	// Return the list of projects
	c.JSON(http.StatusOK, projects)
}
