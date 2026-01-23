import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import piexif from 'piexifjs';
import exifr from 'exifr';
import JSZip from 'jszip';
import { cleanWebP } from './utils/webpClean';

interface Metadata {
  Model?: string;
  Make?: string;
  DateTimeOriginal?: Date;
  ExposureTime?: number;
  FNumber?: number;
  ISO?: number;
  FocalLength?: number;
  latitude?: number;
  longitude?: number;
  Software?: string;
}

interface FileWithStatus {
  id: string;
  file: File;
  previewUrl: string;
  cleanedDataUrl: string | null;
  status: 'pending' | 'processing' | 'done' | 'error';
  metadata: Metadata | null;
}

const translations = {
  en: {
    metaTitle: "EXIF Cleaner - Remove Metadata from Your Photos Instantly",
    metaDesc: "Secure, fast, and free tool to scrub GPS and device data from your images before sharing online. Processed locally in your browser for maximum privacy.",
    title: "EXIF Cleaner",
    howItWorks: "How it works",
    heroTitle: "Remove Metadata from Your Photos",
    heroSubtitle: "Secure, fast, and free tool to scrub GPS and device data from your images before sharing online.",
    instantly: "Instantly",
    processedLocally: "Processed locally in your browser",
    dragDrop: "Drag & Drop images here",
    supports: "Supports JPEG, PNG, TIFF, WebP up to 20MB.",
    browseFiles: "Browse Files",
    cleanExif: "Clean EXIF Data",
    terms: "By uploading, you agree to our",
    tos: "Terms of Service",
    termsEnd: ".",
    whyClean: "Why Clean EXIF Data?",
    whyDesc: "Every photo you take contains hidden metadata. Cleaning it helps protect your digital footprint.",
    protectPrivacy: "Protect Privacy",
    protectPrivacyDesc: "Remove precise GPS coordinates, ensuring your home or work location remains private when sharing photos online.",
    hideDevice: "Hide Device Info",
    hideDeviceDesc: "Scrub details about your camera model, lens, shutter speed, and software settings from the image file.",
    reduceClutter: "Reduce Clutter",
    reduceClutterDesc: "Strip thumbnail data and proprietary maker notes, keeping your files clean and slightly reducing file size.",
    photoDetails: "Photo Details",
    gpsDetected: "GPS Data Detected",
    gpsDesc: "This data will be removed when you clean the image.",
    download: "Download Clean Photo",
    downloadMultiple: "Download Clean Photos (ZIP)",
    cleanNow: "Clean Now",
    privacyPolicy: "Privacy Policy",
    termsOfUse: "Terms of Use",
    footerText: "© 2026 EXIF Cleaner. Open source and privacy-focused.",
    cameraModel: "CAMERA MODEL",
    manufacturer: "MANUFACTURER",
    software: "SOFTWARE",
    iso: "ISO SPEED",
    exposure: "EXPOSURE",
    fstop: "F-STOP",
    coordinates: "Coordinates",
    close: "Close",
    theme: "Theme",
    metadataRemoved: "Metadata removed. Your privacy is now protected!",
    howItWorksContent: {
      title: "How It Works",
      steps: [
        "Select or drag & drop your photos into the upload area.",
        "The app extracts metadata locally (no data leaves your device).",
        "Click 'Clean EXIF Data' to remove all sensitive tags.",
        "Download your cleaned, privacy-safe image."
      ]
    },
    privacyPolicyContent: {
      title: "Privacy Policy",
      content: "EXIF Cleaner is built with privacy as its core mission. All image processing is done locally within your browser using JavaScript. No images or metadata are ever uploaded to any server. We do not collect cookies or personal information."
    },
    termsOfUseContent: {
      title: "Terms of Use",
      content: "This tool is provided 'as is' without any warranties. Users are responsible for ensuring they have the rights to the images they process. The output is for personal and professional use to enhance privacy."
    },
    fileSizeError: "Some files exceed 20MB and were skipped."
  },
  tr: {
    metaTitle: "EXIF Temizleyici - Fotoğraflarınızdaki Metadataları Anında Temizleyin",
    metaDesc: "Güvenli, hızlı ve ücretsiz EXIF temizleme aracı. Fotoğraflarınızdaki GPS, cihaz ve diğer gizli metadataları anında temizleyerek gizliliğinizi koruyun.",
    title: "EXIF Temizleyici",
    howItWorks: "Nasıl Çalışır?",
    heroTitle: "Fotoğraflarınızdaki Metadataları",
    heroSubtitle: "Görüntülerinizi çevrimiçi paylaşmadan önce GPS ve cihaz verilerini temizlemek için güvenli, hızlı ve ücretsiz bir araç.",
    instantly: "Anında Temizleyin",
    processedLocally: "Tarayıcınızda yerel olarak işlenir",
    dragDrop: "Görselleri buraya sürükleyin",
    supports: "JPEG, PNG, TIFF, WebP desteklenir (Maks 20MB).",
    browseFiles: "Dosyalara Göz At",
    cleanExif: "EXIF Verilerini Temizle",
    terms: "Yükleme yaparak, ",
    tos: "Kullanım Koşullarını",
    termsEnd: " kabul etmiş sayılırsınız.",
    whyClean: "Neden EXIF Verilerini Temizlemeli?",
    whyDesc: "Çektiğiniz her fotoğraf gizli metadatalar içerir. Bunları temizlemek dijital ayak izinizi korumanıza yardımcı olur.",
    protectPrivacy: "Gizliliği Koruyun",
    protectPrivacyDesc: "Hassas GPS koordinatlarını kaldırarak, fotoğrafları paylaşırken ev veya iş konumunuzun gizli kalmasını sağlayın.",
    hideDevice: "Cihaz Bilgisini Gizleyin",
    hideDeviceDesc: "Kamera modeli, lens, deklanşör hızı ve yazılım ayarları hakkındaki detayları temizleyin.",
    reduceClutter: "Dosya Boyutunu Azaltın",
    reduceClutterDesc: "Küçük resim verilerini ve özel üretici notlarını temizleyerek dosyalarınızı sadeleştirin.",
    photoDetails: "Fotoğraf Detayları",
    gpsDetected: "GPS Verisi Tespit Edildi",
    gpsDesc: "Bu veriler, görseli temizlediğinizde kaldırılacaktır.",
    download: "Temizlenmiş Görseli İndir",
    downloadMultiple: "Temizlenmiş Görselleri İndir (ZIP)",
    cleanNow: "Hemen Temizle",
    privacyPolicy: "Gizlilik Politikası",
    termsOfUse: "Kullanım Şartları",
    footerText: "© 2026 EXIF Temizleyici. Açık kaynak ve gizlilik odaklı.",
    cameraModel: "KAMERA MODELİ",
    manufacturer: "ÜRETİCİ",
    software: "YAZILIM",
    iso: "ISO HIZI",
    exposure: "POZLAMA",
    fstop: "F-DEĞERİ",
    coordinates: "Koordinatlar",
    close: "Kapat",
    theme: "Tema",
    metadataRemoved: "Meta verileriniz temizlendi. Artık güvendesiniz!",
    howItWorksContent: {
      title: "Nasıl Çalışır?",
      steps: [
        "Fotoğraflarınızı seçin veya sürükleyip bırakın.",
        "Uygulama metadataları yerel olarak çıkarır (cihazınızdan veri çıkmaz).",
        "'EXIF Verilerini Temizle' butonuna basarak tüm verileri silin.",
        "Temizlenmiş ve güvenli görselinizi indirin."
      ]
    },
    privacyPolicyContent: {
      title: "Gizlilik Politikası",
      content: "EXIF Temizleyici, gizlilik odaklı bir araçtır. Tüm işlemler tarayıcınızda yerel olarak çalışır. Görselleriniz veya metadataları hiçbir sunucuya yüklenmez. Çerez veya kişisel veri toplamıyoruz."
    },
    termsOfUseContent: {
      title: "Kullanım Şartları",
      content: "Bu araç, herhangi bir garanti verilmeksizin olduğu gibi sunulmaktadır. Kullanıcılar, işledikleri görsellerin haklarına sahip olmaktan sorumludur. Sonuçlar kişisel ve profesyonel gizliliği artırmak amaçlıdır."
    },
    fileSizeError: "Bazı dosyalar 20MB sınırını aştığı için atlandı."
  }
};

