# 🎨 AI Image Generator

A dedicated, high-performance microservice and visual studio exclusively designed for generating high-quality, professional, and optimized images from prompts and API requests.

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

3. **Multi-Ratio Support**:
   - **16:9 Landscape** (`1792x1024` / `1200x675`) for banners, hero graphics, and landscape covers.
   - **1:1 Square** (`1024x1024`) for avatars, profile visuals, and social media.
   - **9:16 Portrait** (`1024x1792`) for stories and mobile graphics.

4. **Multi-Tier Synthesizer**:
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

**Response (201 Created):**
```json
{
  "success": true,
  "message": "High-quality image generated successfully",
  "image": {
    "id": "img_1794692266103_fsduevk",
    "url": "http://localhost:5000/generated/img_1794692266103_fsduevk.png",
    "width": 1792,
    "height": 1024,
    "aspectRatio": "16:9",
    "style": "Commercial Photography",
    "prompt": "High-end aesthetic visual of modern luxury dental clinic...",
    "provider": "openai",
    "model": "dall-e-3",
    "createdAt": "2026-11-15T03:07:46.104Z"
  }
}
```

---

### 2. Health & Diagnostics (`GET /api/health`)
```http
GET http://localhost:5000/api/health
```

---

### 3. Image Catalog (`GET /api/images`)
```http
GET http://localhost:5000/api/images
```
Returns a list of all locally created and stored visual assets with their URLs and prompts.

---

## 📂 Project Structure

```
image-generator/
├── .env
├── .env.example
├── package.json
├── README.md
├── public/
│   ├── index.html            # Image Studio Web Dashboard
│   └── generated/            # Permanent image files (.png / .svg)
└── src/
    ├── config.js             # Configuration
    ├── db.js                 # SQLite database
    ├── promptOptimizer.js    # AI prompt engineering
    ├── generatorService.js   # Image generation engine
    ├── server.js             # Express server (Port 5000)
    └── routes/
        └── imageRoutes.js    # /api/generate endpoints
```
