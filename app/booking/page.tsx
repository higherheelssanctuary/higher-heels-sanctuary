"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Clock, Calendar, CreditCard, Lock } from "lucide-react";
import StripePaymentForm from "@/components/StripePaymentForm";

// ─── Room data ────────────────────────────────────────────────────────────────
const rooms = [
  {
    id: "dark",
    title: "Sala Sensual",
    badge: "OSCURA · ÍNTIMA · CINEMATOGRÁFICA",
    description: "Círculo LED rojo, proyector dinámico e iluminación escenográfica. La sala más cinematográfica.",
    accent: "#FF1E3C",
    bg: "radial-gradient(ellipse at 50% 40%, rgba(255,30,60,0.14) 0%, rgba(10,10,10,0) 65%), #0A0A0A",
    textLight: true,
    features: ["Círculo LED rojo", "Proyector dinámico", "Iluminación dual", "Barras profesionales"],
    price: 18.99,
  },
  {
    id: "clean",
    title: "Sala Áurea",
    badge: "LUMINOSA · FUNCIONAL · ACCESIBLE",
    description: "Paredes blancas, luz de entrenamiento clara y el legendario teléfono rojo de pared.",
    accent: "#8B0000",
    bg: "radial-gradient(ellipse at 50% 0%, rgba(255,230,230,0.6) 0%, #F0EEEB 60%)",
    textLight: false,
    features: ["Paredes blancas", "Luz de entrenamiento", "Teléfono rojo iconic", "Doble espejo"],
    price: 18.99,
  },
  {
    id: "moon",
    title: "Sala Ares",
    badge: "ARTÍSTICA · EMOCIONAL · ÚNICA",
    description: "Luna retroiluminada, barra aérea y atmósfera nocturna. Arte, fuerza y magia en una sola sesión.",
    accent: "#8CA0FF",
    bg: "radial-gradient(ellipse at 50% 15%, rgba(100,120,255,0.2) 0%, rgba(8,11,24,0) 60%), #080B14",
    textLight: true,
    features: ["Luna retroiluminada", "Barra aérea", "Atmósfera nocturna", "Tonos fríos suaves"],
    price: 18.99,
  },
  {
    id: "test",
    title: "🧪 Sala Test",
    badge: "SOLO PARA PRUEBAS · NO USAR",
    description: "Sala de prueba para verificar el sistema de pagos, email y PIN.",
    accent: "#22c55e",
    bg: "radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.1) 0%, #0a0a0a 65%), #0a0a0a",
    textLight: true,
    features: ["Pago €0.50", "Email con PIN", "Google Sheets", "Webhook test"],
    price: 0.5,
  },
];

// ─── Time slots — 1.5h blocks across the 24/7 day, grouped in 3 arcs ─────────────
const TIME_ARCS = [
  { id: "madrugada", label: "MADRUGADA", range: "00:00 – 06:00", slots: ["00:00", "01:30", "03:00", "04:30"] },
  { id: "dia", label: "DÍA", range: "06:00 – 18:00", slots: ["06:00", "07:30", "09:00", "10:30", "12:00", "13:30", "15:00", "16:30"] },
  { id: "noche", label: "NOCHE", range: "18:00 – 00:00", slots: ["18:00", "19:30", "21:00", "22:30"] },
];

// "01:30" → "01:30 – 03:00"
function slotRange(start: string): string {
  const [h, m] = start.split(":").map(Number);
  const endMin = h * 60 + m + 90;
  const eh = String(Math.floor(endMin / 60) % 24).padStart(2, "0");
  const em = String(endMin % 60).padStart(2, "0");
  return `${start} – ${eh}:${em}`;
}

// ─── Bonos & Membresías ─────────────────────────────────────────────────────────
type PlanType = "single" | "bonos" | "membresias";

const bonos = [
  { id: "esencia", name: "Esencia", entradas: 4, price: 71.99, tag: "" },
  { id: "ritual", name: "Ritual", entradas: 8, price: 134.99, tag: "POPULAR" },
  { id: "elite", name: "Élite", entradas: 16, price: 247.99, tag: "" },
];

