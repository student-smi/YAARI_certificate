import JSZip from 'jszip';

export const packageCertificatesToZip = async (
  certificates: Map<string, { blob: Blob; filename: string }>,
  projectName: string,
  onProgress?: (percent: number) => void
): Promise<Blob> => {
  const zip = new JSZip();
  const folder = zip.folder('certificates') || zip;

  const manifest = {
    projectName,
    generatedAt: new Date().toISOString(),
    totalCertificates: certificates.size,
    files: [] as string[]
  };

  certificates.forEach(({ blob, filename }) => {
    folder.file(filename, blob);
    manifest.files.push(filename);
  });

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  return zipBlob;
};

export const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
