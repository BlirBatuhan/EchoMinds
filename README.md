# 🎤 Voice AI Assistant

<div align="center">

![Voice AI Assistant](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)
![Expo](https://img.shields.io/badge/Expo-~54.0.13-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-blue.svg)
![Deepgram](https://img.shields.io/badge/Deepgram-Speech%20to%20Text-green.svg)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-Text%20to%20Speech-purple.svg)

**Modern AI destekli ses asistanı uygulaması**

[🚀 Özellikler](#-özellikler) • [📱 Kurulum](#-kurulum) • [⚙️ Yapılandırma](#️-yapılandırma) • [🎯 Kullanım](#-kullanım) • [🔧 API Anahtarları](#-api-anahtarları)

</div>

---

## 🌟 Özellikler

### 🎙️ Speech-to-Text (Ses-Metin)
- **Deepgram AI** ile yüksek doğrulukta ses tanıma
- **Çoklu dil desteği** (Türkçe, İngilizce, İspanyolca, Fransızca, Almanca ve daha fazlası)
- **Otomatik dil tespiti** özelliği
- **Gerçek zamanlı transkripsiyon** geçmişi
- **Güven skoru** gösterimi

### 🔊 Text-to-Speech (Metin-Ses)
- **ElevenLabs AI** ile doğal ses sentezi
- **Çoklu ses seçenekleri** (kendi seslerinizi de ekleyebilirsiniz)
- **Yüksek kaliteli ses çıktısı**
- **Ses ayarları** (stabilite, benzerlik)

### 🔄 Voice Conversion (Ses Dönüştürme)
- **Ses → Metin → Ses** dönüşümü
- **Gerçek zamanlı ses işleme**
- **Seçilen sese dönüştürme**

### 🎨 Modern UI/UX
- **Dark/Light Mode** desteği
- **Responsive tasarım**
- **Kullanıcı dostu arayüz**
- **Gerçek zamanlı durum göstergeleri**

---

## 📱 Kurulum

### Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn
- Expo CLI
- iOS Simulator veya Android Emulator (veya fiziksel cihaz)

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/BlirBatuhan/EchoMinds.git
cd EchoMinds/VoiceAIApp
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
# veya
yarn install
```

3. **Expo CLI'yi yükleyin** (eğer yüklü değilse)
```bash
npm install -g @expo/cli
```

4. **Uygulamayı başlatın**
```bash
npm start
# veya
expo start
```

---

## ⚙️ Yapılandırma

### API Anahtarları

Uygulamayı kullanabilmek için aşağıdaki API anahtarlarına ihtiyacınız var:

#### 🔑 Deepgram API Key
1. [Deepgram](https://deepgram.com) hesabı oluşturun
2. API anahtarınızı alın
3. Uygulamada Settings > Deepgram API Key bölümüne girin

#### 🎭 ElevenLabs API Key
1. [ElevenLabs](https://elevenlabs.io) hesabı oluşturun
2. API anahtarınızı alın
3. Uygulamada Settings > ElevenLabs API Key bölümüne girin

---

## 🎯 Kullanım

### 🎙️ Ses Kaydetme ve Transkripsiyon

1. **Kayıt Başlat**: "Start Recording" butonuna basın
2. **Konuşun**: Mikrofona konuşun
3. **Kayıt Durdur**: "Stop Recording" butonuna basın
4. **Transkripsiyon**: "Transcribe Audio" butonuna basın
5. **Sonuç**: Transkripsiyon geçmişte görüntülenir

### 🔊 Metin-Ses Dönüştürme

1. **Metin Girin**: Text-to-Speech bölümüne metin yazın
2. **Ses Seçin**: Settings'ten istediğiniz sesi seçin
3. **Konuştur**: "Speak Text" butonuna basın

### 🔄 Ses Dönüştürme

1. **Ses Kaydedin**: Önce bir ses kaydedin
2. **Hedef Ses Seçin**: Dönüştürmek istediğiniz sesi seçin
3. **Dönüştür**: "Start Voice Conversion" butonuna basın
4. **Dinle**: Dönüştürülen sesi dinleyin

---

## 🔧 API Anahtarları

### Deepgram API
```typescript
// Desteklenen diller
const supportedLanguages = [
  'auto', 'en-US', 'en-GB', 'tr-TR', 'es-ES', 
  'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'ru-RU',
  'ja-JP', 'ko-KR', 'zh-CN', 'ar-SA', 'hi-IN'
];
```

### ElevenLabs API
```typescript
// Ses ayarları
const voiceSettings = {
  stability: 0.5,
  similarity_boost: 0.5
};
```

---

## 📁 Proje Yapısı

```
VoiceAIApp/
├── App.tsx                 # Ana uygulama bileşeni
├── services/
│   ├── DeepgramService.ts  # Deepgram API servisi
│   └── ElevenLabsService.ts # ElevenLabs API servisi
├── assets/                 # Uygulama varlıkları
├── package.json           # Proje bağımlılıkları
└── README.md             # Bu dosya
```

---

## 🛠️ Teknolojiler

- **React Native** - Mobil uygulama framework'ü
- **Expo** - Geliştirme platformu
- **TypeScript** - Tip güvenli JavaScript
- **Deepgram** - AI destekli ses tanıma
- **ElevenLabs** - AI destekli ses sentezi
- **Expo AV** - Ses kayıt ve oynatma

---

## 🎨 Ekran Görüntüleri

<div align="center">

| Ana Ekran | Ayarlar | Ses Dönüştürme |
|-----------|---------|----------------|
| ![Ana Ekran](assets/screenshot-main.png) | ![Ayarlar](assets/screenshot-settings.png) | ![Ses Dönüştürme](assets/screenshot-conversion.png) |

</div>

---

## 🚀 Gelecek Özellikler

- [ ] **Ses klonlama** özelliği
- [ ] **Çoklu dil desteği** genişletme
- [ ] **Ses efektleri** ekleme
- [ ] **Bulut senkronizasyonu**
- [ ] **Ses kalitesi ayarları**
- [ ] **Toplu işlem** desteği

---

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Batuhan**
- GitHub: [@BlirBatuhan](https://github.com/BlirBatuhan)
- Proje: [EchoMinds](https://github.com/BlirBatuhan/EchoMinds)

---

## 🙏 Teşekkürler

- [Deepgram](https://deepgram.com) - Harika Speech-to-Text API'si için
- [ElevenLabs](https://elevenlabs.io) - Muhteşem Text-to-Speech API'si için
- [Expo](https://expo.dev) - Geliştirme kolaylığı için
- [React Native](https://reactnative.dev) - Güçlü mobil framework için

---

<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Made with ❤️ by [Batuhan](https://github.com/BlirBatuhan)

</div>
