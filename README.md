# Video Processing Pipeline

A production-ready batch file processing system built with Node.js, Express, PostgreSQL, Redis, and FFmpeg.

## Features
- **Video Upload**: Multi-part upload with validation.
- **Job Queue**: Reliable background processing using BullMQ and Redis.
- **Frame Extraction**: Automated frame extraction using FFmpeg.
- **ZIP Compression**: Results are automatically zipped for easy download.
- **Status API**: Poll for job progress and state.
- **Clean Architecture**: Modular structure following MVC and Service patterns.

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Redis with BullMQ
- **Processing**: FFmpeg
- **Archiver**: Filesystem zipping

## Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Running instance)
- **Redis** (Running instance)
- **FFmpeg** (Installed and available in PATH)

## Installation

1. **Clone the repository** (or copy files).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Setup environment variables**:
   Copy `.env.example` to `.env` and update the values.
   ```bash
   cp .env.example .env
   ```
4. **Setup Database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Running the Application

### Development
Start the API server with hot-reload:
```bash
npm run dev
```

Start the Worker process:
```bash
npm run worker
```

### Production
Start the API server:
```bash
npm run start
```

## API Documentation

### 1. Upload Video
- **Endpoint**: `POST /api/upload`
- **Body**: `video` (file, multipart/form-data)
- **Response**: `201 Created` with `jobId`.

### 2. Check Status
- **Endpoint**: `GET /api/status/:jobId`
- **Response**: Current status (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).

### 3. Download Results
- **Endpoint**: `GET /api/download/:jobId`
- **Response**: ZIP file (if job is completed).

### 4. Health Check
- **Endpoint**: `GET /api/health`

## Deployment

### Render / Heroku / Railway
1. **Database**: Use their managed PostgreSQL and Redis services.
2. **Web Service**: Build command `npm install && npx prisma generate`, Start command `npm run start`.
3. **Worker Service**: Create a separate background worker instance, Start command `npm run worker`.
4. **Environment Variables**: Add all variables from `.env` to the platform's dashboard.
5. **FFmpeg**: Most modern platforms (like Render or Heroku) support FFmpeg via buildpacks or pre-installed environments. Ensure it's available.

## License
MIT
