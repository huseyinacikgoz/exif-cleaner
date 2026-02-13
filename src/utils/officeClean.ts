import JSZip from 'jszip';

/**
 * Office (DOCX, XLSX, PPTX) dosyalarından metadata'ları temizler.
 */
export async function cleanOffice(file: File): Promise<Blob> {
    try {
        const buffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(buffer);

        const metadataFiles = [
            'docProps/core.xml',
            'docProps/app.xml',
            'docProps/custom.xml',
            'docProps/thumbnail.jpeg',
            '_rels/.rels'
        ];

        for (const filename of metadataFiles) {
            if (zip.file(filename)) {
                if (filename === 'docProps/core.xml') {
                    const emptyCore = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title></dc:title>
  <dc:subject></dc:subject>
  <dc:creator>Exif Cleaner</dc:creator>
  <cp:keywords></cp:keywords>
  <dc:description></dc:description>
  <cp:lastModifiedBy>Exif Cleaner</cp:lastModifiedBy>
  <cp:revision>1</cp:revision>
</cp:coreProperties>`;
                    zip.file(filename, emptyCore);
                } else if (filename === 'docProps/app.xml') {
                    const emptyApp = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Exif Cleaner</Application>
  <Company></Company>
</Properties>`;
                    zip.file(filename, emptyApp);
                } else {
                    zip.remove(filename);
                }
            }
        }

        const cleanedBlob = await zip.generateAsync({ type: 'blob' });
        return new Blob([cleanedBlob], { type: file.type });
    } catch (err: any) {
        throw new Error(`Office clean error: ${err.message}`);
    }
}
