package routes

import (
	"backend/handlers"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/users", handlers.GetUsers)
		api.GET("/rooms", handlers.GetRooms)
		api.GET("/assets/:id", handlers.GetAssetByID)

		// New routes for user and registration and login
		api.POST("/register", handlers.RegisterHandler)
		api.POST("/login", handlers.LoginHandler)
	}
}
