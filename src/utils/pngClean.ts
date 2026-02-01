/**
 * PNG dosyasından EXIF, XMP ve diğer metadataları temizler.
 * Görüntü verisini (IDAT) yeniden sıkıştırmaz, sadece metadata chunk'larını çıkarır.
 */
export async function cleanPng(file: File): Promise<Blob> {
    const buffer = await file.arrayBuffer();
    const dataView = new DataView(buffer);

    // PNG Signature Kontrolü: 89 50 4E 47 0D 0A 1A 0A
    if (dataView.getUint32(0) !== 0x89504E47 || dataView.getUint32(4) !== 0x0D0A1A0A) {
        throw new Error('Geçersiz PNG dosyası');
    }

    const chunks: Uint8Array[] = [];
    // Signature'ı ekle
    chunks.push(new Uint8Array(buffer.slice(0, 8)));

    let offset = 8;
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
            console.warn(`PNG chunk ${type} eksik veya bozuk.`);
            break;
        }

        // Temizlenecek Chunk Tipleri
        // eXIf: Exif verileri
        // tEXt: Basit metin verileri (yazar, telif vb.)
        // zTXt: Sıkıştırılmış metin
        // iTXt: UTF-8 metin (XMP genelde buradadır)
        // tIME: Son değiştirilme zamanı
        // dSIG: Dijital imza (genelde kaldırılması istenir)
        // pHYs: Fiziksel piksel boyutları (kaldırılabilir ama bazen DPI için tutulur, biz privacy için siliyoruz)
        const chunksToRemove = ['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME', 'dSIG'];

        if (!chunksToRemove.includes(type)) {
            // Güvenli chunk'ı kopyala (IHDR, PLTE, IDAT, IEND ve diğerleri)
            chunks.push(new Uint8Array(buffer.slice(offset, offset + totalChunkLength)));
        }

        offset += totalChunkLength;
    }

    return new Blob(chunks as BlobPart[], { type: 'image/png' });
}
