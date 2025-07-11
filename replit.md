# Globe Travel Tracker

## Overview
A dynamic 3D globe web application that visualizes personal global travel history with advanced geospatial interactions and responsive mobile design. The platform transforms journey data into immersive visual narratives with personalized storytelling features.

## Key Technologies
- React TypeScript frontend with Vite
- Express.js backend with session management
- Globe.gl for 3D globe rendering
- Drizzle ORM with PostgreSQL (Neon)
- Three.js for advanced lighting and rendering
- Mobile-first responsive design

## Project Architecture
- **Frontend**: React with TypeScript, using Wouter for routing
- **Backend**: Express.js with RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **3D Visualization**: Globe.gl with Three.js
- **Data Source**: Cloudflare R2 bucket (S3 compatible)

## Recent Changes
**January 2025**
- ✅ Migrated from filesystem CSV to Cloudflare R2 bucket storage
- ✅ Added FLIGHTY_EXPORT_FILE_NAME environment variable for private file access
- ✅ Removed flight upload/import UI and backend endpoints
- ✅ Updated flight data fetching to use https://static.sergei.com/{FLIGHTY_EXPORT_FILE_NAME}
- ✅ Removed attached_assets directory and added to .gitignore
- ✅ Uninstalled multer dependency (no longer needed)
- ✅ Fixed mobile stats bar visibility with proper z-index and positioning
- ✅ Centered navigation buttons in bottom right panel for better alignment
- ✅ Removed unused airport-data-old.ts file

## Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `FLIGHTY_EXPORT_FILE_NAME`: Private filename for flight data CSV in R2 bucket
- `ADMIN_DASHBOARD_PASSWORD`: Admin authentication password

## Data Sources
- Flight data: Cloudflare R2 bucket at https://static.sergei.com/
- Location data: PostgreSQL database via Drizzle ORM
- Settings: Database-stored configuration

## User Preferences
- Prefers clean, functional UI without unnecessary clutter
- Values responsive mobile design
- Wants private data handling (environment variables for sensitive info)
- Prefers cloud-based data storage over local filesystem

## Development Notes
- Uses Neon PostgreSQL for production database
- Auto-imports flight data on server startup
- Flight data managed externally via Cloudflare dashboard
- Mobile-first design with fixed positioning for UI elements