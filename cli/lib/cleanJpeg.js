import piexif from 'piexifjs';

/**
 * JPEG/TIFF dosyasından EXIF metadata'larını temizler.
 * piexifjs kütüphanesi ile Data URL üzerinden çalışır.
 * 
 * @param {Buffer} buffer - JPEG dosyasının buffer'ı
 * @param {string} mimeType - Dosyanın MIME tipi (image/jpeg veya image/tiff)
 * @returns {Buffer} Temizlenmiş JPEG dosyasının buffer'ı
 */
export function cleanJpeg(buffer, mimeType = 'image/jpeg') {
    // Buffer'ı Data URL'e dönüştür
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Metadata bilgisini oku (kaldırılacak veri var mı kontrol et)
    let hadExif = false;
    try {
        const exifData = piexif.load(dataUrl);
        // EXIF verisi var mı kontrol et
        for (const ifd of Object.values(exifData)) {
            if (ifd && typeof ifd === 'object' && Object.keys(ifd).length > 0) {
                hadExif = true;
                break;
            }
        }
    } catch {
        // EXIF okunamadıysa, temizlemeye devam et
    }

    // EXIF'i temizle
    let cleanedDataUrl;
    try {
        cleanedDataUrl = piexif.remove(dataUrl);
    } catch {
        // Temizlenemezse orijinalini döndür
        return { cleaned: buffer, removedChunks: 0 };
    }

    // Data URL'den Buffer'a dönüştür
    const base64Data = cleanedDataUrl.split(',')[1];
    const cleanedBuffer = Buffer.from(base64Data, 'base64');

    return { cleaned: cleanedBuffer, removedChunks: hadExif ? 1 : 0 };
}
