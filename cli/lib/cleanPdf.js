import { PDFDocument } from 'pdf-lib';

/**
 * PDF dosyasından metadata'ları (Title, Author, Subject, Keywords, Creator, Producer, vs.) temizler.
 * 
 * @param {Buffer} buffer - PDF dosyasının buffer'ı
 * @returns {Promise<Buffer>} Temizlenmiş PDF buffer'ı
 */
export async function cleanPdf(buffer) {
    try {
        const pdfDoc = await PDFDocument.load(buffer);

        // Standart metadata bilgilerini temizle
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        const now = new Date();
        pdfDoc.setCreationDate(now);
        pdfDoc.setModificationDate(now);

        // Kaydet ve buffer olarak döndür
        const pdfBytes = await pdfDoc.save();
        return { cleaned: Buffer.from(pdfBytes), removedChunks: 1 };
    } catch (err) {
        throw new Error(`PDF processing error: ${err.message}`);
    }
}
