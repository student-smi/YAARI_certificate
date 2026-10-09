import { jsPDF } from 'jspdf';
import { Template, TemplateElement } from '../types';
import { generateQrDataUrl } from './qrService';

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
    const mappedHeader = fieldMapping[key] || key;
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
      const recName = recipientData[fieldMapping['name'] || 'name'] || recipientData['Full Name'] || 'Recipient';
      const cName = recipientData[fieldMapping['course'] || 'course'] || recipientData['Course Name'] || 'the program';
      value = `This certifies that ${recName} has successfully completed the program ${cName}.`;
    }

    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
    text = text.replace(regex, value);
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

  // Background
  ctx.save();
  ctx.fillStyle = template.backgroundStyle.color || '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Borders
  const borderStyle = template.backgroundStyle.borderStyle || 'classic';
  if (borderStyle === 'gold_double') {
    // Outer border
    ctx.lineWidth = 14 * (width / 842);
    ctx.strokeStyle = '#B45309'; // rich amber gold
    ctx.strokeRect(20 * (width / 842), 20 * (height / 595), width - 40 * (width / 842), height - 40 * (height / 595));

    // Inner fine border
    ctx.lineWidth = 2 * (width / 842);
    ctx.strokeStyle = '#D97706';
    ctx.strokeRect(32 * (width / 842), 32 * (height / 595), width - 64 * (width / 842), height - 64 * (height / 595));

    // Corner decorative diamond marks
    const cornerSize = 10 * (width / 842);
    const corners = [
      [32 * (width / 842), 32 * (height / 595)],
      [width - 32 * (width / 842), 32 * (height / 595)],
      [32 * (width / 842), height - 32 * (height / 595)],
      [width - 32 * (width / 842), height - 32 * (height / 595)]
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
    ctx.lineWidth = 10 * (width / 842);
    ctx.strokeStyle = primaryColor;
    ctx.strokeRect(24 * (width / 842), 24 * (height / 595), width - 48 * (width / 842), height - 48 * (height / 595));

    ctx.lineWidth = 1.5 * (width / 842);
    ctx.strokeStyle = '#64748B';
    ctx.strokeRect(36 * (width / 842), 36 * (height / 595), width - 72 * (width / 842), height - 72 * (height / 595));
  } else if (borderStyle === 'modern') {
    // Modern accent line at top and minimal border
    ctx.lineWidth = 2 * (width / 842);
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(24 * (width / 842), 24 * (height / 595), width - 48 * (width / 842), height - 48 * (height / 595));

    // Top vibrant color bar (customizable borderColor or default luxury indigo)
    const accentColor = template.backgroundStyle.borderColor || '#4F46E5';
    ctx.fillStyle = accentColor;
    ctx.fillRect(24 * (width / 842), 24 * (height / 595), width - 48 * (width / 842), 10 * (height / 595));
  } else if (borderStyle === 'minimal') {
    ctx.lineWidth = 2 * (width / 842);
    ctx.strokeStyle = template.backgroundStyle.borderColor || '#CBD5E1';
    ctx.strokeRect(24 * (width / 842), 24 * (height / 595), width - 48 * (width / 842), height - 48 * (height / 595));
  } else if (borderStyle === 'none') {
    // Clean borderless certificate
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
              ctx.drawImage(img, x - elWidth / 2, y - elHeight / 2, elWidth, elHeight);
              res();
            };
            img.onerror = () => res();
            img.src = resolvedText;
          });
        }
        ctx.restore();
        continue;
      }

      // Scale font size proportionally to canvas width
      const scaledSize = fs.size * (width / 842);
      const fontStyle = fs.fontStyle || 'normal';
      ctx.font = `${fontStyle} ${fs.weight} ${scaledSize}px "${fs.family}", sans-serif`;
      ctx.fillStyle = fs.color;
      ctx.textAlign = fs.align;
      ctx.textBaseline = 'middle';

      // Text wrap if needed
      const maxTextWidth = elWidth * 1.2;
      const words = resolvedText.split(' ');
      let line = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());

      const lineHeightPx = scaledSize * (fs.lineHeight || 1.3);
      const totalBlockHeight = lines.length * lineHeightPx;
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

        // Elegant pen line under signature
        ctx.lineWidth = 1 * (width / 842);
        ctx.strokeStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(x - elWidth / 2, y + elHeight / 2 + 4 * (height / 595));
        ctx.lineTo(x + elWidth / 2, y + elHeight / 2 + 4 * (height / 595));
        ctx.stroke();
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

        // Elegant pen line under signature
        ctx.lineWidth = 1 * (width / 842);
        ctx.strokeStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(x - elWidth / 2, y + 16 * (height / 595));
        ctx.lineTo(x + elWidth / 2, y + 16 * (height / 595));
        ctx.stroke();
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
            ctx.drawImage(img, x - elWidth / 2, y - elHeight / 2, elWidth, elHeight);
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
  const canvas = document.createElement('canvas');
  // High-def preview: 1684 x 1190 (2x scale of 842 x 595)
  canvas.width = 1684;
  canvas.height = 1190;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  await renderCertificateToCanvas(ctx, canvas.width, canvas.height, context);
  return canvas.toDataURL('image/jpeg', 0.95);
};

/**
 * Generates an individual PDF file blob using jsPDF
 */
export const generateCertificatePdfBlob = async (context: RenderContext): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  // 300 DPI print quality: 2480 x 1754 (A4 at 300 DPI)
  canvas.width = 2480;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  await renderCertificateToCanvas(ctx, canvas.width, canvas.height, context);
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A4 Landscape is 297mm x 210mm
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
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
