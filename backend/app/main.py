"""FastAPI Application - Main Entry Point"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.database import init_db, close_db
from app.core.rate_limiter import limiter
from app.middleware.logging import LoggingMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.api.v1.router import router as v1_router
from loguru import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting up application...")
    setup_logging()
    
    # You can uncomment this to create tables on startup (not recommended for production)
    # await init_db()
    # logger.info("Database initialized")
    
    logger.info(f"Application started - Environment: {settings.ENVIRONMENT}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application...")
    await close_db()
    logger.info("Application shutdown complete")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade FastAPI boilerplate with PostgreSQL, Redis, rate limiting, and comprehensive monitoring",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(LoggingMiddleware)
app.add_middleware(ErrorHandlerMiddleware)

# Include API routers with versioning
app.include_router(
    v1_router,
    prefix=settings.API_V1_PREFIX,
)

# Add more API versions here as needed
# app.include_router(v2_router, prefix="/api/v2")


# Health check endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    
    Returns application health status
    """
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "status": "healthy",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }
    )


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint
    
    Returns API information
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


# Custom OpenAPI schema customization
def custom_openapi():
    """Customize OpenAPI schema"""
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    
    openapi_schema = get_openapi(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="""
        ## Production-Grade FastAPI Boilerplate
        
        This API provides a complete production-ready backend with:
        
        - **Authentication**: JWT-based authentication with access and refresh tokens
        - **Rate Limiting**: Redis-based rate limiting to prevent abuse
        - **Database**: PostgreSQL with SQLAlchemy ORM and Alembic migrations
        - **Validation**: Pydantic models for request/response validation
        - **Logging**: Structured logging with request tracking
        - **Monitoring**: Health check endpoints and performance metrics
        - **API Versioning**: Organized endpoints with version prefixes
        
        ### Authentication
        
        Most endpoints require authentication. To authenticate:
        
        1. Register a new account at `/api/v1/auth/register`
        2. Login at `/api/v1/auth/login` to receive tokens
        3. Use the access token in the `Authorization` header: `Bearer <token>`
        4. Refresh tokens when they expire using `/api/v1/auth/refresh`
        
        ### Rate Limiting
        
        API endpoints have different rate limits based on their resource intensity:
        
        - **Authentication**: 5 requests/minute, 20 requests/hour
        - **Standard**: 30-60 requests/minute, 500-1000 requests/hour
        
        """,
        routes=app.routes,
    )
    
    # Add security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else settings.WORKERS,
        log_level=settings.LOG_LEVEL.lower(),
    )
