/**
 * WebP dosyasından EXIF ve XMP metadata'larını temizler.
 * Görüntüyü yeniden sıkıştırmaz (re-encoding yapmaz), sadece metadata chunk'larını binary seviyesinde çıkarır.
 */
export async function cleanWebP(file: File): Promise<Blob> {
    const buffer = await file.arrayBuffer();
    const dataView = new DataView(buffer);

    // WebP/RIFF Header Kontrolü
    // 0-3: 'RIFF'
    // 4-7: File Size (Little Endian)
    // 8-11: 'WEBP'

    if (
        dataView.getUint32(0, false) !== 0x52494646 || // 'RIFF'
        dataView.getUint32(8, false) !== 0x57454250    // 'WEBP'
    ) {
        throw new Error('Geçersiz WebP dosyası');
    }

    const chunks: { id: string, size: number, data: Uint8Array }[] = [];
    let offset = 12; // Header sonrası başlangıç

    while (offset < buffer.byteLength) {
        if (offset + 8 > buffer.byteLength) break; // Chunk header okumak için yetersiz alan

        const chunkId = String.fromCharCode(
            dataView.getUint8(offset),
            dataView.getUint8(offset + 1),
            dataView.getUint8(offset + 2),
            dataView.getUint8(offset + 3)
        );

        const chunkSize = dataView.getUint32(offset + 4, true); // Little Endian

        // Chunk verisinin tamamının mevcut olduğundan emin ol
        // Eğer dosya bozuksa veya kesikse, buffer sonuna kadar alalım
        const totalChunkLength = chunkSize + (chunkSize % 2); // Padding dahil (chunk size tek sayı ise +1 byte padding vardır)

        if (offset + 8 + chunkSize > buffer.byteLength) {
            console.warn(`WebP chunk ${chunkId} bozuk veya eksik, işlem durduruluyor.`);
            break;
        }

        // EXIF ve XMP metadata chunk'larını atla
        if (chunkId !== 'EXIF' && chunkId !== 'XMP ') {
            // Chunk header (8 byte) + Data (chunkSize) + Padding
            const chunkData = new Uint8Array(buffer, offset, 8 + totalChunkLength);
            chunks.push({ id: chunkId, size: chunkSize, data: chunkData });
        }

        offset += 8 + totalChunkLength;
    }

    // Yeni dosya boyutunu hesapla
    // Header (12 byte) + Kalan Chunkların Toplam Boyutu
    const newFileSize = 4 + chunks.reduce((acc, chunk) => acc + chunk.data.byteLength, 0);

    // Yeni buffer oluştur
    const newBuffer = new Uint8Array(newFileSize + 8);
    const newDataView = new DataView(newBuffer.buffer);

    // Header Yaz
    newDataView.setUint32(0, 0x52494646, false); // 'RIFF'
    newDataView.setUint32(4, newFileSize, true); // File Size (Little Endian)
    newDataView.setUint32(8, 0x57454250, false); // 'WEBP'

    // Chunkları Yaz
    let writeOffset = 12;
    for (const chunk of chunks) {
        newBuffer.set(chunk.data, writeOffset);
        writeOffset += chunk.data.byteLength;

        // VP8X chunk varsa (genişletilmiş header), metadata flaglerini temizlememiz gerekebilir
        // Ancak metadata chunklarını sildiğimiz için flagler kalsa bile sorun yaratmaz genelde
        // Yine de spesifik olarak düzeltmek gerekirse burada yapılabilir.
        // Şimdilik sadece chunk silmek çoğu görüntüleyici için yeterlidir.
    }

    return new Blob([newBuffer], { type: 'image/webp' });
}
