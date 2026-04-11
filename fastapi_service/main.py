"""
InServiceHub FastAPI Service
Provides analytics, recommendations, and health-check endpoints.
Works alongside the Node.js (Express) server.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import aiosqlite

# ──── App Setup ────
app = FastAPI(
    title="InServiceHub API",
    description="FastAPI micro-service for analytics & recommendations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──── Database ────
# Path to the SQLite DB at the project root
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../inservicehub.db"))

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

# ──── Pydantic Models ────
class ProviderOut(BaseModel):
    id: int
    name: str
    city: Optional[str]
    is_online: bool
    service_category: Optional[str]
    experience: Optional[int]
    rating: Optional[float]
    total_reviews: Optional[int]
    verified: Optional[bool]


class CategoryStats(BaseModel):
    category: str
    provider_count: int
    avg_rating: float


class HealthResponse(BaseModel):
    status: str
    database: str
    version: str


# ──── Routes ────

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint."""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute("SELECT 1")
            db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return HealthResponse(status="ok", database=db_status, version="1.0.0")


@app.get("/api/categories", response_model=List[CategoryStats], tags=["Analytics"])
async def category_stats(db: aiosqlite.Connection = Depends(get_db)):
    """Return the number of providers and average rating per service category."""
    async with db.execute(
        """
        SELECT
            pd.service_category AS category,
            COUNT(*)        AS provider_count,
            ROUND(AVG(pd.rating), 2) AS avg_rating
        FROM provider_details pd
        WHERE pd.service_category IS NOT NULL
        GROUP BY pd.service_category
        ORDER BY provider_count DESC
        """
    ) as cursor:
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


@app.get("/api/providers/top", response_model=List[ProviderOut], tags=["Providers"])
async def top_providers(
    limit: int = 10,
    city: Optional[str] = None,
    category: Optional[str] = None,
    db: aiosqlite.Connection = Depends(get_db),
):
    """Return top-rated providers, optionally filtered by city or category."""
    query = """
        SELECT u.id, u.name, u.city, u.is_online,
               pd.service_category, pd.experience, pd.rating,
               pd.total_reviews, pd.verified
        FROM users u
        JOIN provider_details pd ON u.id = pd.user_id
        WHERE u.role = 'provider'
    """
    params = []
    
    if city:
        query += " AND u.city LIKE ?"
        params.append(f"%{city}%")
    if category:
        query += " AND pd.service_category LIKE ?"
        params.append(f"%{category}%")

    query += " ORDER BY pd.rating DESC LIMIT ?"
    params.append(limit)

    async with db.execute(query, params) as cursor:
        rows = await cursor.fetchall()
        # Convert 1/0 back to boolean if needed, though Pydantic might handle it
        results = []
        for r in rows:
            d = dict(r)
            d['is_online'] = bool(d['is_online'])
            d['verified'] = bool(d['verified'])
            results.append(d)
        return results


@app.get("/api/providers/{provider_id}", tags=["Providers"])
async def provider_detail(provider_id: int, db: aiosqlite.Connection = Depends(get_db)):
    """Get detailed provider information including services and reviews."""
    async with db.execute(
        """
        SELECT u.id, u.name, u.city, u.is_online,
               pd.service_category, pd.experience, pd.rating,
               pd.total_reviews, pd.verified, pd.description
        FROM users u
        JOIN provider_details pd ON u.id = pd.user_id
        WHERE u.id = ? AND u.role = 'provider'
        """,
        (provider_id,),
    ) as cursor:
        provider = await cursor.fetchone()

    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    provider_dict = dict(provider)
    provider_dict['is_online'] = bool(provider_dict['is_online'])
    provider_dict['verified'] = bool(provider_dict['verified'])

    async with db.execute(
        "SELECT id, service_name, category, price FROM services WHERE provider_id = ?",
        (provider_id,),
    ) as cursor:
        services = await cursor.fetchall()

    async with db.execute(
        """
        SELECT r.rating, r.comment, u.name AS reviewer_name
        FROM reviews r
        JOIN bookings b ON r.booking_id = b.id
        JOIN users u ON b.customer_id = u.id
        WHERE b.provider_id = ?
        """,
        (provider_id,),
    ) as cursor:
        reviews = await cursor.fetchall()

    return {
        **provider_dict,
        "services": [dict(s) for s in services],
        "reviews": [dict(r) for r in reviews],
    }


@app.get("/api/stats/dashboard", tags=["Analytics"])
async def dashboard_stats(db: aiosqlite.Connection = Depends(get_db)):
    """Platform-wide statistics for an admin dashboard."""
    async with db.execute("SELECT COUNT(*) FROM users WHERE role = 'provider'") as cursor:
        total_providers = (await cursor.fetchone())[0]

    async with db.execute("SELECT COUNT(*) FROM users WHERE role = 'customer'") as cursor:
        total_customers = (await cursor.fetchone())[0]
        
    async with db.execute("SELECT COUNT(*) FROM bookings") as cursor:
        total_bookings = (await cursor.fetchone())[0]
        
    async with db.execute("SELECT COUNT(*) FROM reviews") as cursor:
        total_reviews = (await cursor.fetchone())[0]
        
    async with db.execute("SELECT ROUND(AVG(rating), 2) FROM provider_details WHERE rating > 0") as cursor:
        row = await cursor.fetchone()
        avg_rating = row[0] if row else 0

    return {
        "total_providers": total_providers,
        "total_customers": total_customers,
        "total_bookings": total_bookings,
        "total_reviews": total_reviews,
        "avg_platform_rating": float(avg_rating) if avg_rating else 0,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
