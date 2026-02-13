/**
 * PNG dosyasından EXIF, XMP ve diğer metadataları temizler.
 * Görüntü verisini (IDAT) yeniden sıkıştırmaz, sadece metadata chunk'larını çıkarır.
 * 
 * @param {Buffer} buffer - PNG dosyasının buffer'ı
 * @returns {Buffer} Temizlenmiş PNG dosyasının buffer'ı
 */
export function cleanPng(buffer) {
    const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    // PNG Signature Kontrolü: 89 50 4E 47 0D 0A 1A 0A
    if (dataView.getUint32(0) !== 0x89504E47 || dataView.getUint32(4) !== 0x0D0A1A0A) {
        throw new Error('Invalid PNG file');
    }

    const chunks = [];
    // Signature'ı ekle
    chunks.push(buffer.subarray(0, 8));

    let offset = 8;
    let removedCount = 0;

    while (offset < buffer.byteLength) {
        // Chunk Header okumak için en az 8 byte lazım (Length + Type)
        if (offset + 8 > buffer.byteLength) break;

        const length = dataView.getUint32(offset); // Length (Big Endian)
        const type = String.fromCharCode(
            dataView.getUint8(offset + 4),
            dataView.getUint8(offset + 5),
            dataView.getUint8(offset + 6),
            dataView.getUint8(offset + 7)
        );

        // Chunk yapısı: Length (4) + Type (4) + Data (length) + CRC (4)
        const totalChunkLength = 12 + length;

        // Dosya bütünlüğü kontrolü
        if (offset + totalChunkLength > buffer.byteLength) {
            break;
        }

        // Temizlenecek Chunk Tipleri
        const chunksToRemove = ['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME', 'dSIG'];

        if (chunksToRemove.includes(type)) {
            removedCount++;
        } else {
            // Güvenli chunk'ı kopyala (IHDR, PLTE, IDAT, IEND ve diğerleri)
            chunks.push(buffer.subarray(offset, offset + totalChunkLength));
        }

        offset += totalChunkLength;
    }

    return { cleaned: Buffer.concat(chunks), removedChunks: removedCount };
}
