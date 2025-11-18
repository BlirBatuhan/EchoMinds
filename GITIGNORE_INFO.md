# 🚫 .gitignore Yapılandırması

## 📁 .gitignore Dosyaları

Proje 3 seviyeli .gitignore yapısı kullanır:

```
Proje/
├── .gitignore                    # Root seviye (genel kurallar)
├── VoiceAIApp/.gitignore        # React Native kuralları
└── voice_ai_api/.gitignore      # Ruby on Rails kuralları
```

---

## 🎯 1. Root .gitignore

**Konum:** `/.gitignore`

**Kapsam:** Tüm proje için genel kurallar

### İçerik:
- OS dosyaları (.DS_Store, Thumbs.db)
- Editor dosyaları (.vscode, .idea)
- Environment files (.env)
- Log dosyaları (*.log)
- Geçici dosyalar (*.tmp)
- Database dosyaları (*.sqlite3)

---

## 📱 2. VoiceAIApp .gitignore

**Konum:** `/VoiceAIApp/.gitignore`

**Kapsam:** React Native + Expo mobil uygulaması

### Orijinal Kurallar (Korundu):
- `node_modules/` - NPM bağımlılıkları
- `.expo/` - Expo cache
- `dist/`, `web-build/` - Build çıktıları
- `/ios`, `/android` - Native klasörler
- `*.jks`, `*.p8`, `*.p12` - Keystore dosyaları
- `*.tsbuildinfo` - TypeScript build info

### Eklenen Kurallar:
- `.env`, `.env.local`, `.env.production` - Environment dosyaları
- `config.local.ts` - Local API konfigürasyonu
- `.vscode/`, `.idea/` - Editor klasörleri
- `.DS_Store`, `Thumbs.db` - OS dosyaları
- `coverage/` - Test coverage
- `*.log` - Log dosyaları

---

## 🔴 3. voice_ai_api .gitignore

**Konum:** `/voice_ai_api/.gitignore`

**Kapsam:** Ruby on Rails 8 backend API

### Orijinal Rails Kurallar (Korundu):
- `/.bundle` - Bundler config
- `/.env*` - Environment files
- `/log/*`, `/tmp/*` - Loglar ve temp
- `/storage/*` - Uploaded files
- `/config/master.key` - Master key

### Eklenen Extended Kurallar:

#### SQLite3 Databases
```
*.sqlite3
*.sqlite3-*
/db/*.sqlite3
/db/*.sqlite3-journal
```

#### Rails Cache & Temp
```
/tmp/cache/
/tmp/pids/
/public/assets/
/public/packs/
```

#### Rails Credentials
```
/config/credentials.yml.enc
/config/credentials/*.key
```

#### Environment Files
```
.env
.env.*
!.env.example
.envrc
```

#### Ruby Version Managers
```
.ruby-version
.ruby-gemset
.rvmrc
.rbenv-version
```

#### Bundler
```
/vendor/bundle/
/.bundle
Gemfile.lock
```

#### IDEs
```
/.idea          # RubyMine
*.iml
.vscode/        # VS Code
```

#### OS Files
```
.DS_Store       # macOS
Thumbs.db       # Windows
*~              # Linux
```

#### Node Modules (Webpacker)
```
/node_modules/
package-lock.json
yarn.lock
```

#### Test Coverage
```
/coverage/
/.rspec_status
/.resultset.json
```

#### Rails 8 Specific
```
/.kamal/secrets     # Kamal secrets
/tmp/solid_queue_*  # Solid Queue
/tmp/cache/bootsnap*
```

#### API Keys & Secrets (IMPORTANT!)
```
/config/secrets.yml
api_keys.txt
credentials.txt
```

#### Temp Scripts
```
show_db.rb
test_*.rb
scratch_*.rb
```

---

## 🔒 Güvenlik Önlemleri

### ⚠️ Asla Git'e Eklenmemesi Gerekenler:

#### Backend (Rails)
- ❌ `/config/master.key` - Rails master key
- ❌ `.env` dosyaları - API keys, secrets
- ❌ `/config/secrets.yml` - Secret configuration
- ❌ `*.sqlite3` - Development database
- ❌ `/log/*.log` - Log dosyaları (sensitive data içerebilir)

#### Mobile (React Native)
- ❌ `config.ts` - API token içeriyor
- ❌ `.env` dosyaları - Environment secrets
- ❌ `*.jks`, `*.p8`, `*.p12` - Keystore files
- ❌ `*.mobileprovision` - iOS provisioning profiles

