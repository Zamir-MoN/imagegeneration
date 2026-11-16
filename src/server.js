import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import imageRoutes from './routes/imageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static assets (dashboard UI and generated high-res images)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/generated', express.static(path.join(__dirname, '../public/generated')));

// Health diagnostic probe
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'image-generator',
    port: config.port,
    hasOpenAiKey: Boolean(config.openai.apiKey),
    model: config.openai.model,
    timestamp: new Date().toISOString()
  });
});

// Mount Image Generation Routes
app.use('/api', imageRoutes);
app.use('/api/images', imageRoutes);

// Error boundary
app.use((err, req, res, next) => {
  console.error('[ImageGenerator Error]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error in image generator'
  });
});

app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`🎨 AI Image Generator running on http://localhost:${config.port}`);
  console.log(`🖼️ Image Generation API: POST http://localhost:${config.port}/api/generate`);
  console.log(`🌐 Image Studio Dashboard: http://localhost:${config.port}`);
  console.log('====================================================');
});

export default app;
