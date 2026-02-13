/**
 * Metin dosyalarından (TXT, MD) BOM ve trailing whitespace temizler.
 */
export async function cleanText(file: File): Promise<Blob> {
    const text = await file.text();
    let content = text;

    // UTF-8 BOM
    if (content.startsWith('\uFEFF')) {
        content = content.substring(1);
    }

    const lines = content.split(/\r?\n/);
    const cleanedLines = lines.map(line => line.trimEnd());

    return new Blob([cleanedLines.join('\n')], { type: 'text/plain;charset=utf-8' });
}
