# 🎨 AI Image Generator & Dump Studio

A dedicated, high-performance microservice and visual studio exclusively designed for generating high-quality, professional, and optimized images from prompts and API requests, with a built-in **Image Dump & Curation** workflow.

---

## 🌟 Key Features

1. **100% Pure Image Generation Tool**:
   - Solely focused on synthesizing professional visual assets.
   - Independent service on port **`5000`** with its own Express runtime and SQLite database.
   - Fast, lightweight, zero compilation dependencies (`node:sqlite`).

2. **Automated Prompt Optimization**:
   - Enhances raw user prompts into studio-quality creative briefs.
   - Adds commercial softbox lighting, clean composition, and Hasselblad 8k depth of field.
   - Strictly enforces textless, watermark-free, and typography-free visuals.

3. **Centralized Image Dump & Review Section**:
   - **Full Image Dump Catalog**: Stores every visual output created by the tool.
   - **Approve & Reject Workflow**: Review and tag visuals with 1-click `✓ Approve` or `✕ Reject`.
   - **Filter Views**: Instantly toggle between `All Dump Images`, `✓ Approved`, `✕ Rejected`, and `⏳ Needs Review`.
   - **Purge Rejected**: 1-click cleanup to delete all rejected images and free local disk space.

4. **Multi-Ratio Support**:
   - **16:9 Landscape** (`1792x1024` / `1200x675`) for banners, hero graphics, and landscape covers.
   - **1:1 Square** (`1024x1024`) for avatars, profile visuals, and social media.
   - **9:16 Portrait** (`1024x1792`) for stories and mobile graphics.

5. **Multi-Tier Synthesizer**:
   - **OpenAI DALL-E 3**: Full photorealism when `OPENAI_API_KEY` is configured.
   - **Neural Vector Synthesizer**: Instant high-resolution fallback generator, guaranteeing fast output without blocking or crashing.
   - **Permanent Local Image Persistence**: Generated images are immediately downloaded and stored in `public/generated/<id>.png`, ensuring image URLs never expire.

---

## 🚀 Quick Start

### 1. Install & Configure
```bash
cd image-generator
npm install
```

Configure `.env` (optional for OpenAI key):
```env
PORT=5000
HOST=0.0.0.0
APP_URL=http://localhost:5000

# Optional: Add key for OpenAI DALL-E 3 photorealism
OPENAI_API_KEY=
OPENAI_MODEL=dall-e-3
```

### 2. Run the Service
```bash
npm start
```
Open **`http://localhost:5000`** in your browser to access the Image Generator Studio.

---

## 📡 REST API Reference

### 1. Generate Image (`POST /api/generate`)
Send an image prompt from any app, client, or microservice:
```http
POST http://localhost:5000/api/generate
Content-Type: application/json

{
  "prompt": "Modern luxury dental clinic with soft ambient lighting and clean glass equipment",
  "style": "Commercial Photography",
  "aspectRatio": "16:9"
}
```

### 2. Curate Image Status (`PATCH /api/images/:id/status`)
Approve, reject, or reset an image:
```http
PATCH http://localhost:5000/api/images/img_12345/status
Content-Type: application/json

{
  "status": "approved"   // "approved" | "rejected" | "pending"
}
```

### 3. Query Image Dump with Filters (`GET /api/images`)
```http
GET http://localhost:5000/api/images?status=approved
GET http://localhost:5000/api/images?status=rejected
GET http://localhost:5000/api/images?status=pending
GET http://localhost:5000/api/images?status=all
```

**Response:**
```json
{
  "success": true,
  "total": 12,
  "stats": {
    "all": 30,
    "approved": 12,
    "rejected": 5,
    "pending": 13
  },
  "images": [ ... ]
}
```

### 4. Purge Rejected Images (`POST /api/images/purge-rejected`)
Removes all rejected images from the database and deletes local files from disk:
```http
POST http://localhost:5000/api/images/purge-rejected
```

### 5. Health & Diagnostics (`GET /api/health`)
```http
GET http://localhost:5000/api/health
```

---

## 📂 Project Structure

```
image-generator/
├── .env
├── .env.example
├── package.json
├── README.md
├── public/
│   ├── index.html            # Image Studio & Dump Web Dashboard
│   └── generated/            # Permanent image files (.png / .svg)
└── src/
    ├── config.js             # Configuration
    ├── db.js                 # SQLite database & migrations
    ├── promptOptimizer.js    # AI prompt engineering
    ├── generatorService.js   # Image generation engine
    ├── server.js             # Express server (Port 5000)
    └── routes/
        └── imageRoutes.js    # /api/generate & Dump curation endpoints
```
