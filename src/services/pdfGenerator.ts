import { jsPDF } from 'jspdf';
import { Template, TemplateElement } from '../types';
import { generateQrDataUrl } from './qrService';
import { drawVintageOrnateBorderToCanvas } from '../components/Designer/VintageOrnateBorder';

export interface RenderContext {
  template: Template;
  recipientData: Record<string, string>;
  certificateId: string;
  fieldMapping?: Record<string, string>;
  qrBaseUrl?: string;
}

/**
 * Replaces dynamic placeholders like {{name}}, {{course}}, {{issue_date}}, {{completion_date}} with actual recipient data
 */
export const resolveDynamicContent = (
  rawText: string,
  recipientData: Record<string, string>,
  certificateId: string,
  fieldMapping: Record<string, string> = {},
  qrBaseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://certiforge.io'
): string => {
  let text = rawText;

  // Replace standard certificate ID and verification URL
  text = text.replace(/\{\{certificate_id\}\}/gi, certificateId);
  const verifyLink = `${qrBaseUrl.replace(/\/$/, '')}/#verify/${certificateId}`;
  text = text.replace(/\{\{verification_url\}\}/gi, verifyLink);

  // Map known fields according to specification
  const fieldKeys = [
    'name', 
    'recipient_name',
    'student_name',
    'course', 
    'issue_date', 
    'completion_date', 
    'date', 
    'organization', 
    'title', 
    'statement',
    'student_id',
    'start_date',
    'course_duration',
    'grade',
    'achievement_level',
    'batch',
    'specialization',
    'learning_mode',
    'training_location',
    'accreditation',
    'expiry_date',
    'credits',
    'email'
  ];
  
  fieldKeys.forEach((key) => {
    const mappedHeader = fieldMapping[key] || 
      (key === 'recipient_name' || key === 'student_name' ? fieldMapping['name'] : undefined) || 
      (key === 'name' ? (fieldMapping['recipient_name'] || fieldMapping['student_name']) : undefined) || 
      key;
    // Find value from recipientData case-insensitively
    let value = recipientData[mappedHeader] || recipientData[key] || '';
    if (!value) {
      // Try fuzzy match in recipientData
      const foundKey = Object.keys(recipientData).find(
        k => k.toLowerCase() === key.toLowerCase() || 
             k.toLowerCase() === mappedHeader.toLowerCase() ||
             k.toLowerCase().replace(/[\s_-]/g, '') === key.toLowerCase().replace(/[\s_-]/g, '')
      );
      if (foundKey) value = recipientData[foundKey];
    }

    // Special fallbacks
    if (!value && (key === 'name' || key === 'recipient_name' || key === 'student_name')) {
      value = recipientData['Full Name'] || recipientData['full_name'] || recipientData['Student Name'] || recipientData['student_name'] || recipientData['Recipient Name'] || recipientData['recipient_name'] || recipientData['Name'] || recipientData['name'] || '';
    }
    if (!value && key === 'issue_date') {
      value = recipientData['date'] || recipientData['Date'] || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    if (!value && key === 'completion_date') {
      value = recipientData['date'] || recipientData['Date'] || '';
    }
    if (!value && key === 'date') {
      value = recipientData['issue_date'] || recipientData['completion_date'] || '';
    }
    if (!value && key === 'statement') {
      const recName = recipientData[fieldMapping['name'] || fieldMapping['recipient_name'] || 'name'] || recipientData['Full Name'] || recipientData['Name'] || 'Recipient';
      const cName = recipientData[fieldMapping['course'] || 'course'] || recipientData['Course Name'] || 'the program';
      value = `This certifies that ${recName} has successfully completed the program ${cName}.`;
    }

    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    text = text.replace(regex, value);

    // If key is name, also replace any existing recipient_name / student_name tags with same value
    if (key === 'name' && value) {
      text = text.replace(/\{\{recipient_name\}\}/gi, value);
      text = text.replace(/\{\{student_name\}\}/gi, value);
    }
  });

  // Replace any other custom {{field}} tags from recipientData
  Object.entries(recipientData).forEach(([colName, colVal]) => {
    const cleanTag = colName.toLowerCase().replace(/\s+/g, '_');
    const regex = new RegExp(`\\{\\{${cleanTag}\\}\\}`, 'gi');
    text = text.replace(regex, colVal);
  });

  return text;
};

/**
 * Renders a certificate to an HTML5 Canvas at high resolution (300 DPI equivalent)
 */
export const renderCertificateToCanvas = async (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  context: RenderContext
): Promise<void> => {
  const { template, recipientData, certificateId, fieldMapping = {}, qrBaseUrl = window.location.origin } = context;

  const isPortrait = template.orientation === 'portrait';
  const refW = template.width || (isPortrait ? 595 : 842);
  const refH = template.height || (isPortrait ? 842 : 595);
  const scaleW = width / refW;
  const scaleH = height / refH;

  // 1. Base Solid Color or Gradient
  ctx.save();
  if (template.backgroundStyle.gradient) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    const matches = template.backgroundStyle.gradient.match(/#[a-fA-F0-9]{3,8}|rgba?\([^)]+\)/g);
    if (matches && matches.length >= 2) {
      grad.addColorStop(0, matches[0]);
      grad.addColorStop(1, matches[matches.length - 1]);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = template.backgroundStyle.color || '#FFFFFF';
    }
  } else {
    ctx.fillStyle = template.backgroundStyle.color || '#FFFFFF';
  }
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 2. Custom Uploaded Institute Background Image (or preset image)
  if (template.backgroundStyle.imageUrl) {
    await new Promise<void>((resolve) => {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = () => {
        ctx.save();
        if (template.backgroundStyle.imageOpacity !== undefined) {
          ctx.globalAlpha = Math.max(0.05, Math.min(1, template.backgroundStyle.imageOpacity));
        }

        const fit = template.backgroundStyle.imageFit || 'cover';
        const imgW = bgImg.naturalWidth || width;
        const imgH = bgImg.naturalHeight || height;
        const imgAspect = imgW / imgH;

        if (fit === 'stretch') {
          ctx.drawImage(bgImg, 0, 0, width, height);
        } else if (fit === 'contain') {
          let drawW = width;
          let drawH = width / imgAspect;
          if (drawH > height) {
            drawH = height;
            drawW = height * imgAspect;
          }
          const drawX = (width - drawW) / 2;
          const drawY = (height - drawH) / 2;
          ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
        } else {
          // 'cover' mode
          let drawW = width;
          let drawH = width / imgAspect;
          if (drawH < height) {
            drawH = height;
            drawW = height * imgAspect;
          }
          const drawX = (width - drawW) / 2;
          const drawY = (height - drawH) / 2;
          ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
        }

        ctx.restore();
        resolve();
      };
      bgImg.onerror = () => resolve();
      bgImg.src = template.backgroundStyle.imageUrl!;
    });
  }

  // 3. Security Guilloche / Pattern Overlays
  if (template.backgroundStyle.patternType === 'guilloche') {
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.08)';
    ctx.lineWidth = Math.max(1, 1 * scaleW);
    for (let i = 0; i < height; i += 32 * scaleH) {
      ctx.beginPath();
      for (let px = 0; px < width; px += 12 * scaleW) {
        const py = i + Math.sin((px + i) * 0.015) * 8 * scaleH;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  } else if (template.backgroundStyle.patternType === 'dots') {
    ctx.save();
    ctx.fillStyle = 'rgba(100, 116, 139, 0.07)';
    const spacing = 28 * scaleW;
    for (let px = 20 * scaleW; px < width - 20 * scaleW; px += spacing) {
      for (let py = 20 * scaleH; py < height - 20 * scaleH; py += spacing) {
        ctx.beginPath();
        ctx.arc(px, py, 1.4 * scaleW, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // 4. Borders
  ctx.save();
  const borderStyle = template.backgroundStyle.borderStyle || 'classic';
  if (borderStyle === 'vintage_ornate') {
    const primaryColor = template.backgroundStyle.borderColor || '#1E3A8A';
    drawVintageOrnateBorderToCanvas(ctx, width, height, scaleW, scaleH, primaryColor);
  } else if (borderStyle === 'gold_double') {
    // Outer border
    ctx.lineWidth = 14 * Math.min(scaleW, scaleH);
    ctx.strokeStyle = '#B45309'; // rich amber gold
    ctx.strokeRect(20 * scaleW, 20 * scaleH, width - 40 * scaleW, height - 40 * scaleH);

    // Inner fine border
    ctx.lineWidth = 2 * Math.min(scaleW, scaleH);
    ctx.strokeStyle = '#D97706';
    ctx.strokeRect(32 * scaleW, 32 * scaleH, width - 64 * scaleW, height - 64 * scaleH);

    // Corner decorative diamond marks
    const cornerSize = 10 * Math.min(scaleW, scaleH);
    const corners = [
      [32 * scaleW, 32 * scaleH],
      [width - 32 * scaleW, 32 * scaleH],
      [32 * scaleW, height - 32 * scaleH],
      [width - 32 * scaleW, height - 32 * scaleH]
    ];
    ctx.fillStyle = '#B45309';
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, cornerSize / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (borderStyle === 'classic') {
    // Elegant dual slate navy border
    const primaryColor = template.backgroundStyle.borderColor || '#0F172A';
    ctx.lineWidth = 10 * Math.min(scaleW, scaleH);
    ctx.strokeStyle = primaryColor;
    ctx.strokeRect(24 * scaleW, 24 * scaleH, width - 48 * scaleW, height - 48 * scaleH);

    ctx.lineWidth = 1.5 * Math.min(scaleW, scaleH);
    ctx.strokeStyle = '#64748B';
    ctx.strokeRect(36 * scaleW, 36 * scaleH, width - 72 * scaleW, height - 72 * scaleH);
  } else if (borderStyle === 'modern') {
    // Modern accent line at top and minimal border
    ctx.lineWidth = 2 * Math.min(scaleW, scaleH);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(24 * scaleW, 24 * scaleH, width - 48 * scaleW, height - 48 * scaleH);

    // Top vibrant color bar
    const accentColor = template.backgroundStyle.borderColor || '#4F46E5';
    ctx.fillStyle = accentColor;
    ctx.fillRect(24 * scaleW, 24 * scaleH, width - 48 * scaleW, 10 * scaleH);
  } else if (borderStyle === 'minimal') {
    ctx.lineWidth = 2 * Math.min(scaleW, scaleH);
    ctx.strokeStyle = template.backgroundStyle.borderColor || '#CBD5E1';
    ctx.strokeRect(24 * scaleW, 24 * scaleH, width - 48 * scaleW, height - 48 * scaleH);
  } else if (borderStyle === 'none') {
    // Clean borderless certificate (ideal for custom institute uploaded background)
  }
  ctx.restore();

  // Render elements in order of zIndex
  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const element of sortedElements) {
    const x = (element.x / 100) * width;
    const y = (element.y / 100) * height;
    const elWidth = (element.width / 100) * width;
    const elHeight = (element.height / 100) * height;

    ctx.save();
    if (element.opacity !== undefined) {
      ctx.globalAlpha = element.opacity;
    }

    if (element.type === 'text' || element.type === 'dynamic_field' || element.type === 'certificate_id') {
      const fs = element.fontSettings || {
        family: 'Plus Jakarta Sans',
        size: 16,
        weight: '400',
        color: '#0F172A',
        align: 'center',
        letterSpacing: 0,
        lineHeight: 1.2
      };

      const resolvedText = resolveDynamicContent(element.content, recipientData, certificateId, fieldMapping);

      // If data URI or base64 image payload was mistakenly in a text element, render as image or skip to prevent raw code rendering
      if (resolvedText.startsWith('data:') || resolvedText.includes(';base64,')) {
        if (resolvedText.startsWith('data:image/')) {
          await new Promise<void>((res) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const aspect = (img.naturalWidth || elWidth) / (img.naturalHeight || elHeight);
              let drawW = elWidth;
              let drawH = elWidth / aspect;
              if (drawH > elHeight) {
                drawH = elHeight;
                drawW = elHeight * aspect;
              }
              ctx.drawImage(img, x - drawW / 2, y - drawH / 2, drawW, drawH);
              res();
            };
            img.onerror = () => res();
            img.src = resolvedText;
          });
        }
        ctx.restore();
        continue;
      }

      // Scale font size proportionally to base template dimensions
      const scaledSize = fs.size * scaleW;
      const fontStyle = fs.fontStyle || 'normal';
      ctx.font = `${fontStyle} ${fs.weight} ${scaledSize}px "${fs.family}", sans-serif`;
      ctx.fillStyle = fs.color;
      ctx.textAlign = fs.align;
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) {
        const scaledLetterSpacing = (fs.letterSpacing || 0) * scaleW;
        (ctx as any).letterSpacing = `${scaledLetterSpacing}px`;
      }

      // Exact text wrap matching editor bounds (no artificial multiplier)
      const maxTextWidth = elWidth;
      const paragraphs = resolvedText.split('\n');
      const lines: string[] = [];

      for (const para of paragraphs) {
        if (!para.trim()) {
          lines.push('');
          continue;
        }
        const words = para.split(' ');
        let currentLine = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && currentLine !== '') {
            lines.push(currentLine);
            currentLine = words[n];
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }
      }

      const lineHeightPx = scaledSize * (fs.lineHeight || 1.3);
      const totalBlockHeight = Math.max(1, lines.length) * lineHeightPx;
      const startY = y - totalBlockHeight / 2 + lineHeightPx / 2;

      lines.forEach((l, idx) => {
        ctx.fillText(l, x, startY + idx * lineHeightPx);
      });

    } else if (element.type === 'signature') {
      const isImageSignature = element.content && (
        element.content.startsWith('data:') ||
        element.content.startsWith('http://') ||
        element.content.startsWith('https://') ||
        element.content.startsWith('blob:') ||
        element.content.includes(';base64,')
      );

      if (isImageSignature) {
        await new Promise<void>((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const aspect = (img.naturalWidth || elWidth) / (img.naturalHeight || elHeight);
            let drawW = elWidth;
            let drawH = elWidth / aspect;
            if (drawH > elHeight) {
              drawH = elHeight;
              drawW = elHeight * aspect;
            }
            ctx.drawImage(img, x - drawW / 2, y - drawH / 2, drawW, drawH);
            res();
          };
          img.onerror = () => res();
          img.src = element.content;
        });
      } else {
        const fs = element.fontSettings || {
          family: 'Great Vibes',
          size: 28,
          weight: '400',
          color: '#0F172A',
          align: 'center',
          letterSpacing: 1,
          lineHeight: 1
        };
        const scaledSize = fs.size * (width / 842);
        ctx.font = `normal ${fs.weight} ${scaledSize}px "${fs.family}", cursive`;
        ctx.fillStyle = fs.color;
        ctx.textAlign = fs.align;
        ctx.textBaseline = 'middle';
        ctx.fillText(element.content, x, y);
      }

    } else if (element.type === 'line') {
      ctx.lineWidth = (element.borderWidth || 1) * (width / 842);
      ctx.strokeStyle = element.backgroundColor || '#D97706';
      ctx.beginPath();
      ctx.moveTo(x - elWidth / 2, y);
      ctx.lineTo(x + elWidth / 2, y);
      ctx.stroke();

    } else if (element.type === 'seal') {
      // Render official gold/navy crest seal badge
      const radius = (elWidth / 2);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#FEF3C7';
      ctx.fill();
      ctx.lineWidth = 2.5 * (width / 842);
      ctx.strokeStyle = '#D97706';
      ctx.stroke();

      // Inner dotted circle
      ctx.save();
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.5 * (width / 842);
      ctx.strokeStyle = '#B45309';
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Star icon or seal text in center
      ctx.font = `bold ${10 * (width / 842)}px "Cinzel", serif`;
      ctx.fillStyle = '#92400E';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★ OFFICIAL ★', x, y - 2);
      ctx.font = `600 ${7 * (width / 842)}px "Inter", sans-serif`;
      ctx.fillText('VERIFIED', x, y + 10 * (height / 595));

    } else if (element.type === 'qr') {
      // Generate QR Code targeting the verification URL
      const verifyUrl = `${qrBaseUrl}/verify/${certificateId}`;
      const qrDataUrl = await generateQrDataUrl(verifyUrl);

      if (qrDataUrl) {
        await new Promise<void>((res) => {
          const img = new Image();
          img.onload = () => {
            const qrSize = Math.min(elWidth, elHeight);
            ctx.drawImage(img, x - qrSize / 2, y - qrSize / 2, qrSize, qrSize);
            res();
          };
          img.onerror = () => res();
          img.src = qrDataUrl;
        });
      }
    } else if (element.type === 'logo' || element.type === 'image') {
      if (element.content) {
        await new Promise<void>((res) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const aspect = (img.naturalWidth || elWidth) / (img.naturalHeight || elHeight);
            let drawW = elWidth;
            let drawH = elWidth / aspect;
            if (drawH > elHeight) {
              drawH = elHeight;
              drawW = elHeight * aspect;
            }
            ctx.drawImage(img, x - drawW / 2, y - drawH / 2, drawW, drawH);
            res();
          };
          img.onerror = () => res();
          img.src = element.content;
        });
      }
    }

    ctx.restore();
  }
};