function App() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const fileListRef = useRef<HTMLDivElement>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeInfoModal, setActiveInfoModal] = useState<'howItWorks' | 'privacy' | 'terms' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'tr'>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved === 'en' || saved === 'tr') ? saved : 'tr';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const t = translations[lang];

  useEffect(() => {
    document.title = t.metaTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t.metaDesc);
    }
    const html = document.documentElement;
    html.lang = lang;
  }, [lang, t.metaTitle, t.metaDesc]);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const selectedFile = files.find(f => f.id === selectedFileId);

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const addFiles = async (newFiles: File[]) => {
    // Filter out files that exceed the maximum size
    const validFiles = newFiles.filter(file => file.size <= MAX_FILE_SIZE);
    const skippedCount = newFiles.length - validFiles.length;

    // Show toast if files were skipped
    if (skippedCount > 0) {
      setToast(t.fileSizeError);
      setTimeout(() => setToast(null), 4000);
    }

    const newEntries = await Promise.all(
      validFiles.map(async (file) => {
        let metadata = null;
        try {
          metadata = await exifr.parse(file, {
            pick: ['Make', 'Model', 'DateTimeOriginal', 'ExposureTime', 'FNumber', 'ISO', 'FocalLength', 'Software', 'GPSLatitude', 'GPSLongitude'],
            translateValues: true
          });
        } catch (e) {
          console.error('Metadata reading error:', e);
        }

        return {
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
          cleanedDataUrl: null,
          status: 'pending' as const,
          metadata
        };
      })
    );
    setFiles(prev => [...prev, ...newEntries]);

    // Auto show metadata if only one file added
    if (newEntries.length === 1) {
      setSelectedFileId(newEntries[0].id);
    } else if (newEntries.length > 1) {
      // Scroll to file list for batch uploads
      setTimeout(() => {
        fileListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/tiff' || f.type === 'image/webp'
    );
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter(
        f => f.type === 'image/jpeg' || f.type === 'image/png' || f.type === 'image/tiff' || f.type === 'image/webp'
      );
      addFiles(selected);
    }
  };

  const cleanExif = async () => {
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'processing' } : f));

    for (const item of files) {
      if (item.status !== 'pending') continue;

      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(item.file);
        });

        let cleanedDataUrl: string;
        try {
          if (item.file.type === 'image/webp') {
            const cleanedBlob = await cleanWebP(item.file);
            cleanedDataUrl = await new Promise<string>((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.readAsDataURL(cleanedBlob);
            });
          } else {
            cleanedDataUrl = piexif.remove(dataUrl);
          }
        } catch (error) {
          console.error('Cleaning error:', error);
          cleanedDataUrl = dataUrl;
        }

        setFiles(prev => prev.map(f =>
          f.id === item.id ? { ...f, cleanedDataUrl, status: 'done', metadata: null } : f
        ));
      } catch {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
      }
    }
  };

  const downloadFile = (f: FileWithStatus, shouldCloseModal = false) => {
    if (!f.cleanedDataUrl) return;
    const link = document.createElement('a');
    link.href = f.cleanedDataUrl;
    const parts = f.file.name.split('.');
    const ext = parts.pop();
    link.download = `${parts.join('.')}_cleaned.${ext}`;
    link.click();
    if (shouldCloseModal) setSelectedFileId(null);
  };

  const removeFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const fileToRevoke = prev.find(f => f.id === id);
      if (fileToRevoke) URL.revokeObjectURL(fileToRevoke.previewUrl);
      return filtered;
    });
    if (selectedFileId === id) setSelectedFileId(null);
  };

  const downloadAll = async () => {
    const doneFiles = files.filter(f => f.status === 'done' && f.cleanedDataUrl);
    if (doneFiles.length === 0) return;

    if (doneFiles.length === 1) {
      downloadFile(doneFiles[0]);
      return;
    }

    const zip = new JSZip();
    for (const f of doneFiles) {
      const base64Data = f.cleanedDataUrl!.split(',')[1];
      zip.file(`cleaned_${f.file.name}`, base64Data, { base64: true });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = "cleaned_photos.zip";
    link.click();
  };

  const toggleLang = () => {
    setLang(prev => prev === 'tr' ? 'en' : 'tr');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-text-main-light dark:text-text-main-dark transition-colors duration-300">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-red-600 text-white rounded-xl shadow-lg font-medium text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">warning</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border-light dark:border-border-dark bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 sm:px-10 py-3">
        <div className="flex items-center justify-between mx-auto max-w-[1200px]">
          <div className="flex items-center gap-3">
            <img src="./favicon/apple-touch-icon.png" alt="Logo" className="size-8 rounded-lg" />
            <h2 className="text-xl font-bold tracking-tight">{t.title}</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => setActiveInfoModal('howItWorks')}
              className="hidden sm:flex items-center gap-2 cursor-pointer text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span>{t.howItWorks}</span>
            </button>
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 cursor-pointer text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors uppercase"
            >
              <span className="material-symbols-outlined text-[20px]">language</span>
              <span className="w-6 text-center">{lang}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 cursor-pointer text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
              <span className="hidden xs:inline">{t.theme}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start py-12 px-6 sm:px-8 overflow-x-hidden">
        <div className="w-full max-w-[960px] flex flex-col items-center gap-8 overflow-hidden">
          {/* Hero Text */}
          <div className="text-center w-full px-2 flex flex-col gap-4">
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
              {t.heroTitle} <span className="text-primary">{t.instantly}</span>
            </h1>
            <p className="text-base sm:text-lg text-text-secondary-light dark:text-text-secondary-dark font-normal px-2">
              {t.heroSubtitle}
            </p>
            {/* Privacy Badge */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                {t.processedLocally}
              </span>
            </div>
          </div>

          {/* Upload Zone & Actions */}
          <div className="w-full mt-6">
            <div className="flex flex-col bg-card-light dark:bg-card-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 sm:p-10 transition-colors">
              {/* Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`group relative flex flex-col items-center justify-center w-full min-h-[16rem] border-2 border-dashed ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-border-dark bg-white/90 dark:bg-background-dark/30'} hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl transition-all cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/5`}
              >
                <div className="flex flex-col items-center gap-4 text-center p-4">
                  <div className="w-20 h-20 flex items-center justify-center bg-white dark:bg-card-dark rounded-full shadow-sm text-primary group-hover:scale-110 transition-transform border border-border-light dark:border-border-dark">
                    <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold">{t.dragDrop}</p>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                      {t.supports}
                    </p>
                  </div>
                  <label
                    htmlFor="fileInput"
                    className="mt-2 flex items-center justify-center rounded-lg h-9 px-4 bg-white dark:bg-[#2d3b4a] border border-border-light dark:border-border-dark text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#37485a] transition-colors cursor-pointer"
                  >
                    {t.browseFiles}
                  </label>
                </div>
                <input
                  id="fileInput"
                  accept="image/png, image/jpeg, image/tiff, image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  multiple
                  type="file"
                  onChange={handleFileSelect}
                />
              </div>

              <div ref={fileListRef} className="scroll-mt-10" />

              {/* File List */}
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 space-y-3 overflow-hidden"
                  >
                    {files.map(f => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFileId(f.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${selectedFileId === f.id ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' : 'border-border-light dark:border-border-dark hover:border-primary/30 hover:bg-background-light/50 dark:hover:bg-background-dark/30'}`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <img src={f.previewUrl} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-background-light dark:bg-background-dark flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate">{f.file.name}</p>
                            <p className="text-[10px] sm:text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium">{(f.file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {f.status === 'done' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); downloadFile(f); }}
                              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedFileId(f.id); }}
                            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-primary/10 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg sm:text-xl">info</span>
                          </button>
                          {f.status === 'processing' && <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                          <button
                            onClick={(e) => removeFile(e, f.id)}
                            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-text-secondary-light dark:text-text-secondary-dark hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg sm:text-xl">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="pt-6 flex flex-col items-center gap-3">
                      <button
                        onClick={() => {
                          if (files.some(f => f.status === 'done') && !files.some(f => f.status === 'pending')) {
                            downloadAll();
                          } else {
                            cleanExif();
                          }
                        }}
                        disabled={!files.some(f => f.status === 'pending') && !files.some(f => f.status === 'done')}
                        className={`flex w-full max-w-[320px] cursor-pointer items-center justify-center rounded-xl h-12 px-6 transition-all active:scale-95 text-base font-bold shadow-lg gap-2 ${files.some(f => f.status === 'done')
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                          : 'bg-primary hover:bg-primary-hover text-white shadow-primary/20 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:shadow-none disabled:cursor-not-allowed'
                          }`}
                      >
                        <span className="material-symbols-outlined">
                          {files.some(f => f.status === 'done') && !files.some(f => f.status === 'pending') ? 'download' : 'auto_fix_high'}
                        </span>
                        <span>
                          {files.some(f => f.status === 'done') && !files.some(f => f.status === 'pending')
                            ? (files.filter(f => f.status === 'done').length > 1 ? t.downloadMultiple : t.download)
                            : t.cleanExif}
                        </span>
                      </button>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center">
                        {t.terms} <button onClick={() => setActiveInfoModal('terms')} className="underline cursor-pointer hover:text-primary">{t.tos}</button>{t.termsEnd}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Features Section */}
          <div className="w-full mt-12 grid gap-10">
            <div className="flex flex-col items-center text-center gap-4 mb-4">
              <h2 className="text-3xl font-bold">{t.whyClean}</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-[600px]">
                {t.whyDesc}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon="lock"
                title={t.protectPrivacy}
                desc={t.protectPrivacyDesc}
                colorClasses="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              />
              <FeatureCard
                icon="smartphone"
                title={t.hideDevice}
                desc={t.hideDeviceDesc}
                colorClasses="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
              />
              <FeatureCard
                icon="compress"
                title={t.reduceClutter}
                desc={t.reduceClutterDesc}
                colorClasses="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Metadata Modal */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFileId(null)}
              className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl overflow-hidden border border-border-light dark:border-border-dark"
            >
              <div className="p-6 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">info</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg leading-none">{t.photoDetails}</h2>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 truncate max-w-[200px]">{selectedFile.file.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFileId(null)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-background-light dark:hover:bg-background-dark rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">close</span>
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {selectedFile.status === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-4 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <span className="material-symbols-outlined font-bold">check_circle</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      {t.metadataRemoved}
                    </p>
                  </motion.div>
                )}
                <img src={selectedFile.previewUrl} className="w-full h-48 object-contain bg-background-light dark:bg-background-dark rounded-xl mb-6 shadow-inner" />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <DetailItem label={t.cameraModel} value={selectedFile.metadata?.Model} icon="camera" />
                    <DetailItem label={t.manufacturer} value={selectedFile.metadata?.Make} icon="factory" />
                    <DetailItem label={t.software} value={selectedFile.metadata?.Software} icon="terminal" />
                  </div>
                  <div className="space-y-4">
                    <DetailItem label={t.iso} value={selectedFile.metadata?.ISO?.toString()} icon="exposure" />
                    <DetailItem label={t.exposure} value={selectedFile.metadata?.ExposureTime ? `1/${Math.round(1 / selectedFile.metadata.ExposureTime)}s` : undefined} icon="shutter_speed" />
                    <DetailItem label={t.fstop} value={selectedFile.metadata?.FNumber ? `f/${selectedFile.metadata.FNumber}` : undefined} icon="filter_tilt_shift" />
                  </div>
                </div>

                {selectedFile.metadata?.latitude && (
                  <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                    <h3 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm mb-2">
                      <span className="material-symbols-outlined text-lg">location_on</span>
                      {t.gpsDetected}
                    </h3>
                    <p className="text-red-800 dark:text-red-300 text-xs">
                      {t.coordinates}: {selectedFile.metadata.latitude.toFixed(6)}, {selectedFile.metadata.longitude?.toFixed(6)}
                    </p>
                    <p className="text-red-500 dark:text-red-400/80 text-[10px] mt-2 font-medium">{t.gpsDesc}</p>
                  </div>
                )}
              </div>

              <div className="p-6 bg-background-light dark:bg-background-dark border-t border-border-light dark:border-border-dark flex gap-4">
                <button
                  onClick={() => {
                    if (selectedFile.status === 'done') downloadFile(selectedFile, true);
                    else cleanExif();
                  }}
                  className={`flex-1 h-12 font-bold rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 ${selectedFile.status === 'done'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 dark:shadow-none'
                    : 'bg-primary text-white hover:bg-primary-hover shadow-primary/20'
                    }`}
                >
                  <span className="material-symbols-outlined">
                    {selectedFile.status === 'done' ? 'download' : 'auto_fix_high'}
                  </span>
                  <span>{selectedFile.status === 'done' ? t.download : t.cleanNow}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence >

      {/* Footer */}
      <footer className="w-full py-8 border-t border-border-light dark:border-border-dark mt-auto bg-card-light dark:bg-card-dark">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {t.footerText}
          </p>
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveInfoModal('privacy')} className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors cursor-pointer">{t.privacyPolicy}</button>
            <button onClick={() => setActiveInfoModal('terms')} className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors cursor-pointer">{t.termsOfUse}</button>
            <div className="flex gap-2">
              <a aria-label="Github" className="flex items-center gap-1 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors text-sm" href="https://github.com/huseyinacikgoz/exif-cleaner" target="_blank" rel="noopener noreferrer">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.008-.069-.008.1.015 1.012.984 1.012.984.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      <AnimatePresence>
        {
          activeInfoModal && (
            <GenericModal
              onClose={() => setActiveInfoModal(null)}
              title={
                activeInfoModal === 'howItWorks' ? t.howItWorksContent.title :
                  activeInfoModal === 'privacy' ? t.privacyPolicyContent.title :
                    t.termsOfUseContent.title
              }
            >
              {activeInfoModal === 'howItWorks' ? (
                <ul className="space-y-4">
                  {t.howItWorksContent.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-4 items-start">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed">
                  {activeInfoModal === 'privacy' ? t.privacyPolicyContent.content : t.termsOfUseContent.content}
                </p>
              )}
              <div className="mt-8">
                <button
                  onClick={() => setActiveInfoModal(null)}
                  className="w-full h-11 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </GenericModal>
          )}
      </AnimatePresence>
    </div>
  );
}

function GenericModal({ children, title, onClose }: { children: React.ReactNode, title: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background-dark/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl overflow-hidden border border-border-light dark:border-border-dark p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-background-light dark:hover:bg-background-dark rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">close</span>
          </button>
        </div>
        <div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, colorClasses }: { icon: string, title: string, desc: string, colorClasses: string }) {
  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:shadow-lg hover:shadow-primary/5 transition-all group">
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${colorClasses} group-hover:scale-110 transition-transform`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string, value?: string, icon?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark tracking-wider uppercase">{label}</p>
      <div className="flex items-center gap-2 text-[12px] font-medium text-text-main-light dark:text-text-main-dark">
        {icon && <span className="material-symbols-outlined text-primary text-[14px] opacity-60">{icon}</span>}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

export default App;
