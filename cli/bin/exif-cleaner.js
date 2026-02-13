#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';
import { cleanPng } from '../lib/cleanPng.js';
import { cleanWebp } from '../lib/cleanWebp.js';
import { cleanJpeg } from '../lib/cleanJpeg.js';
import { cleanPdf } from '../lib/cleanPdf.js';
import { cleanOffice } from '../lib/cleanOffice.js';
import { cleanText } from '../lib/cleanText.js';
import { translations } from '../lib/translations.js';

// ─── Sabitler ───────────────────────────────────────────────
const SUPPORTED_EXTENSIONS = [
    '.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif',
    '.pdf',
    '.docx', '.xlsx', '.pptx',
    '.txt', '.md'
];
const PKG = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

// ─── Dil Algılama ───────────────────────────────────────────
function detectLang(langOption) {
    if (langOption === 'tr' || langOption === 'en') return langOption;
    // Sistem dilini algıla
    const sysLang = (process.env.LANG || process.env.LC_ALL || process.env.LANGUAGE || '').toLowerCase();
    return sysLang.startsWith('tr') ? 'tr' : 'en';
}

// ─── Banner ─────────────────────────────────────────────────
function printBanner(t) {
    const line = chalk.gray('─'.repeat(52));
    console.log();
    console.log(line);
    console.log(
        chalk.bold.white('  🧹 ') +
        chalk.bold.cyan(t.banner) +
        chalk.gray(` v${PKG.version}`)
    );
    console.log(chalk.gray(`  ${t.bannerSub}`));
    console.log(line);
    console.log();
}

// ─── Dosya Keşfi ────────────────────────────────────────────
async function discoverFiles(inputs, recursive) {
    const files = [];

    for (const input of inputs) {
        const resolved = path.resolve(input);

        // Dosya mı kontrol et
        let stat;
        try {
            stat = fs.statSync(resolved);
        } catch {
            // Glob pattern olabilir
            const matches = await glob(input, { nodir: true, absolute: true });
            for (const match of matches) {
                const ext = path.extname(match).toLowerCase();
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    files.push(match);
                }
            }
            continue;
        }

        if (stat.isFile()) {
            const ext = path.extname(resolved).toLowerCase();
            if (SUPPORTED_EXTENSIONS.includes(ext)) {
                files.push(resolved);
            }
        } else if (stat.isDirectory()) {
            const pattern = recursive
                ? path.join(resolved, '**', `*{${SUPPORTED_EXTENSIONS.join(',')}}`)
                : path.join(resolved, `*{${SUPPORTED_EXTENSIONS.join(',')}}`);
            const matches = await glob(pattern, { nodir: true, absolute: true });
            files.push(...matches);
        }
    }

    // Tekrarları kaldır
    return [...new Set(files)];
}

// ─── Dosya Formatı Algılama ─────────────────────────────────
function getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'jpeg';
        case '.png':
            return 'png';
        case '.webp':
            return 'webp';
        case '.tiff':
        case '.tif':
            return 'tiff';
        case '.pdf':
            return 'pdf';
        case '.docx':
        case '.xlsx':
        case '.pptx':
            return 'office';
        case '.txt':
        case '.md':
            return 'text';
        default:
            return null;
    }
}

