# DEPLOYMENT.md — Production VPS Setup Guide

**Cel:** wdrożyć Catering Śląski na czystym VPS Ubuntu 22.04 LTS w **~90 minut**.

---

## Część 1: Co Ty (właściciel) musisz zrobić ZANIM zaczniesz

### Krok 1.1 — Wynajmij VPS (15 min)

Polecam **Hetzner Cloud** lub **OVHcloud Polska**. Specyfikacja minimalna:

| Parametr | Wartość |
|---|---|
| OS | Ubuntu 22.04 LTS |
| CPU | 4 vCPU |
| RAM | 16 GB |
| Dysk | 160 GB SSD/NVMe |
| Lokalizacja | DE (Falkenstein) lub PL (Warszawa) |
| Network | publiczne IPv4 + IPv6 |
| Koszt | ~25-35 EUR/mies |

**Konkretne rekomendacje:**
- **Hetzner CCX23**: 4 vCPU (dedykowane), 16 GB RAM, 160 GB NVMe, ~30 EUR/mies — **rekomendacja #1**
- **OVH VPS Comfort**: 4 vCPU, 16 GB RAM, 160 GB SSD, ~28 EUR/mies — alternatywa PL
- **DigitalOcean Premium 4vCPU/16GB**: ~48 USD/mies — opcjonalnie

Po wynajęciu zapisz sobie:
- **IP serwera**: __.__.__.__
- **Root SSH password** (lub klucz SSH dodany)

### Krok 1.2 — Domena i DNS (10 min)

W panelu domeny **cateringslaski.pl** (Twojego rejestratora — OVH/Home.pl/Hostido/itd.) dodaj 4 rekordy A:

| Subdomena | Typ | Wartość |
|---|---|---|
| (pusta — root) | A | IP_VPS |
| www | A | IP_VPS |
| api | A | IP_VPS |
| admin | A | IP_VPS |