/**
 * Creates a high-res image data URL (useful for fast canvas preview)
 */
export const generateCertificatePreviewDataUrl = async (context: RenderContext): Promise<string> => {
  if (typeof document !== 'undefined' && (document as any).fonts) {
    try {
      await (document as any).fonts.ready;
    } catch (e) {}
  }
  const canvas = document.createElement('canvas');
  const isPortrait = context.template.orientation === 'portrait';
  // High-def preview (2x scale):
  canvas.width = isPortrait ? 1190 : 1684;
  canvas.height = isPortrait ? 1684 : 1190;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  await renderCertificateToCanvas(ctx, canvas.width, canvas.height, context);
  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * Generates an individual PDF file blob using jsPDF
 */
export const generateCertificatePdfBlob = async (context: RenderContext): Promise<Blob> => {
  if (typeof document !== 'undefined' && (document as any).fonts) {
    try {
      await (document as any).fonts.ready;
    } catch (e) {}
  }
  const canvas = document.createElement('canvas');
  const isPortrait = context.template.orientation === 'portrait';
  // 300 DPI print quality:
  canvas.width = isPortrait ? 1754 : 2480;
  canvas.height = isPortrait ? 2480 : 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  await renderCertificateToCanvas(ctx, canvas.width, canvas.height, context);
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const pdf = new jsPDF({
    orientation: isPortrait ? 'portrait' : 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = isPortrait ? 210 : 297;
  const pdfHeight = isPortrait ? 297 : 210;
  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
  return pdf.output('blob');
};

/**
 * Batch generation engine with callback for progress updates
 */
export const batchGenerateCertificates = async (
  template: Template,
  recipients: Array<{ id: string; data: Record<string, string>; certificateId: string }>,
  fieldMapping: Record<string, string>,
  onProgress?: (processed: number, total: number, currentName: string) => void
): Promise<Map<string, { blob: Blob; filename: string }>> => {
  const results = new Map<string, { blob: Blob; filename: string }>();
  const total = recipients.length;

  for (let i = 0; i < total; i++) {
    const rec = recipients[i];
    const recName = rec.data[fieldMapping['name'] || 'name'] || rec.data['Full Name'] || rec.data['Name'] || `Recipient_${i + 1}`;
    
    // Clean filename
    const cleanName = recName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${rec.certificateId}_${cleanName}.pdf`;

    if (onProgress) {
      onProgress(i + 1, total, recName);
    }

    const blob = await generateCertificatePdfBlob({
      template,
      recipientData: rec.data,
      certificateId: rec.certificateId,
      fieldMapping
    });

    results.set(rec.id, { blob, filename });

    // Allow browser event loop breathing room so UI does not freeze during large batches
    if (i % 5 === 0) {
      await new Promise(r => setTimeout(r, 10));
    }
  }

  return results;
};
