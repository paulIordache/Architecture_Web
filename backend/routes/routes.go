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
	}
}
