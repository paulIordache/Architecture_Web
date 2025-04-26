package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		// Public routes
		api.POST("/register", handlers.RegisterHandler)
		api.POST("/login", handlers.LoginHandler)

		// Protected routes: first attach the middleware...
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.GET("/users", handlers.GetUsers)
			protected.GET("/projects/:username", handlers.GetProjectsByUser)
			protected.GET("/projects_id/:id", handlers.GetProjectByID) // <-- New route for fetching a project by ID
			protected.POST("/projects", handlers.CreateProject)
			protected.GET("/users/projects/:projectId/furniture", handlers.GetPlacedFurnitureByProject)
		}

		api.GET("/rooms", handlers.GetAllRooms)
		api.GET("/rooms/:id", handlers.GetRoomByID)
		api.GET("/assets/:id", handlers.GetAssetByID)
	}
}
