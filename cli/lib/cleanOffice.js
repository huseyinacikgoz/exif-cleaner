import JSZip from 'jszip';

/**
 * Office (DOCX, XLSX, PPTX) dosyalarından metadata'ları temizler.
 * docProps/core.xml ve docProps/app.xml dosyalarındaki bilgileri temizler veya dosyaları çıkarır.
 * 
 * @param {Buffer} buffer - Office dosyasının buffer'ı
 * @returns {Promise<Buffer>} Temizlenmiş Office dosyası buffer'ı
 */
export async function cleanOffice(buffer) {
    try {
        const zip = await JSZip.loadAsync(buffer);
        let removedCount = 0;

        // Temizlenecek metadata dosyaları
        const metadataFiles = [
            'docProps/core.xml',
            'docProps/app.xml',
            'docProps/custom.xml',
            'docProps/thumbnail.jpeg',
            '_rels/.rels' // Bazı ilişkisel metadata'lar burada olabilir, ama dikkatli olmak lazım
        ];

        for (const file of metadataFiles) {
            if (zip.file(file)) {
                // Tamamen silmek yerine içeriğini boşaltmak veya minimal hale getirmek daha güvenlidir.
                // Core.xml genelde yazar, oluşturma tarihi gibi kritik verileri tutar.
                if (file === 'docProps/core.xml') {
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
                    zip.file(file, emptyCore);
                    removedCount++;
                } else if (file === 'docProps/app.xml') {
                    // App info kısmını temizle
                    const emptyApp = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Exif Cleaner</Application>
  <Company></Company>
</Properties>`;
                    zip.file(file, emptyApp);
                    removedCount++;
                } else {
                    zip.remove(file);
                    removedCount++;
                }
            }
        }

        const cleanedBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        return { cleaned: cleanedBuffer, removedChunks: removedCount };
    } catch (err) {
        throw new Error(`Office document processing error: ${err.message}`);
    }
}
