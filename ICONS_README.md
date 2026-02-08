# Создание иконок для PWA

## Размеры иконок (все необходимые)

### Основные иконки:
- `icon-72.png` — Android
- `icon-96.png` — Android
- `icon-128.png` — Chrome
- `icon-144.png` — Windows
- `icon-152.png` — iOS iPad
- `icon-167.png` — iOS iPad Pro
- `icon-180.png` — iOS iPhone (главная)
- `icon-192.png` — Android/PWA
- `icon-384.png` — Android
- `icon-512.png` — PWA

### Splash screens (iOS):
- `splash-640x1136.png` — iPhone SE
- `splash-750x1334.png` — iPhone 8
- `splash-828x1792.png` — iPhone XR
- `splash-1125x2436.png` — iPhone X/XS
- `splash-1242x2688.png` — iPhone XS Max
- `splash-1536x2048.png` — iPad
- `splash-1668x2224.png` — iPad Pro 10.5"
- `splash-2048x2732.png` — iPad Pro 12.9"

## Создание иконок

### Вариант 1: Онлайн-генераторы
1. https://appicon.co/ — загрузить PNG 1024x1024, скачать архив
2. https://pwa-asset-generator.nicepkg.cn/ — генерирует и иконки и splash

### Вариант 2: Figma/Photoshop
- Создать квадрат 1024x1024
- Фон: градиент #667eea → #764ba2
- Иконка: 🚌 (emoji) или SVG автобуса
- Экспортировать в PNG

### Вариант 3: CLI (ImageMagick)
```bash
# Если есть исходник icon-1024.png
convert icon-1024.png -resize 72x72 icon-72.png
convert icon-1024.png -resize 96x96 icon-96.png
# ... и так далее
```

## Splash screen генерация

```bash
# Установить pwa-asset-generator
npm install -g pwa-asset-generator

# Сгенерировать всё
pwa-asset-generator icon-1024.png ./ --splash-only --background "linear-gradient(#667eea, #764ba2)"
```

## Проверка

После добавления иконок проверить:
1. https://realfavicongenerator.net/ — валидатор иконок
2. Chrome DevTools → Lighthouse → PWA
3. Safari iOS → Поделиться → На экран Домой
