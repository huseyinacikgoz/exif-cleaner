# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-23

### Fixed
- Updated favicon and manifest configuration for better PWA and browser support
- Fixed missing social media share images pointing to incorrect paths
- Optimized manifest icons for Android Chrome

## [1.0.0] - 2026-01-23

### Added
- Initial release of EXIF Cleaner
- Drag & drop file upload support
- Multi-file batch processing
- EXIF metadata extraction and display (Camera Model, ISO, Exposure, GPS, etc.)
- One-click metadata removal using `piexifjs`
- ZIP download for multiple cleaned images
- Light/Dark theme toggle with system preference detection
- Multi-language support (English & Turkish)
- Responsive design for desktop and mobile
- Informational modals (How it works, Privacy Policy, Terms of Use)
- 20MB file size limit enforcement
- Secure UUID generation with `crypto.randomUUID()`

### Security
- All processing happens locally in the browser - no data uploaded to server
- Added `rel="noopener noreferrer"` to external links for tabnabbing prevention
- File size validation (20MB limit)
- No cookies, tracking, or analytics

### Technical
- Built with React 19, TypeScript, Vite 7
- Styled with Tailwind CSS v4
- Animations powered by Framer Motion
- EXIF reading with `exifr`, removal with `piexifjs`
- Batch ZIP creation with `JSZip`

---

## [Unreleased]

### Planned
- WebP/HEIC format support
- PWA / Service Worker for offline use
- Code splitting for reduced bundle size
- User-selectable metadata cleaning options
- Web Worker for non-blocking EXIF processing
