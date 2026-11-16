export class PromptOptimizer {
  /**
   * Cleans editorial headline noise
   */
  static cleanSubject(raw) {
    return (raw || '')
      .replace(/["'“”‘’«»()[\]{}:;!?]/g, ' ')
      .replace(/\b(?:\d+|top\s+\d+|best\s+\d+)\s+(?:ways|tips|strategies|steps|rules|secrets|methods|practices)\s+(?:to|for)?\b/gi, '')
      .replace(/\b(?:the\s+definitive\s+guide\s+to|the\s+ultimate\s+guide\s+to|everything\s+you\s+need\s+to\s+know\s+about|step\s+by\s+step\s+guide\s+to|a\s+complete\s+guide\s+to|a\s+guide\s+to|guide\s+to)\b/gi, '')
      .replace(/\b(?:how\s+to\s+(?:cure|fix|treat|overcome|get|build|start|use|master|scale|optimize))\b/gi, '')
      .replace(/\b(?:understanding|exploring|discovering|navigating|mastering|unveiling|demystifying|optimizing|enhancing|transforming|introducing|unlocking|revolutionizing)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Maps aspect ratio to native DALL-E 3 pixel resolution
   */
  static mapDimensions(aspectRatio = '16:9') {
    switch (aspectRatio) {
      case '16:9':
        return { width: 1792, height: 1024, size: '1792x1024' };
      case '9:16':
      case '4:5':
        return { width: 1024, height: 1792, size: '1024x1792' };
      case '1:1':
      default:
        return { width: 1024, height: 1024, size: '1024x1024' };
    }
  }

  /**
   * Enhances any raw prompt or topic into an ultra-high-quality commercial visual prompt
   */
  static optimize({ prompt, topic, title, style = 'Commercial Photography', industry = '', aspectRatio = '16:9' }) {
    const rawInput = prompt || title || topic || 'Modern High-End Innovation';

    // If the input already contains full prompt styling descriptors, keep it intact
    const isAlreadyDetailed = rawInput.length > 80 && (rawInput.includes('lighting') || rawInput.includes('cinematic') || rawInput.includes('aesthetic'));
    
    let subject = isAlreadyDetailed ? rawInput : this.cleanSubject(rawInput);
    if (!subject || subject.length < 3) subject = rawInput;

    const industryNote = industry && !subject.toLowerCase().includes(industry.toLowerCase())
      ? ` in the context of ${industry}`
      : '';

    const styleMap = {
      'Commercial Photography': 'professional studio photography, softbox lighting, clean composition, high-end commercial aesthetic, ultra-detailed textures, Hasselblad 8k',
      'Editorial': 'editorial magazine feature photography, award-winning composition, narrative depth, artistic directional lighting, sophisticated grading',
      'Minimal': 'minimalist aesthetic, generous negative space, clean lines, elegant balanced composition, muted premium color palette',
      '3D Render': 'octane 3D render, raytraced global illumination, photorealistic CGI, subsurface scattering, 8k resolution, volumetric light',
      'Realistic': 'photorealistic photography, natural daylight, high dynamic range, authentic textures, true-to-life depth, 8k uhd'
    };

    const chosenStyle = styleMap[style] || styleMap['Commercial Photography'];

    let finalPrompt = isAlreadyDetailed 
      ? rawInput 
      : `High-end aesthetic visual of ${subject}${industryNote}, clean modern composition, natural studio lighting, ${chosenStyle}, cinematic depth of field, 8k uhd, photorealistic, textless, no watermark, no typography`;

    // Strictly enforce zero-text constraints
    if (!finalPrompt.toLowerCase().includes('textless')) {
      finalPrompt += ', textless, no watermark, no text overlays, no letters';
    }

    const dims = this.mapDimensions(aspectRatio);

    return {
      optimizedPrompt: finalPrompt,
      style,
      aspectRatio,
      width: dims.width,
      height: dims.height,
      size: dims.size,
      negativePrompt: 'text, typography, words, letters, font, watermark, logo, label, signature, headline, writing, blurry, low quality, distorted, duplicate objects, bad anatomy, deformed'
    };
  }
}