const membresias = [
  { id: "plata", name: "Plata", entradas: 4, price: 56.99, tag: "" },
  { id: "oro", name: "Oro", entradas: 6, price: 75.99, tag: "POPULAR" },
  { id: "platino", name: "Platino", entradas: 8, price: 80.99, tag: "" },
];

// 18.90 → "18,90€"  (plain `${n}€` would render 18.90 as "18.9€")
const eur = (n: number) => `${n.toFixed(2).replace(".", ",")}€`;

// ─── Date helpers ──────────────────────────────────────────────────────────────
function getDays(month: number, year: number) {
  const days = [];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday-first
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS_ES = ["L","M","X","J","V","S","D"];

type Step = "room" | "datetime" | "summary" | "payment" | "confirmed";

function reasonMessage(reason?: string): string {
  switch (reason) {
    case "not_found": return "Código no encontrado.";
    case "inactive": return "Este código ya no está activo.";
    case "expired": return "Este código ha caducado.";
    case "empty": return "Este código no tiene entradas disponibles.";
    case "slot_taken": return "Ese horario acaba de ocuparse. Elige otro.";
    default: return "No se pudo aplicar el código. Inténtalo de nuevo.";
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string }[] = [
  { id: "room", label: "Sala" },
  { id: "datetime", label: "Fecha" },
  { id: "summary", label: "Resumen" },
  { id: "payment", label: "Pago" },
  { id: "confirmed", label: "Confirmado" },
];

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: done || active ? "#FF1E3C" : "rgba(255,255,255,0.06)",
                  color: done || active ? "#fff" : "rgba(255,255,255,0.3)",
                  boxShadow: active ? "0 0 16px rgba(255,30,60,0.6)" : "none",
                }}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span
                className="text-[10px] tracking-widest hidden md:block"
                style={{
                  fontFamily: "var(--font-bebas-neue)",
                  color: active ? "#FF1E3C" : done ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-10 md:w-16 h-px mx-1 mb-5"
                style={{ background: i < idx ? "#FF1E3C" : "rgba(255,255,255,0.08)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState<Step>("room");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const duration = 1.5; // fixed 1.5h sessions
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [planType, setPlanType] = useState<PlanType>("single");
  const [occupiedSlots, setOccupiedSlots] = useState<string[]>([]);
  const [timeArc, setTimeArc] = useState<string>("dia");
  const [buying, setBuying] = useState<string | null>(null);
  const [buyError, setBuyError] = useState<string | null>(null);

  async function buyPlan(planId: string) {
    setBuying(planId);
    setBuyError(null);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (res.status === 404) {
        // Live prices not provisioned yet → graceful message, not an error.
        setBuyError("La compra online estará disponible muy pronto.");
        setBuying(null);
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Error");
      window.location.href = data.url;
    } catch {
      setBuyError("No se pudo iniciar la compra. Inténtalo de nuevo.");
      setBuying(null);
    }
  }

  // Fetch real availability from the DB whenever room + date change
  useEffect(() => {
    if (!selectedRoom || !selectedDate) {
      setOccupiedSlots([]);
      return;
    }
    const dateStr = `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
    let cancelled = false;
    fetch(`/api/availability?room=${selectedRoom}&date=${dateStr}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setOccupiedSlots(d.occupied ?? []); })
      .catch(() => { if (!cancelled) setOccupiedSlots([]); });
    return () => { cancelled = true; };
  }, [selectedRoom, selectedDate]);

  // Code redemption (bonos / membresías)
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<{ valid: boolean; plan_name?: string; remaining?: number; reason?: string } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  async function applyCode() {
    if (!code.trim()) return;
    setCodeLoading(true);
    setCodeStatus(null);
    try {
      const r = await fetch(`/api/redeem-code?code=${encodeURIComponent(code.trim())}`).then(res => res.json());
      setCodeStatus(r);
    } catch {
      setCodeStatus({ valid: false, reason: "error" });
    } finally {
      setCodeLoading(false);
    }
  }

  async function confirmWithCode() {
    setRedeeming(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          room: selectedRoom,
          slotDate: slotDateISO(),
          time: selectedTime,
          date: formatDate(),
          duration,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setPaymentError(reasonMessage(data.reason));
        if (data.reason === "slot_taken" || data.reason === "empty") setCodeStatus(null);
        return;
      }
      setStep("confirmed");
    } catch {
      setPaymentError("No se pudo confirmar. Inténtalo de nuevo.");
    } finally {
      setRedeeming(false);
    }
  }

  const room = rooms.find(r => r.id === selectedRoom);
  const total = room ? room.price : 0; // flat price per 1.5h session

  const today = new Date();

  function formatDate() {
    if (!selectedDate) return "";
    return `${selectedDate.day} ${MONTHS_ES[selectedDate.month]} ${selectedDate.year}`;
  }

  function slotDateISO() {
    if (!selectedDate) return "";
    return `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`;
  }

  async function goToPayment() {
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          room: selectedRoom,
          date: formatDate(),
          time: selectedTime,
          duration,
          slotDate: slotDateISO(),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Error");
      setClientSecret(data.clientSecret);
      setStep("payment");
    } catch (err) {
      setPaymentError("No se pudo iniciar el pago. Inténtalo de nuevo.");
    } finally {
      setPaymentLoading(false);
    }
  }

  // ── Step: Room selection ───────────────────────────────────────────────────
  if (step === "room") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] px-5 md:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-[#F5F5F5]/40 hover:text-[#FF1E3C] transition-colors text-sm mb-8">
            <ChevronLeft size={16} /> Volver al inicio
          </Link>

          {planType === "single" && <StepBar current="room" />}

          {/* Plan type selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {([
              { id: "single", label: "RESERVA ÚNICA" },
              { id: "bonos", label: "BONOS" },
              { id: "membresias", label: "MEMBRESÍAS" },
            ] as { id: PlanType; label: string }[]).map(t => {
              const active = planType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setPlanType(t.id)}
                  className="px-5 h-11 rounded-full text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
                  style={{
                    fontFamily: "var(--font-bebas-neue)",
                    letterSpacing: "0.1em",
                    background: active ? "#FF1E3C" : "rgba(255,255,255,0.05)",
                    color: active ? "#fff" : "rgba(245,245,245,0.55)",
                    boxShadow: active ? "0 0 24px rgba(255,30,60,0.4)" : "none",
                    border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Bonos & Membresías */}
          {planType !== "single" && (
            <div>
              <h1 className="text-4xl md:text-5xl text-[#F5F5F5] mb-2" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                {planType === "bonos" ? "BONOS DE ENTRADAS" : "MEMBRESÍAS"}
              </h1>
              <p className="text-[#F5F5F5]/40 mb-10 text-sm">
                {planType === "bonos"
                  ? "Compra tus entradas por adelantado y ahorra. Un único código válido para todas tus sesiones · 6 meses de validez · cualquier sala."
                  : "Entrena cada mes con tu plan. Pago mensual · las entradas se renuevan cada mes · cualquier sala."}
              </p>
              <div className="grid md:grid-cols-3 gap-5">
                {(planType === "bonos" ? bonos : membresias).map(p => (
                  <div
                    key={p.id}
                    className="relative rounded-2xl border p-6 flex flex-col"
                    style={{
                      borderColor: p.tag ? "#FF1E3C" : "rgba(255,255,255,0.08)",
                      background: "#111111",
                      boxShadow: p.tag ? "0 0 30px rgba(255,30,60,0.15)" : "none",
                    }}
                  >
                    {p.tag && (
                      <span
                        className="absolute top-4 right-4 text-[10px] tracking-widest px-2 py-0.5 rounded-full"
                        style={{ background: "#FF1E3C", color: "#fff", fontFamily: "var(--font-bebas-neue)" }}
                      >
                        {p.tag}
                      </span>
                    )}
                    <h3 className="text-2xl" style={{ fontFamily: "var(--font-bebas-neue)", color: "#F5F5F5" }}>
                      {p.name}
                    </h3>
                    <p
                      className="text-sm text-[#FF1E3C] mb-5"
                      style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.08em" }}
                    >
                      {p.entradas} ENTRADAS{planType === "membresias" ? " / MES" : ""}
                    </p>
                    <div className="mb-2">
                      <span className="text-4xl" style={{ fontFamily: "var(--font-bebas-neue)", color: "#F5F5F5" }}>
                        {eur(p.price)}
                      </span>
                      {planType === "membresias" && <span className="text-sm text-[#F5F5F5]/40"> /mes</span>}
                    </div>
                    <p className="text-xs text-[#F5F5F5]/40">
                      {(p.price / p.entradas).toFixed(2).replace(".", ",")}€ por entrada
                    </p>
                    <p className="text-xs text-[#F5F5F5]/40 mb-6">
                      {planType === "bonos" ? "Válido 6 meses" : "Se renueva cada mes"}
                    </p>
                    <div className="mt-auto">
                      <button
                        onClick={() => buyPlan(p.id)}
                        disabled={buying !== null}
                        className="w-full h-12 rounded-sm text-sm text-white transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                        style={{
                          fontFamily: "var(--font-bebas-neue)",
                          letterSpacing: "0.12em",
                          background: "#FF1E3C",
                          boxShadow: "0 0 24px rgba(255,30,60,0.4)",
                        }}
                      >
                        {buying === p.id ? "REDIRIGIENDO..." : "COMPRAR"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {buyError && <p className="mt-4 text-red-400 text-sm">{buyError}</p>}
              <p className="mt-6 text-xs text-[#F5F5F5]/30 max-w-xl">
                Al comprar recibirás un código único por email, válido para reservar todas tus entradas con el mismo código.
              </p>
            </div>
          )}

          {/* Single booking */}
          {planType === "single" && (
          <div>
          <h1 className="text-4xl md:text-5xl text-[#F5F5F5] mb-2" style={{ fontFamily: "var(--font-bebas-neue)" }}>
            ELIGE TU SALA
          </h1>
          <p className="text-[#F5F5F5]/40 mb-10 text-sm">Tres salas, tres atmósferas. Cada una pensada para una experiencia distinta.</p>

          <div className="grid md:grid-cols-3 gap-5">
            {rooms.map(r => {
              const isSelected = selectedRoom === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoom(r.id)}
                  className="relative text-left rounded-2xl overflow-hidden border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF1E3C]"
                  style={{
                    background: r.bg,
                    borderColor: isSelected ? r.accent : "rgba(255,255,255,0.08)",
                    boxShadow: isSelected ? `0 0 30px ${r.accent}30` : "none",
                  }}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div
                      className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center z-10"
                      style={{ background: r.accent }}
                    >
                      <Check size={12} color="#fff" />
                    </div>
                  )}

                  <div className="p-6">
                    <span
                      className="text-[10px] tracking-widest px-2 py-0.5 rounded-full border mb-3 inline-block"
                      style={{ color: r.accent, borderColor: `${r.accent}40`, fontFamily: "var(--font-bebas-neue)" }}
                    >
                      {r.badge}
                    </span>
                    <h2
                      className="text-xl mb-2"
                      style={{ color: r.textLight ? "#F5F5F5" : "#1A1A1A", fontFamily: "var(--font-bebas-neue)" }}
                    >
                      {r.title}
                    </h2>
                    <p
                      className="text-xs leading-relaxed mb-4"
                      style={{ color: r.textLight ? "rgba(245,245,245,0.6)" : "rgba(26,26,26,0.6)" }}
                    >
                      {r.description}
                    </p>
                    <ul className="space-y-1 mb-5">
                      {r.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-xs" style={{ color: r.textLight ? "rgba(245,245,245,0.5)" : "rgba(26,26,26,0.5)" }}>
                          <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: r.accent }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-2xl font-bold" style={{ color: r.accent }}>{eur(r.price)}</span>
                        <span className="text-xs ml-1" style={{ color: r.textLight ? "rgba(245,245,245,0.4)" : "rgba(26,26,26,0.4)" }}>/ sesión (1h 30min)</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => selectedRoom && setStep("datetime")}
              disabled={!selectedRoom}
              className="flex items-center gap-2 h-12 px-8 text-white text-sm tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontFamily: "var(--font-bebas-neue)",
                letterSpacing: "0.12em",
                background: selectedRoom ? "#FF1E3C" : "#333",
                boxShadow: selectedRoom ? "0 0 30px rgba(255,30,60,0.4)" : "none",
              }}
            >
              CONTINUAR <ChevronRight size={16} />
            </button>
          </div>
          </div>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Date & time ──────────────────────────────────────────────────────
  if (step === "datetime") {
    const days = getDays(calMonth, calYear);
    const booked = occupiedSlots;

    return (
      <div className="min-h-screen bg-[#0A0A0A] px-5 md:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setStep("room")} className="inline-flex items-center gap-2 text-[#F5F5F5]/40 hover:text-[#FF1E3C] transition-colors text-sm mb-8">
            <ChevronLeft size={16} /> Cambiar sala
          </button>

          <StepBar current="datetime" />

          <h1 className="text-4xl md:text-5xl text-[#F5F5F5] mb-2" style={{ fontFamily: "var(--font-bebas-neue)" }}>
            ELIGE FECHA Y HORA
          </h1>
          {room && (
            <p className="text-sm mb-4" style={{ color: room.accent }}>
              {room.title}
            </p>
          )}

          {/* Mini guide */}
          <div className="mb-8 rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "rgba(255,30,60,0.06)", border: "1px solid rgba(255,30,60,0.15)" }}>
            <Clock size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#FF1E3C" }} />
            <p className="text-[#F5F5F5]/70 text-sm leading-relaxed">
              Reserva en 2 pasos: elige el <strong className="text-[#F5F5F5]">día</strong> y luego tu <strong className="text-[#F5F5F5]">franja horaria</strong>. Cada sesión dura <strong className="text-[#F5F5F5]">1h 30min</strong> y la sala es solo para ti.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="rounded-2xl border border-white/08 p-5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[#F5F5F5]/40 text-xs tracking-widest mb-4" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                1 · ELIGE EL DÍA
              </p>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                    else setCalMonth(m => m - 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#F5F5F5]/60 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[#F5F5F5] text-sm tracking-widest" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                  {MONTHS_ES[calMonth]} {calYear}
                </span>
                <button
                  onClick={() => {
                    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                    else setCalMonth(m => m + 1);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#F5F5F5]/60 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_ES.map(d => (
                  <div key={d} className="text-center text-[10px] text-[#F5F5F5]/30 py-1" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const isPast = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const isSelected = selectedDate?.day === day && selectedDate?.month === calMonth && selectedDate?.year === calYear;
                  return (
                    <button
                      key={i}
                      onClick={() => !isPast && setSelectedDate({ day, month: calMonth, year: calYear })}
                      disabled={isPast}
                      className="aspect-square flex items-center justify-center rounded-full text-sm transition-all"
                      style={{
                        background: isSelected ? "#FF1E3C" : "transparent",
                        color: isPast ? "rgba(245,245,245,0.15)" : isSelected ? "#fff" : "rgba(245,245,245,0.8)",
                        boxShadow: isSelected ? "0 0 14px rgba(255,30,60,0.5)" : "none",
                        cursor: isPast ? "not-allowed" : "pointer",
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time slots + duration */}
            <div>
              <p className="text-[#F5F5F5]/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                2 · ELIGE TU FRANJA
              </p>

              {/* Time-arc tabs (Día by default) */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {TIME_ARCS.map(arc => {
                  const active = timeArc === arc.id;
                  return (
                    <button
                      key={arc.id}
                      onClick={() => setTimeArc(arc.id)}
                      className="rounded-lg py-2 transition-all flex flex-col items-center"
                      style={{
                        background: active ? "#FF1E3C" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${active ? "#FF1E3C" : "rgba(255,255,255,0.08)"}`,
                        boxShadow: active ? "0 0 14px rgba(255,30,60,0.4)" : "none",
                      }}
                    >
                      <span className="text-sm tracking-wide" style={{ fontFamily: "var(--font-bebas-neue)", color: active ? "#fff" : "rgba(245,245,245,0.75)" }}>
                        {arc.label}
                      </span>
                      <span className="text-[9px] mt-0.5" style={{ color: active ? "rgba(255,255,255,0.8)" : "rgba(245,245,245,0.35)" }}>
                        {arc.range}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Slots of the selected arc */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {(TIME_ARCS.find(a => a.id === timeArc)?.slots ?? []).map(t => {
                  const isBooked = booked.includes(t);
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      onClick={() => !isBooked && setSelectedTime(t)}
                      disabled={isBooked}
                      className="h-10 rounded-lg text-sm tracking-wide transition-all"
                      style={{
                        fontFamily: "var(--font-bebas-neue)",
                        background: isSelected ? "#FF1E3C" : isBooked ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                        color: isBooked ? "rgba(245,245,245,0.15)" : isSelected ? "#fff" : "rgba(245,245,245,0.7)",
                        border: `1px solid ${isSelected ? "#FF1E3C" : isBooked ? "transparent" : "rgba(255,255,255,0.06)"}`,
                        textDecoration: isBooked ? "line-through" : "none",
                        cursor: isBooked ? "not-allowed" : "pointer",
                        boxShadow: isSelected ? "0 0 14px rgba(255,30,60,0.4)" : "none",
                      }}
                    >
                      {slotRange(t)}
                    </button>
                  );
                })}
              </div>

              <p className="text-[#F5F5F5]/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                DURACIÓN
              </p>
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-[#F5F5F5]">Cada sesión dura <strong>1 hora y media</strong> (1h 30min).</span>
              </div>

              {selectedTime && selectedDate && (
                <div
                  className="mt-6 p-4 rounded-xl text-sm"
                  style={{ background: "rgba(255,30,60,0.06)", border: "1px solid rgba(255,30,60,0.15)" }}
                >
                  <div className="flex items-center gap-2 text-[#F5F5F5]/60 mb-1">
                    <Calendar size={14} />
                    <span>{formatDate()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#F5F5F5]/60">
                    <Clock size={14} />
                    <span>{selectedTime} → {(() => {
                      const [h, m] = selectedTime.split(":").map(Number);
                      const endMin = h * 60 + m + 90;
                      return `${String(Math.floor(endMin / 60)).padStart(2,"0")}:${String(endMin % 60).padStart(2,"0")}`;
                    })()}</span>
                    <span className="ml-auto text-[#FF1E3C] font-bold">{eur(total)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => selectedDate && selectedTime && setStep("summary")}
              disabled={!selectedDate || !selectedTime}
              className="flex items-center gap-2 h-12 px-8 text-white text-sm tracking-widest transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                fontFamily: "var(--font-bebas-neue)",
                letterSpacing: "0.12em",
                background: selectedDate && selectedTime ? "#FF1E3C" : "#333",
                boxShadow: selectedDate && selectedTime ? "0 0 30px rgba(255,30,60,0.4)" : "none",
              }}
            >
              CONTINUAR <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Summary ──────────────────────────────────────────────────────────
  if (step === "summary") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] px-5 md:px-12 py-24">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStep("datetime")} className="inline-flex items-center gap-2 text-[#F5F5F5]/40 hover:text-[#FF1E3C] transition-colors text-sm mb-8">
            <ChevronLeft size={16} /> Cambiar fecha
          </button>

          <StepBar current="summary" />

          <h1 className="text-4xl md:text-5xl text-[#F5F5F5] mb-8" style={{ fontFamily: "var(--font-bebas-neue)" }}>
            RESUMEN
          </h1>

          <div className="rounded-2xl border border-white/08 overflow-hidden mb-6" style={{ background: "rgba(255,255,255,0.02)" }}>
            {/* Room header */}
            <div className="p-5 border-b border-white/06" style={{ background: room?.bg }}>
              <span
                className="text-[10px] tracking-widest px-2 py-0.5 rounded-full border inline-block mb-2"
                style={{ color: room?.accent, borderColor: `${room?.accent}40`, fontFamily: "var(--font-bebas-neue)" }}
              >
                {room?.badge}
              </span>
              <h2 className="text-xl" style={{ color: room?.textLight ? "#F5F5F5" : "#1A1A1A", fontFamily: "var(--font-bebas-neue)" }}>
                {room?.title}
              </h2>
            </div>

            {/* Details */}
            <div className="divide-y divide-white/05">
              {[
                { icon: <Calendar size={15} />, label: "Fecha", value: formatDate() },
                { icon: <Clock size={15} />, label: "Hora", value: `${selectedTime} · 1h 30min` },
                { icon: <CreditCard size={15} />, label: "Precio", value: `${eur(total)} / sesión` },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 px-5 py-4">
                  <span className="text-[#F5F5F5]/30">{row.icon}</span>
                  <span className="text-[#F5F5F5]/40 text-sm w-20" style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.05em" }}>
                    {row.label}
                  </span>
                  <span className="text-[#F5F5F5] text-sm ml-auto">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center px-5 py-4">
                <span className="text-[#F5F5F5]/40 text-sm" style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.05em" }}>TOTAL</span>
                <span className="ml-auto text-2xl font-bold" style={{ color: room?.accent }}>{eur(total)}</span>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-xl p-4 mb-8 text-xs text-[#F5F5F5]/40 leading-relaxed" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-start gap-2">
              <Lock size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#FF1E3C" }} />
              <span>
                Recibirás un <strong className="text-[#F5F5F5]/70">código PIN temporal</strong> en tu email unas horas antes de la sesión.
                El código activa la cerradura exactamente durante tu reserva y se desactiva automáticamente al finalizar.
                Cancelación gratuita hasta 24h antes.
              </span>
            </div>
          </div>

          {/* Redeem a bono / membresía code */}
          <div className="rounded-xl p-4 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[#F5F5F5]/60 text-xs mb-3" style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.08em" }}>
              ¿TIENES UN BONO O MEMBRESÍA?
            </p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={e => { setCode(e.target.value); setCodeStatus(null); }}
                placeholder="HHS-XXXXX"
                className="flex-1 h-11 px-3 rounded-lg text-[#F5F5F5] text-sm focus:outline-none"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", letterSpacing: "0.05em" }}
              />
              <button
                onClick={applyCode}
                disabled={codeLoading || !code.trim()}
                className="h-11 px-5 rounded-lg text-sm disabled:opacity-40"
                style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.08em", background: "rgba(255,255,255,0.08)", color: "#F5F5F5" }}
              >
                {codeLoading ? "..." : "APLICAR"}
              </button>
            </div>
            {codeStatus?.valid && (
              <p className="text-green-400 text-xs mt-2">✓ Código válido · {codeStatus.plan_name} · quedan {codeStatus.remaining} entradas</p>
            )}
            {codeStatus && !codeStatus.valid && (
              <p className="text-red-400 text-xs mt-2">{reasonMessage(codeStatus.reason)}</p>
            )}
          </div>

          {paymentError && (
            <p className="text-red-400 text-sm mb-4 text-center">{paymentError}</p>
          )}

          {codeStatus?.valid ? (
            <button
              onClick={confirmWithCode}
              disabled={redeeming}
              className="w-full h-14 text-white text-lg tracking-widest transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              style={{
                fontFamily: "var(--font-bebas-neue)",
                letterSpacing: "0.12em",
                background: "#FF1E3C",
                boxShadow: "0 0 40px rgba(255,30,60,0.5)",
              }}
            >
              {redeeming ? "CONFIRMANDO..." : "CONFIRMAR RESERVA · SIN PAGO"}
            </button>
          ) : (
            <button
              onClick={goToPayment}
              disabled={paymentLoading}
              className="w-full h-14 text-white text-lg tracking-widest transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              style={{
                fontFamily: "var(--font-bebas-neue)",
                letterSpacing: "0.12em",
                background: "#FF1E3C",
                boxShadow: "0 0 40px rgba(255,30,60,0.5)",
              }}
            >
              {paymentLoading ? "PREPARANDO PAGO..." : `PROCEDER AL PAGO · ${eur(total)}`}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Step: Payment ──────────────────────────────────────────────────────────
  if (step === "payment") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] px-5 md:px-12 py-24">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStep("summary")} className="inline-flex items-center gap-2 text-[#F5F5F5]/40 hover:text-[#FF1E3C] transition-colors text-sm mb-8">
            <ChevronLeft size={16} /> Volver al resumen
          </button>

          <StepBar current="payment" />

          <h1 className="text-4xl md:text-5xl text-[#F5F5F5] mb-8" style={{ fontFamily: "var(--font-bebas-neue)" }}>
            PAGO SEGURO
          </h1>

          {/* Order recap */}
          <div
            className="rounded-xl p-4 mb-6 flex items-center justify-between text-sm"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <p className="text-[#F5F5F5]/70 font-medium">{room?.title}</p>
              <p className="text-[#F5F5F5]/30 text-xs mt-0.5">{formatDate()} · {selectedTime} · 1h 30min</p>
            </div>
            <span className="text-xl font-bold" style={{ color: room?.accent }}>{eur(total)}</span>
          </div>

          {/* Stripe Elements */}
          <div className="rounded-2xl border border-white/08 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
            {clientSecret ? (
              <StripePaymentForm
                clientSecret={clientSecret}
                total={total}
                accent={room?.accent ?? "#FF1E3C"}
                onSuccess={() => setStep("confirmed")}
              />
            ) : (
              <p className="text-[#F5F5F5]/30 text-sm text-center py-8">Cargando formulario de pago…</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Confirmed ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-5 md:px-12 py-24 flex flex-col items-center justify-center text-center">
      <StepBar current="confirmed" />

      {/* Animated checkmark */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(255,30,60,0.1)", border: "2px solid #FF1E3C", boxShadow: "0 0 40px rgba(255,30,60,0.3)" }}
      >
        <Check size={32} color="#FF1E3C" />
      </div>

      <h1 className="text-4xl md:text-6xl text-[#F5F5F5] mb-3" style={{ fontFamily: "var(--font-bebas-neue)" }}>
        ¡RESERVA CONFIRMADA!
      </h1>
      <p className="text-[#F5F5F5]/50 mb-10 max-w-md">
        Hemos enviado la confirmación a tu email. Recibirás tu PIN de acceso unas horas antes de la sesión.
      </p>

      {/* Booking card */}
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden mb-8 text-left"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="p-5 border-b border-white/06" style={{ background: room?.bg }}>
          <h2 className="text-xl" style={{ color: room?.textLight ? "#F5F5F5" : "#1A1A1A", fontFamily: "var(--font-bebas-neue)" }}>
            {room?.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: room?.textLight ? "rgba(245,245,245,0.6)" : "rgba(26,26,26,0.5)" }}>
            {formatDate()} · {selectedTime} · 1h 30min
          </p>
        </div>

        {/* PIN placeholder */}
        <div className="p-5">
          <p className="text-[#F5F5F5]/30 text-xs tracking-widest mb-2" style={{ fontFamily: "var(--font-bebas-neue)" }}>
            TU PIN DE ACCESO (se enviará 10 min antes)
          </p>
          <div
            className="rounded-xl p-4 flex items-center justify-center"
            style={{ background: "rgba(255,30,60,0.06)", border: "1px solid rgba(255,30,60,0.2)" }}
          >
            <span className="text-4xl tracking-[0.3em] font-bold" style={{ color: "#FF1E3C", fontFamily: "monospace" }}>
              ••••••
            </span>
          </div>
          <p className="text-[#F5F5F5]/20 text-xs mt-2 text-center">
            Válido solo durante tu sesión · TTLock
          </p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 h-12 px-6 border border-white/10 text-[#F5F5F5]/60 text-sm tracking-widest hover:border-[#FF1E3C] hover:text-[#FF1E3C] transition-all"
          style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.1em" }}
        >
          VOLVER AL INICIO
        </Link>
        <button
          onClick={() => { setStep("room"); setSelectedRoom(null); setSelectedDate(null); setSelectedTime(null); }}
          className="flex items-center gap-2 h-12 px-6 text-white text-sm tracking-widest transition-all hover:scale-105 active:scale-95"
          style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.1em", background: "#FF1E3C", boxShadow: "0 0 20px rgba(255,30,60,0.4)" }}
        >
          NUEVA RESERVA
        </button>
      </div>
    </div>
  );
}