---

## ✅ Git'e Eklenebilecek Dosyalar

### Template Dosyaları
- ✅ `.env.example` - Environment template (secrets olmadan)
- ✅ `config.example.ts` - Config template
- ✅ `database.yml` - Database template (default values)

### Dokümantasyon
- ✅ `README.md` - Proje dökümantasyonu
- ✅ `*.md` dosyaları - Markdown dökümantasyon
- ✅ Postman collections - API test dosyaları

### Kod
- ✅ Tüm kaynak kod dosyaları
- ✅ Migration dosyaları
- ✅ Seeds dosyası (test data)
- ✅ Routes, models, controllers

---

## 📝 .env.example Oluşturma

### Backend için:
```bash
cd voice_ai_api
cat > .env.example << EOF
# D-ID Configuration
D_ID_API_KEY=your_d_id_api_key_here
ELEVEN_LABS_API_KEY=your_eleven_labs_key_here

# AssemblyAI Configuration
ASSEMBLY_AI_API_KEY=your_assembly_ai_key_here

# Rails Configuration
RAILS_ENV=development
RAILS_MAX_THREADS=5
EOF
```

### Mobile için:
```bash
cd VoiceAIApp
cat > config.example.ts << EOF
// API Configuration Template
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  API_TOKEN: 'YOUR_API_TOKEN_HERE',
  TIMEOUT: 30000,
};
EOF
```

---

## 🔍 Kontrol Komutları

### Hangi Dosyalar İgnore Ediliyor?
```bash
git status --ignored
```

### Belirli Bir Dosya İgnore mi?
```bash
git check-ignore -v file.txt
```

### İgnore Edilen Dosyaları Listele
```bash
git ls-files --ignored --exclude-standard
```

---

## 🧹 Git Cache Temizleme

Eğer .gitignore'a sonradan eklenen dosyalar varsa:

```bash
# Tüm dosyaları cache'ten kaldır
git rm -r --cached .

# .gitignore'a göre tekrar ekle
git add .

# Commit et
git commit -m "Update .gitignore and remove tracked files"
```

---

## 📊 .gitignore İstatistikleri

| Dosya | Satır Sayısı | Kapsam |
|-------|-------------|--------|
| `/.gitignore` | ~90 | Genel |
| `/VoiceAIApp/.gitignore` | ~105 | React Native |
| `/voice_ai_api/.gitignore` | ~195 | Rails + Extended |
| **Toplam** | **~390** | Full Stack |

---

## 🎯 Önemli Notlar

1. **Environment Files**: Tüm .env dosyaları ignore edilir, sadece .env.example tutulur
2. **Database Files**: SQLite3 dosyaları ignore edilir (development data)
3. **Logs**: Tüm log dosyaları ignore edilir
4. **API Keys**: Hiçbir API key veya secret git'e eklenmez
5. **Dependencies**: node_modules ve vendor klasörleri ignore edilir
6. **Build Artifacts**: Build çıktıları ignore edilir

---

## ✅ Checklist

Yeni bir geliştirici projeyi clone ettiğinde:

- [ ] `.env.example`'dan `.env` oluştur
- [ ] API token'larını `.env`'ye ekle
- [ ] `config.example.ts`'den `config.ts` oluştur (mobile)
- [ ] Backend: `bundle install`
- [ ] Backend: `rails db:create db:migrate db:seed`
- [ ] Mobile: `npm install`
- [ ] Git'e commit yaparken `.env` ve secrets'ların eklenmediğini kontrol et

---

## 🆘 Sorun Giderme

### .env Dosyası Yanlışlıkla Commit Edildi?

```bash
# Dosyayı git history'den kaldır
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch voice_ai_api/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (dikkatli!)
git push origin --force --all
```

### Sensitive Data Leak?
1. Hemen API key'leri yenile/revoke et
2. Git history'den temizle (yukarıdaki komut)
3. `.gitignore`'a eklendiğinden emin ol
4. Yeni key'lerle devam et

---

## 📚 Kaynaklar

- [GitHub .gitignore Templates](https://github.com/github/gitignore)
- [Rails .gitignore Best Practices](https://github.com/github/gitignore/blob/main/Rails.gitignore)
- [React Native .gitignore](https://github.com/github/gitignore/blob/main/ReactNative.gitignore)
- [Expo .gitignore](https://docs.expo.dev/guides/using-git/)

---

**Güvenlik her zaman önce!** 🔒 Sensitive data'yı asla git'e eklemeyin!

