import { Router } from 'express';
import { GeneratorService } from '../generatorService.js';
import { db } from '../db.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generatedDir = path.resolve(__dirname, '../../public/generated');

const router = Router();

/**
 * POST /api/generate
 * Dedicated image generation from any prompt or external API request
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, title, topic, style, aspectRatio, industry } = req.body;
    if (!prompt && !title && !topic) {
      return res.status(400).json({
        success: false,
        error: 'Please provide prompt, title, or topic to generate an image'
      });
    }

    const image = await GeneratorService.generateImage({
      prompt: prompt || title || topic,
      title: title || 'Generated Image Asset',
      topic,
      style: style || 'Commercial Photography',
      aspectRatio: aspectRatio || '16:9',
      industry: industry || ''
    });

    res.status(201).json({
      success: true,
      message: 'High-quality image generated successfully',
      image
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/generate-from-blog
 * Backward-compatible endpoint accepting external requests from blog-autoposter
 */
router.post('/generate-from-blog', async (req, res) => {
  try {
    const { prompt, title, topic, style, aspectRatio, industry, blogId } = req.body;
    const targetPrompt = prompt || title || topic;

    if (!targetPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Please provide prompt or title to generate an image'
      });
    }

    const image = await GeneratorService.generateImage({
      prompt: targetPrompt,
      title: title || 'Visual Asset',
      topic,
      blogId,
      style: style || 'Commercial Photography',
      aspectRatio: aspectRatio || '16:9',
      industry: industry || ''
    });

    res.status(201).json({
      success: true,
      message: 'Image generated successfully',
      image
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/images
 * List all generated images
 */
router.get('/', (req, res) => {
  try {
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 24));
    const images = db.query('SELECT * FROM generated_images ORDER BY created_at DESC LIMIT ?', [limit]);
    const total = db.queryOne('SELECT COUNT(*) as count FROM generated_images').count;

    res.json({
      success: true,
      total,
      images
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/images/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const image = db.queryOne('SELECT * FROM generated_images WHERE id = ?', [id]);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }
    res.json({ success: true, image });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/images/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const image = db.queryOne('SELECT * FROM generated_images WHERE id = ?', [id]);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    // Delete local file if present
    if (image.file_name) {
      const filePath = path.join(generatedDir, image.file_name);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    db.execute('DELETE FROM generated_images WHERE id = ?', [id]);
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
