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
 * POST /generate (or /api/generate)
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
 * POST /generate-from-blog
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

// Helper for image list
const handleGetImages = (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const statusFilter = (req.query.status || 'all').toLowerCase();

    const allCount = db.queryOne('SELECT COUNT(*) as count FROM generated_images').count;
    const approvedCount = db.queryOne("SELECT COUNT(*) as count FROM generated_images WHERE status = 'approved'").count;
    const rejectedCount = db.queryOne("SELECT COUNT(*) as count FROM generated_images WHERE status = 'rejected'").count;
    const pendingCount = db.queryOne("SELECT COUNT(*) as count FROM generated_images WHERE status = 'pending' OR status IS NULL").count;

    let query = 'SELECT * FROM generated_images';
    const params = [];

    if (statusFilter === 'approved') {
      query += " WHERE status = 'approved'";
    } else if (statusFilter === 'rejected') {
      query += " WHERE status = 'rejected'";
    } else if (statusFilter === 'pending') {
      query += " WHERE status = 'pending' OR status IS NULL";
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const images = db.query(query, params);

    res.json({
      success: true,
      total: images.length,
      stats: {
        all: allCount,
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount
      },
      images
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.get('/', handleGetImages);
router.get('/images', handleGetImages);

// Helper for status patch
const handlePatchStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['approved', 'rejected', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const image = db.queryOne('SELECT * FROM generated_images WHERE id = ?', [id]);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

    db.execute('UPDATE generated_images SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: `Image successfully marked as ${status}`,
      id,
      status
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.patch('/:id/status', handlePatchStatus);
router.patch('/images/:id/status', handlePatchStatus);

// Helper for purge rejected
const handlePurgeRejected = (req, res) => {
  try {
    const rejectedImages = db.query("SELECT * FROM generated_images WHERE status = 'rejected'");
    let deletedCount = 0;

    for (const img of rejectedImages) {
      if (img.file_name) {
        const filePath = path.join(generatedDir, img.file_name);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      db.execute('DELETE FROM generated_images WHERE id = ?', [img.id]);
      deletedCount++;
    }

    res.json({
      success: true,
      message: `Purged ${deletedCount} rejected images`,
      deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

router.post('/purge-rejected', handlePurgeRejected);
router.post('/images/purge-rejected', handlePurgeRejected);

// Single image query
const handleGetSingleImage = (req, res) => {
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
};

router.get('/:id', handleGetSingleImage);
router.get('/images/:id', handleGetSingleImage);

// Delete image
const handleDeleteImage = (req, res) => {
  try {
    const { id } = req.params;
    const image = db.queryOne('SELECT * FROM generated_images WHERE id = ?', [id]);
    if (!image) {
      return res.status(404).json({ success: false, error: 'Image not found' });
    }

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
};

router.delete('/:id', handleDeleteImage);
router.delete('/images/:id', handleDeleteImage);

export default router;
