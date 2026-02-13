<div align="right">

[Türkçe](#türkçe) | [English](#english)

</div>

<a id="türkçe"></a>

<div align="center">

<img src="public/favicon/android-chrome-512x512.png" width="96" height="96" alt="EXIF Cleaner Logo">

# EXIF Cleaner

**Fotoğraflarınızdan ve Dökümanlarınızdan Metadata Temizleyin - Gizliliğinizi Koruyun**

[![Sürüm](https://img.shields.io/badge/sürüm-v1.0.4-black?style=flat-square)](https://huseyinacikgoz.com.tr/exif-cleaner/)
[![Lisans](https://img.shields.io/badge/lisans-MIT-blue?style=flat-square)](LICENSE)
[![Durum](https://img.shields.io/badge/durum-Yayında-green?style=flat-square)](https://huseyinacikgoz.com.tr/exif-cleaner/)

</div>

### 📖 Hakkında

Fotoğraflarınızı çevrimiçi paylaşmadan önce metadata (EXIF, GPS, cihaz bilgisi) temizlemek için hızlı, güvenli ve gizlilik odaklı bir araç. Tüm işlemler tarayıcınızda yerel olarak gerçekleşir - hiçbir veri sunucuya yüklenmez.

### ✨ Özellikler

#### 🔒 Gizlilik Öncelikli
- Tarayıcınızda %100 yerel işlem
- Hiçbir görsel veya metadata sunucuya yüklenmez
- Çerez, izleme veya analitik yok

#### 🎨 Kullanıcı Deneyimi
- Güzel açık ve koyu temalar
- Çoklu dil desteği (Türkçe & İngilizce)
- Masaüstü ve mobil için duyarlı tasarım
- Framer Motion ile akıcı animasyonlar

#### 📦 Toplu İşlem / Format Desteği
- Birden fazla görsel ve dökümanı aynı anda temizleyin
- **Görsel**: JPEG, PNG, WebP, TIFF
- **Döküman**: PDF, DOCX, XLSX, PPTX
- **Metin**: TXT, MD
- ZIP dosyası olarak indirin (Web)

### 🚀 Başlarken

#### Canlı Versiyon
🌐 [huseyinacikgoz.com.tr/exif-cleaner](https://huseyinacikgoz.com.tr/exif-cleaner)

#### Yerel Kurulum

```bash
# Depoyu klonlayın
git clone https://github.com/huseyinacikgoz/exif-cleaner.git
cd exif-cleaner

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim için derleyin
npm run build
```

#### 💻 CLI (Terminal) Kullanımı

Exif Cleaner artık terminalden de kullanılabilir! Linux, macOS ve Windows destekler.

```bash
# CLI dizinine geçin ve bağımlılıkları yükleyin
cd cli
npm install

# Global komut olarak kaydedin (artık her yerden 'exif-cleaner' yazarak kullanabilirsiniz)
sudo npm link

# Tek dosya temizle
exif-cleaner foto.jpg

# Klasördeki tüm görselleri temizle
exif-cleaner ./fotolar/

# Alt klasörlerle birlikte, özel çıkış dizinine
exif-cleaner ./fotolar/ -r -o ./temiz/

# Orijinal dosyaların üzerine yaz
exif-cleaner foto.jpg -w

# Detaylı çıktı ve Türkçe dil
exif-cleaner . -r -v --lang tr
```

**CLI Seçenekleri:**
| Seçenek | Açıklama |
|---------|----------|
| `-o, --output <dizin>` | Çıkış dizini |
| `-w, --overwrite` | Orijinal dosyaların üzerine yaz |
| `-r, --recursive` | Alt dizinleri de tara |
| `-l, --lang <dil>` | Dil seçimi (en veya tr) |
| `-v, --verbose` | Detaylı çıktı göster |
| `--check-update` | Manuel güncelleme kontrolü yap |

### 🛠️ Teknolojiler

- **React 19** - UI Çatısı
- **TypeScript** - Tip Güvenliği
- **Vite** - Derleme Aracı
- **Tailwind CSS v4** - Stilleme
- **Framer Motion** - Animasyonlar
- **piexifjs** - EXIF Temizleme
- **exifr** - EXIF Okuma
- **JSZip** - Toplu ZIP İndirme

### 📝 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

### 👨‍💻 Geliştirici

**Hüseyin Açıkgöz**

- 🌐 Websitesi: [huseyinacikgoz.com.tr](https://huseyinacikgoz.com.tr)
- 📧 E-posta: [mail@huseyinacikgoz.com.tr](mailto:mail@huseyinacikgoz.com.tr)
- 🐦 Twitter/X: [@huseyinacikgoz_](https://x.com/huseyinacikgoz_)
- 💻 GitHub: [@huseyinacikgoz](https://github.com/huseyinacikgoz)

### 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz!

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/harika-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik ekle'`)
4. Branch'inizi push edin (`git push origin feature/harika-ozellik`)
5. Pull Request açın

### 📊 Versiyon

**v1.0.4** - CLI (terminal) desteği eklendi — Linux, macOS ve Windows uyumlu

**v1.0.3** - PNG format desteği, SEO iyileştirmeleri ve kod optimizasyonları

**v1.0.2** - Sosyal medya paylaşım görseli (og:image) ve favicon güncellemeleri

**v1.0.1** - Performans iyileştirmeleri ve hata düzeltmeleri

**v1.0.0** - İlk sürüm

### 🔗 Bağlantılar

- [🌐 Canlı Demo](https://huseyinacikgoz.com.tr/exif-cleaner)
- [💻 GitHub Repo](https://github.com/huseyinacikgoz/exif-cleaner)
- [📧 İletişim](mailto:mail@huseyinacikgoz.com.tr)
- [🐦 Twitter/X](https://x.com/huseyinacikgoz_)

<div align="center">

**⭐ Beğendiyseniz yıldız vermeyi unutmayın! ⭐**

Made with ❤️ by [Hüseyin Açıkgöz](https://huseyinacikgoz.com.tr)

</div>

---

<a id="english"></a>

<div align="center">

<img src="public/favicon/android-chrome-512x512.png" width="96" height="96" alt="EXIF Cleaner Logo">

# EXIF Cleaner

**Remove Metadata from Your Photos and Documents - Protect Your Privacy**

[![Version](https://img.shields.io/badge/version-v1.0.4-black?style=flat-square)](https://huseyinacikgoz.com.tr/exif-cleaner/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-Live-green?style=flat-square)](https://huseyinacikgoz.com.tr/exif-cleaner/)

</div>

### 📖 About

A fast, secure, and privacy-focused tool to remove metadata (EXIF, GPS, device info) from your photos before sharing online. All processing happens locally in your browser - no data is ever uploaded to any server.

### ✨ Features

#### 🔒 Privacy First
- 100% local processing in your browser
- No images or metadata uploaded to any server
- No cookies, tracking, or analytics

#### 🎨 User Experience
- Beautiful light and dark themes
- Multi-language support (English & Turkish)
- Responsive design for desktop and mobile
- Smooth animations with Framer Motion

#### 📦 Batch Processing / Format Support
- Clean multiple images and documents at once
- **Images**: JPEG, PNG, WebP, TIFF
- **Documents**: PDF, DOCX, XLSX, PPTX
- **Text**: TXT, MD
- Download as ZIP file (Web)

### 🚀 Getting Started

#### Live Version
🌐 [huseyinacikgoz.com.tr/exif-cleaner](https://huseyinacikgoz.com.tr/exif-cleaner)

#### Local Installation

```bash
# Clone the repository
git clone https://github.com/huseyinacikgoz/exif-cleaner.git
cd exif-cleaner

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

#### 💻 CLI (Terminal) Usage

Exif Cleaner now works from the terminal! Supports Linux, macOS, and Windows.

```bash
# Navigate to CLI directory and install dependencies
cd cli
npm install

# Register as a global command (you can now use 'exif-cleaner' from anywhere)
sudo npm link

# Clean a single file
exif-cleaner photo.jpg

# Clean all images in a folder
exif-cleaner ./photos/

# Recursively with custom output directory
exif-cleaner ./photos/ -r -o ./cleaned/

# Overwrite original files
exif-cleaner photo.jpg -w

# Verbose output with English language
exif-cleaner . -r -v --lang en
```

**CLI Options:**
| Option | Description |
|--------|-------------|
| `-o, --output <dir>` | Output directory |
| `-w, --overwrite` | Overwrite original files |
| `-r, --recursive` | Process subdirectories recursively |
| `-l, --lang <lang>` | Language (en or tr) |
| `-v, --verbose` | Show detailed output |
| `--check-update` | Manually check for updates |

### 🛠️ Technologies

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **piexifjs** - EXIF Removal
- **exifr** - EXIF Reading
- **JSZip** - Batch ZIP Downloads

### 📝 License

This project is licensed under the [MIT License](LICENSE).

### 👨‍💻 Developer

**Hüseyin Açıkgöz**

- 🌐 Website: [huseyinacikgoz.com.tr](https://huseyinacikgoz.com.tr)
- 📧 Email: [mail@huseyinacikgoz.com.tr](mailto:mail@huseyinacikgoz.com.tr)
- 🐦 Twitter/X: [@huseyinacikgoz_](https://x.com/huseyinacikgoz_)
- 💻 GitHub: [@huseyinacikgoz](https://github.com/huseyinacikgoz)

### 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📊 Version

**v1.0.4** - CLI (terminal) support added — compatible with Linux, macOS, and Windows

**v1.0.3** - PNG format support, SEO improvements, and code optimizations

**v1.0.2** - Social media sharing image (og:image) and favicon updates

**v1.0.1** - Performance improvements and bug fixes

**v1.0.0** - Initial release

### 🔗 Links

- [🌐 Live Demo](https://huseyinacikgoz.com.tr/exif-cleaner)
- [💻 GitHub Repo](https://github.com/huseyinacikgoz/exif-cleaner)
- [📧 Contact](mailto:mail@huseyinacikgoz.com.tr)
- [🐦 Twitter/X](https://x.com/huseyinacikgoz_)

<div align="center">

**⭐ Don't forget to star if you like it! ⭐**

Made with ❤️ by [Hüseyin Açıkgöz](https://huseyinacikgoz.com.tr)

</div>
