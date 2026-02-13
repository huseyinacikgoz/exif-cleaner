import { PDFDocument } from 'pdf-lib';

/**
 * PDF dosyasından metadata'ları (Title, Author, Subject, Keywords, Creator, Producer, vs.) temizler.
 */
export async function cleanPdf(file: File): Promise<Blob> {
    try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(buffer);

        // Metadata temizle
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        const now = new Date();
        pdfDoc.setCreationDate(now);
        pdfDoc.setModificationDate(now);

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes.buffer as any], { type: 'application/pdf' });
    } catch (err: any) {
        throw new Error(`PDF clean error: ${err.message}`);
    }
}