TTL: 3600 (1h). Propagacja DNS zwykle 5-30 min — sprawdź na [whatsmydns.net](https://whatsmydns.net).

### Krok 1.3 — Konta zewnętrzne i klucze (45 min, można rozłożyć)

Załóż konta i zbierz API keys (wpiszesz je później w `.env`). Pełna lista w [ENVIRONMENT.md](./ENVIRONMENT.md). Krytyczne na start:

- ☐ **GitHub** — repozytorium platformy
- ☐ **Stripe** ([stripe.com](https://stripe.com)) — założyć rachunek PL, włączyć BLIK
- ☐ **Mapbox** ([mapbox.com](https://mapbox.com)) — token publiczny + sekretny
- ☐ **Anthropic** ([console.anthropic.com](https://console.anthropic.com)) — API key dla Claude
- ☐ **Resend** ([resend.com](https://resend.com)) — email + verify domain cateringslaski.pl
- ☐ **SMSAPI** ([smsapi.pl](https://smsapi.pl)) — token + sender ID approval
- ☐ **Fakturownia** ([fakturownia.pl](https://fakturownia.pl)) — token API

### Krok 1.4 — Webhook contracts z ops team (45 min)

Tych 3 systemów istnieją u Was. Z każdym ops team uzgodnij:
- URL endpointu (gdzie wysyłamy webhook out)
- HMAC shared secret (32+ chars losowych)
- Czy będą wysyłać webhook IN do nas (status updates)

Wstaw te 3× URL+SECRET do `.env` jako:
```
WEBHOOK_PRODUCTION_URL=https://...
WEBHOOK_PRODUCTION_SECRET=...
WEBHOOK_LOGISTICS_URL=...
WEBHOOK_LOGISTICS_SECRET=...
WEBHOOK_BILLING_URL=...
WEBHOOK_BILLING_SECRET=...
```

---

## Część 2: Setup VPS (45 min)

### Krok 2.1 — Pierwsze logowanie i hardening (10 min)

```bash
# Z lokalnego komputera
ssh root@IP_VPS

# Update + upgrade
apt update && apt upgrade -y

# Create non-root user 'cs' (catering-slaski)
adduser cs
usermod -aG sudo cs

# Skopiuj swój klucz SSH do nowego użytkownika
rsync --archive --chown=cs:cs ~/.ssh /home/cs

# Zaloguj się jako cs
exit
ssh cs@IP_VPS

# Wyłącz logowanie root + password auth
sudo nano /etc/ssh/sshd_config
# Zmień:
#   PasswordAuthentication no
#   PermitRootLogin no
sudo systemctl restart sshd

# Firewall (UFW)
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# fail2ban dla ochrony SSH
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### Krok 2.2 — Instalacja Docker (5 min)

```bash
# Official Docker install
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker cs

# Reloguj się żeby grupa się załapała
exit
ssh cs@IP_VPS

# Test
docker --version
docker compose version
```

### Krok 2.3 — Klonowanie repo (5 min)

```bash
# Pierwsze przygotowanie folderu
sudo mkdir -p /opt/catering-slaski
sudo chown cs:cs /opt/catering-slaski

# Klonuj (zastąp URL swoim repo)
cd /opt
git clone https://github.com/twoja-org/catering-slaski.git
cd catering-slaski

# Sprawdź że jesteś na właściwym branchu
git checkout production
```

### Krok 2.4 — Konfiguracja .env (15 min)

```bash
cp .env.example .env
nano .env
```

Wypełnij wszystkie sekcje z keys które zebrałeś w kroku 1.3 i 1.4. Wygeneruj losowe sekrety dla:

```bash
# Wygeneruj losowe sekrety dla JWT, COOKIE
openssl rand -base64 64  # → JWT_SECRET
openssl rand -base64 64  # → COOKIE_SECRET

# I dla webhook secrets (jeśli ich nie macie z ops team uzgodnionych)
openssl rand -hex 32     # → WEBHOOK_*_SECRET
```

**KRYTYCZNE w .env dla produkcji:**
```bash
NODE_ENV=production
DATABASE_URL=postgres://medusa:STRONG_PASSWORD@postgres:5432/catering_slaski
POSTGRES_PASSWORD=STRONG_PASSWORD  # match z DATABASE_URL
NEXT_PUBLIC_BASE_URL=https://cateringslaski.pl
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.cateringslaski.pl
```

### Krok 2.5 — Pierwszy deploy (10 min)

```bash
cd /opt/catering-slaski
chmod +x infra/scripts/deploy.sh

# Init — pierwsza instalacja
./infra/scripts/deploy.sh init
```

Skrypt:
1. Wystawia certyfikaty Let's Encrypt dla wszystkich 4 subdomen
2. Buduje image Docker
3. Uruchamia cały stack
4. Wykonuje migracje DB
5. Seeduje strefy + admin

Czas: **~10-15 minut** (głównie build images).

### Krok 2.6 — Weryfikacja (5 min)

```bash
# Sprawdź że wszystko działa
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml ps

# Powinno być 6× services w status "running":
# - postgres, redis, backend, storefront, nginx, certbot

# Sprawdź endpointy
curl -fsS https://cateringslaski.pl/api/health
# {"status":"ok",...}

curl -fsS https://api.cateringslaski.pl/health
# OK

# Sprawdź admin
# Otwórz w przeglądarce: https://admin.cateringslaski.pl
# Zaloguj się: ADMIN_EMAIL / ADMIN_PASSWORD z .env
# (zmień hasło natychmiast po pierwszym logowaniu)
```

---

## Część 3: Post-deploy zadania (30 min)

### Krok 3.1 — Konfiguracja Stripe webhook (5 min)

W panelu Stripe → Developers → Webhooks → Add endpoint:
- URL: `https://api.cateringslaski.pl/hooks/payment/stripe`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Skopiuj **Signing secret** (zaczyna się od `whsec_`) do `.env`:
  ```bash
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
- Restart: `docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml restart backend`

### Krok 3.2 — Generowanie time slots (5 min)

```bash
# Wygeneruj sloty dla 30 dni do przodu dla wszystkich stref
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  exec backend pnpm seed:slots
```

Sprawdź w admin: https://admin.cateringslaski.pl/time-slots — powinieneś zobaczyć wypełniony kalendarz.

### Krok 3.3 — Import 200 produktów ze starego sklepu (10 min)

```bash
# Wrzuć CSV ze starego ec-instant-site
scp legacy-products.csv cs@IP_VPS:/opt/catering-slaski/apps/backend/data/

# Uruchom import
docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml \
  exec backend pnpm import:legacy-products
```

Sprawdź: https://admin.cateringslaski.pl/products

### Krok 3.4 — Cron jobs (5 min)

```bash
crontab -e
```

Dodaj:
```cron
# Daily DB backup at 3:00 AM
0 3 * * * /opt/catering-slaski/infra/scripts/backup-db.sh >> /var/log/cs-backup.log 2>&1

# Release expired slot reservations every minute
* * * * * docker compose -f /opt/catering-slaski/infra/docker-compose.yml exec -T backend node -e "require('./.medusa/server/src/modules/time-slots/cron').releaseExpired()" >/dev/null 2>&1

# Renew SSL (Let's Encrypt auto-renews via certbot container, but reload nginx)
0 4 * * 1 docker compose -f /opt/catering-slaski/infra/docker-compose.yml exec nginx nginx -s reload
```

### Krok 3.5 — Monitoring (5 min)

Polecam **BetterStack** (free tier) dla uptime monitoring:
- Zarejestruj
- Add monitor: https://cateringslaski.pl/api/health (sprawdza co 30s)
- Add monitor: https://api.cateringslaski.pl/health
- Konfiguruj alerty SMS/email gdy down

**Sentry** dla error tracking (free tier do 5k errors/mies):
- Zarejestruj
- Stwórz projekty: catering-storefront, catering-backend
- Skopiuj DSN do `.env`: `SENTRY_DSN=...`
- Restart backend

---

## Część 4: GitHub Actions CI/CD setup (15 min)

### Krok 4.1 — Wygeneruj klucz SSH dla deploy bota

```bash
# Z lokalnej maszyny
ssh-keygen -t ed25519 -f ~/.ssh/cs_deploy -N ""
cat ~/.ssh/cs_deploy.pub
# Wkleisz to do authorized_keys na VPS

# Na VPS
ssh cs@IP_VPS
echo "AAAAC3Nz...zawartość pub key..." >> ~/.ssh/authorized_keys
```

### Krok 4.2 — GitHub Secrets

W repozytorium GitHub → Settings → Secrets and variables → Actions:

| Secret | Wartość |
|---|---|
| `DEPLOY_SSH_KEY` | zawartość pliku `~/.ssh/cs_deploy` (private key) |
| `VPS_HOST` | IP serwera |
| `VPS_USER` | cs |
| `SLACK_WEBHOOK_URL` | (opcjonalnie) URL do Slack incoming webhook |

### Krok 4.3 — Test deploy

```bash
# Z lokalnej maszyny
git checkout production
git merge main
git push origin production
```

Akcja deploy.yml się odpali. Obserwuj w GitHub → Actions.

---

## Czas total

| Część | Czas |
|---|---|
| 1. Twoje przygotowania (konta, domena) | ~70 min |
| 2. Setup VPS i pierwszy deploy | ~45 min |
| 3. Post-deploy konfiguracja | ~30 min |
| 4. GitHub Actions CI/CD | ~15 min |
| **TOTAL** | **~2h 40min** |

Z tego **~70 min** to konta zewnętrzne które można rozłożyć w czasie i robić w międzyczasie.

---

## Troubleshooting

### Backend nie startuje, error "PostGIS not available"
```bash
docker compose exec postgres psql -U medusa -d catering_slaski -c "CREATE EXTENSION postgis;"
```

### Nginx error 502 Bad Gateway
Backend nie nasłuchuje. Sprawdź logi:
```bash
docker compose logs backend --tail 100
```

### Certyfikaty Let's Encrypt failed
DNS nie wskazuje na VPS. Sprawdź:
```bash
dig cateringslaski.pl A
# Powinno zwrócić Twoje IP VPS
```

### "Out of zone" dla wszystkich adresów
Strefy nie zostały seedowane. Uruchom:
```bash
docker compose exec backend pnpm seed:zones
```

### Brak slotów czasowych
```bash
docker compose exec backend pnpm seed:slots
```

---

## Następne kroki

Po pomyślnym deploy:
1. Otwórz admin: https://admin.cateringslaski.pl
2. Zaloguj się, zmień hasło
3. W Zone Editor — doprecyzuj polygony stref (na razie są placeholder boxes)
4. W Time Slots — sprawdź slot capacity per zone i edytuj
5. W Products — sprawdź czy import się powiódł, dopisz brakujące atrybuty
6. **Wykonaj sesję zdjęciową** (krytyczne dla launch — brand v1 ma placeholder photos)

---

*DEPLOYMENT.md v1 · Catering Śląski production build · 20 maja 2026*
