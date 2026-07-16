# Higher Heels Sanctuary — Recap del setup

Sito di prenotazione per uno studio di pole dance privato 24/7 a Madrid, con
3 sale, accesso autonomo tramite codice sulla serratura smart, e vendita di
sessioni singole / pacchetti / abbonamenti.

- **Live su:** https://higherheels.es (dominio GoDaddy → Vercel)
- **Repo:** github.com/higherheelssanctuary/higher-heels-sanctuary (deploy auto su push a `main`)

---

## FRONTEND

**Stack:** Next.js 16 (App Router), React, Tailwind, Framer Motion. Tutto in spagnolo.

**Homepage** (`app/page.tsx`) — sezioni:
- **Hero** — wordmark neon "Higher Heels", palo cromato animato.
- **Salas** (`SocialProof.tsx`) — carosello 1-sala-alla-volta: **Sensual / Áurea / Ares**, con foto, atmosfera che sfuma, e CTA "Reservar".
- **Nosotros** (`About.tsx`) — "Nuestro Santuario" + "La historia del Pole Dance".
- **Foto & Vídeo** (`Videomaker.tsx`) — sezione di Alfonso (videomaker), CTA a Instagram @alfonsoklick.
- **Reseñas** (`Reviews.tsx`) — recensioni, responsive su mobile.
- Navbar + Footer (Instagram collegato), favicon = rombo del logo.

**Pagina prenotazione** (`app/booking/page.tsx`) — 3 modalità in alto:
- **Reserva única** → scegli sala → data + franja (fasce fisse da 1h30, 24/7,
  divise in Madrugada/Día/Noche) → resumen → paga 18,99€ → confermato.
  Nel resumen puoi anche inserire un **codice bono/abbonamento** (salta il pagamento).
- **Bonos** → 3 pacchetti (4/8/16 ingressi) → COMPRAR → Stripe Checkout.
- **Membresías** → 3 abbonamenti mensili (4/6/8 ingressi) → COMPRAR → Stripe Checkout.

**Prezzi (tutti .99):** Singolo 18,99€ · Bonos 71,99 / 134,99 / 247,99€ ·
Membresías 56,99 / 75,99 / 80,99€ al mese.

---

## BACKEND

Non c'è un server separato: sono **API routes serverless** di Next su Vercel.

**Database** — Neon Postgres (`lib/db.ts`). 5 tabelle:
- `customers` — chi prenota/compra
- `bookings` — prenotazioni (slot, prezzo, `door_pin`, `nuki_auth_id`, vincolo anti-doppia-prenotazione)
- `plan_codes` — bonos/abbonamenti col saldo `remaining_entries`
- `affiliates` — codici affiliate/videomaker (per l'area riservata, ancora da usare)
- `app_users` — login area riservata con ruoli (ancora da usare)

**API routes** (`app/api/`):
- `create-payment-intent` — pagamento sessione singola (Stripe)
- `create-checkout` — Stripe Checkout per bonos/abbonamenti (prezzo preso da Stripe)
- `webhook` — riceve gli eventi Stripe: registra la prenotazione, genera i codici
  `HHS-XXXXX`, ricarica gli abbonamenti al rinnovo, invia le email
- `redeem-code` — valida e riscatta un codice bono/abbonamento (scala 1 ingresso)
- `availability` — dice quali franje sono già occupate (legge dal DB)
- `cron/nuki` — job protetto da secret, chiamato ogni 15 min da cron-job.org

**Integrazioni:**
- **Stripe** — pagamenti (test in locale, LIVE in produzione). 6 prodotti live +
  webhook che ascolta 4 eventi. Sessioni singole = addebito diretto; bonos = pago
  único; abbonamenti = ricorrente mensile.
- **Nuki** (serratura smart) — il cron, ~3h prima della sessione, genera un codice
  a 6 cifre, lo crea sulla serratura (finestra = solo la fascia prenotata), verifica
  che sia arrivato, lo salva, manda l'email. Dopo la sessione lo revoca. `lib/nuki.ts`.
- **Resend** — email da `reservas@higherheels.es`. Tre template: conferma
  prenotazione, codice d'accesso (PIN porta), codice bono/abbonamento acquistato.
- **Google Sheets** — copia delle prenotazioni (CRM leggero), via webhook.
- **cron-job.org** — scheduler esterno gratuito che chiama `cron/nuki` ogni 15 min.

**Come si incastrano i flussi:**
- *Prenotazione singola:* paga → webhook salva `bookings` → ~3h prima il cron crea
  il codice Nuki e manda l'email → la porta si apre nella fascia → dopo, revoca.
- *Acquisto bono/abbonamento:* Checkout → webhook genera `HHS-XXXXX` + email →
  il cliente lo usa allo step 3 di una prenotazione → scala 1 ingresso.
- *Disponibilità:* ogni `bookings` occupa la sua franja; il calendario legge il DB.

---

## VARIABILI D'AMBIENTE

In `.env.local` (locale, in test) e su Vercel (produzione, live):
`DATABASE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `GOOGLE_SHEETS_WEBHOOK_URL`,
`NUKI_API_TOKEN`, `NUKI_SMARTLOCK_ID`, `CRON_SECRET`.
(`STRIPE_SECRET_KEY_LIVE` solo temporaneo per creare i prodotti live.)

---

## STATO

**Fatto e verificato:** sito completo · prenotazione singola + pagamento ·
disponibilità reale · database · riscatto codici · Nuki (la porta si apre davvero) ·
acquisto bonos e abbonamenti (live) · email · cron schedulato.

**Da fare:** Área reservada (viste affiliate / abonado / executive) · rifiniture
(rimuovere la "Sala Test", eventuale dashboard admin).

**Da ricordare (spostamento serratura a Madrid):** ricollegare la Nuki al Wi-Fi
di Madrid — è il punto critico, senza connessione i codici non si creano.