// ─── Çıkış Yolu Hesapla ────────────────────────────────────
function getOutputPath(filePath, outputDir, overwrite) {
    if (overwrite) return filePath;

    const dir = outputDir || path.dirname(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    return path.join(dir, `${baseName}_cleaned${ext}`);
}

// ─── Tek Dosya Temizle ──────────────────────────────────────
async function cleanFile(buffer, fileType) {
    switch (fileType) {
        case 'jpeg':
        case 'tiff':
            return cleanJpeg(buffer, fileType === 'tiff' ? 'image/tiff' : 'image/jpeg');
        case 'png':
            return cleanPng(buffer);
        case 'webp':
            return cleanWebp(buffer);
        case 'pdf':
            return await cleanPdf(buffer);
        case 'office':
            return await cleanOffice(buffer);
        case 'text':
            return cleanText(buffer);
        default:
            throw new Error(`Unsupported file type: ${fileType}`);
    }
}

// ─── Boyut Formatla ─────────────────────────────────────────
function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Progress Bar ───────────────────────────────────────────
function renderProgress(current, total, width = 30) {
    const ratio = current / total;
    const filled = Math.round(width * ratio);
    const empty = width - filled;
    const bar = chalk.cyan('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    const pct = Math.round(ratio * 100);
    return `${bar} ${chalk.bold(`${pct}%`)} ${chalk.gray(`(${current}/${total})`)}`;
}

// ─── Versiyon Kontrolü ──────────────────────────────────────
async function checkUpdate(t, currentVersion, verbose = false) {
    if (verbose) {
        console.log(chalk.gray(`  ${t.checkingUpdate}`));
    }

    try {
        // GitHub'daki package.json'ı çek
        const url = 'https://raw.githubusercontent.com/huseyinacikgoz/exif-cleaner/main/cli/package.json';
        const response = await fetch(url, { signal: AbortSignal.timeout(3000) });

        if (!response.ok) throw new Error('Network response was not ok');

        const remotePkg = await response.json();
        const latestVersion = remotePkg.version;

        if (latestVersion !== currentVersion) {
            console.log();
            const boxWidth = 50;
            const top = chalk.yellow('┏' + '━'.repeat(boxWidth - 2) + '┓');
            const bottom = chalk.yellow('┗' + '━'.repeat(boxWidth - 2) + '┛');

            console.log(top);
            console.log(chalk.yellow('┃') + chalk.bold.white(`  ${t.updateAvailable}`.padEnd(boxWidth - 3)) + chalk.yellow('┃'));
            console.log(chalk.yellow('┃') + `  ${t.currentVersion}: ${chalk.red(currentVersion)}`.padEnd(boxWidth + 6) + chalk.yellow('┃'));
            console.log(chalk.yellow('┃') + `  ${t.latestVersion}:  ${chalk.green(latestVersion)}`.padEnd(boxWidth + 6) + chalk.yellow('┃'));
            console.log(chalk.yellow('┃') + ' '.repeat(boxWidth - 2) + chalk.yellow('┃'));
            console.log(chalk.yellow('┃') + chalk.gray(`  ${t.updateInstruction}`.padEnd(boxWidth - 3)) + chalk.yellow('┃'));
            console.log(chalk.yellow('┃') + chalk.cyan(`  npm install -g exif-cleaner-cli`.padEnd(boxWidth - 3)) + chalk.yellow('┃'));
            console.log(bottom);
            console.log();
        } else if (verbose) {
            console.log(chalk.green(`  ✓ ${t.upToDate}`));
            console.log();
        }
    } catch (err) {
        if (verbose) {
            console.log(chalk.gray(`  ! Could not check for updates: ${err.message}`));
        }
    }
}

// ─── Ana İşlem ──────────────────────────────────────────────
async function main() {
    program
        .name('exif-cleaner')
        .version(PKG.version)
        .argument('[inputs...]', 'Files or directories to process')
        .option('-o, --output <dir>', 'Output directory')
        .option('-w, --overwrite', 'Overwrite original files', false)
        .option('-r, --recursive', 'Process subdirectories recursively', false)
        .option('-l, --lang <lang>', 'Language (en or tr)')
        .option('-v, --verbose', 'Show detailed output', false)
        .option('--check-update', 'Manually check for updates', false)
        .addHelpText('after', `

  ${chalk.bold('Examples:')}
    $ exif-cleaner photo.jpg
    $ exif-cleaner *.jpg *.png
    $ exif-cleaner ./photos/ -r -o ./cleaned/
    $ exif-cleaner photo.jpg -w
    $ exif-cleaner . -r --lang tr
`);

    program.parse();

    const opts = program.opts();
    const inputs = program.args;
    const lang = detectLang(opts.lang);
    const t = translations[lang];

    printBanner(t);

    // Manuel güncelleme kontrolü
    if (opts.checkUpdate) {
        await checkUpdate(t, PKG.version, true);
        process.exit(0);
    }

    // Girdi yoksa mevcut dizini kullan
    const targets = inputs.length > 0 ? inputs : ['.'];

    // Dosyaları keşfet
    const spinner = ora({
        text: t.scanning,
        color: 'cyan',
        spinner: 'dots'
    }).start();

    const files = await discoverFiles(targets, opts.recursive);

    if (files.length === 0) {
        spinner.fail(chalk.red(t.noFiles));
        console.log(chalk.gray(`  ${t.noFilesHint}`));
        console.log();
        process.exit(1);
    }

    spinner.succeed(chalk.green(`${files.length} ${lang === 'tr' ? 'dosya bulundu' : 'files found'}`));
    console.log();

    // Çıkış dizini varsa oluştur
    if (opts.output) {
        const outDir = path.resolve(opts.output);
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Üzerine yazma uyarısı
    if (opts.overwrite) {
        console.log(chalk.yellow(t.warningOverwrite));
        console.log();
    }

    // Dosyaları işle
    let cleaned = 0;
    let errors = 0;
    let totalOriginalSize = 0;
    let totalCleanedSize = 0;
    const startTime = Date.now();

    for (let i = 0; i < files.length; i++) {
        const filePath = files[i];
        const fileName = path.basename(filePath);
        const fileType = getFileType(filePath);

        // İlerleme durumu
        process.stdout.write(`\r  ${renderProgress(i + 1, files.length)} ${chalk.gray(fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName)}  `);

        if (!fileType) {
            if (opts.verbose) {
                process.stdout.write('\n');
                console.log(chalk.yellow(`  ⊘ ${t.skipped}: ${fileName}`));
            }
            continue;
        }

        try {
            const buffer = fs.readFileSync(filePath);
            totalOriginalSize += buffer.byteLength;

            const result = await cleanFile(buffer, fileType);
            const outputPath = getOutputPath(filePath, opts.output ? path.resolve(opts.output) : null, opts.overwrite);

            // Çıkış dizinini oluştur (gerekirse)
            const outputDir = path.dirname(outputPath);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            fs.writeFileSync(outputPath, result.cleaned);
            totalCleanedSize += result.cleaned.byteLength;
            cleaned++;

            if (opts.verbose) {
                process.stdout.write('\n');
                const sizeDiff = buffer.byteLength - result.cleaned.byteLength;
                const arrow = sizeDiff > 0
                    ? chalk.green(`↓ ${formatSize(sizeDiff)}`)
                    : chalk.gray(lang === 'tr' ? '= aynı boyut' : '= same size');
                console.log(
                    chalk.green(`  ✓ ${fileName}`) +
                    chalk.gray(` → ${path.basename(outputPath)}`) +
                    ` ${arrow}`
                );
            }
        } catch (err) {
            errors++;
            if (opts.verbose) {
                process.stdout.write('\n');
                console.log(chalk.red(`  ✗ ${t.error}: ${fileName} — ${err.message}`));
            }
        }
    }

    // Son satırı temizle
    process.stdout.write('\r' + ' '.repeat(80) + '\r');

    // Sonuç özeti
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log();

    const line = chalk.gray('─'.repeat(52));
    console.log(line);
    console.log(chalk.bold.white(`  📊 ${t.summary}`));
    console.log(line);
    console.log();
    console.log(`  ${chalk.gray(t.totalFiles + ':')}  ${chalk.bold(files.length.toString())}`);
    console.log(`  ${chalk.gray(t.cleaned + ':')}     ${chalk.bold.green(cleaned.toString())}`);
    if (errors > 0) {
        console.log(`  ${chalk.gray(t.errors + ':')}      ${chalk.bold.red(errors.toString())}`);
    }
    console.log(`  ${chalk.gray(t.elapsed + ':')}       ${chalk.bold(elapsed + t.seconds)}`);

    // Boyut bilgisi
    if (totalOriginalSize > 0 && totalCleanedSize > 0) {
        const saved = totalOriginalSize - totalCleanedSize;
        if (saved > 0) {
            console.log(`  ${chalk.gray((lang === 'tr' ? 'Kazanılan' : 'Saved') + ':')}  ${chalk.bold.green(formatSize(saved))}`);
        }
    }

    // Çıkış dizini bilgisi
    if (opts.overwrite) {
        console.log(`  ${chalk.gray(t.savedTo + ':')}     ${chalk.yellow(t.overwritten)}`);
    } else if (opts.output) {
        console.log(`  ${chalk.gray(t.savedTo + ':')}     ${chalk.cyan(path.resolve(opts.output))}`);
    } else {
        console.log(`  ${chalk.gray(t.savedTo + ':')}     ${chalk.cyan(lang === 'tr' ? 'Aynı dizine _cleaned eki ile' : 'Same directory with _cleaned suffix')}`);
    }

    console.log();
    console.log(
        cleaned > 0
            ? chalk.bold.green(`  ✨ ${t.done}`)
            : chalk.yellow(`  ${t.noFiles}`)
    );
    console.log();

    // Arka planda sessizce güncelleme kontrolü (eğer manuel kontrol edilmediyse)
    if (!opts.checkUpdate && !opts.verbose) {
        // İşlem bittikten sonra sessizce kontrol et
        await checkUpdate(t, PKG.version, false);
    }
}

main().catch((err) => {
    console.error(chalk.red(`\n  Error: ${err.message}\n`));
    process.exit(1);
});
