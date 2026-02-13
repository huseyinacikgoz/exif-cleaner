/**
 * Metin dosyalarından (TXT, MD) BOM (Byte Order Mark) ve trailing whitespace temizler.
 * 
 * @param {Buffer} buffer - Metin dosyasının buffer'ı
 * @returns {Buffer} Temizlenmiş Metin dosyası buffer'ı
 */
export function cleanText(buffer) {
    let content = buffer.toString('utf8');

    // UTF-8 BOM temizle (\uFEFF)
    if (content.startsWith('\uFEFF')) {
        content = content.substring(1);
    }

    // Satır sonlarındaki gereksiz boşlukları temizle (isteğe bağlı ama privacy için bazen önemli)
    const lines = content.split(/\r?\n/);
    const cleanedLines = lines.map(line => line.trimEnd());

    return { cleaned: Buffer.from(cleanedLines.join('\n'), 'utf8'), removedChunks: 0 };
}
