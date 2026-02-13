/**
 * WebP dosyasından EXIF ve XMP metadata'larını temizler.
 * Görüntüyü yeniden sıkıştırmaz (re-encoding yapmaz), sadece metadata chunk'larını binary seviyesinde çıkarır.
 * 
 * @param {Buffer} buffer - WebP dosyasının buffer'ı
 * @returns {Buffer} Temizlenmiş WebP dosyasının buffer'ı
 */
export function cleanWebp(buffer) {
    const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    // WebP/RIFF Header Kontrolü
    if (
        dataView.getUint32(0, false) !== 0x52494646 || // 'RIFF'
        dataView.getUint32(8, false) !== 0x57454250    // 'WEBP'
    ) {
        throw new Error('Invalid WebP file');
    }

    const chunks = [];
    let offset = 12; // Header sonrası başlangıç
    let removedCount = 0;

    while (offset < buffer.byteLength) {
        if (offset + 8 > buffer.byteLength) break;

        const chunkId = String.fromCharCode(
            dataView.getUint8(offset),
            dataView.getUint8(offset + 1),
            dataView.getUint8(offset + 2),
            dataView.getUint8(offset + 3)
        );

        const chunkSize = dataView.getUint32(offset + 4, true); // Little Endian
        const totalChunkLength = chunkSize + (chunkSize % 2); // Padding dahil

        if (offset + 8 + chunkSize > buffer.byteLength) {
            break;
        }

        // EXIF ve XMP metadata chunk'larını atla
        if (chunkId === 'EXIF' || chunkId === 'XMP ') {
            removedCount++;
        } else {
            const chunkData = buffer.subarray(offset, offset + 8 + totalChunkLength);
            chunks.push(chunkData);
        }

        offset += 8 + totalChunkLength;
    }

    // Yeni dosya boyutunu hesapla
    const newFileSize = 4 + chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);

    // Yeni buffer oluştur
    const newBuffer = Buffer.alloc(newFileSize + 8);
    const newDataView = new DataView(newBuffer.buffer, newBuffer.byteOffset, newBuffer.byteLength);

    // Header Yaz
    newDataView.setUint32(0, 0x52494646, false); // 'RIFF'
    newDataView.setUint32(4, newFileSize, true);  // File Size (Little Endian)
    newDataView.setUint32(8, 0x57454250, false);  // 'WEBP'

    // Chunkları Yaz
    let writeOffset = 12;
    for (const chunk of chunks) {
        chunk.copy(newBuffer, writeOffset);
        writeOffset += chunk.byteLength;
    }

    return { cleaned: newBuffer, removedChunks: removedCount };
}
