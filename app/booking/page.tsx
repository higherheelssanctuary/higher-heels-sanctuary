"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Clock, Calendar, CreditCard, Lock } from "lucide-react";
import StripePaymentForm from "@/components/StripePaymentForm";

// ─── Room data ────────────────────────────────────────────────────────────────
const rooms = [
  {
    id: "dark",
    title: "Sala Dark Sensual",
    badge: "OSCURA · ÍNTIMA · CINEMATOGRÁFICA",
    description: "Círculo LED rojo, proyector dinámico e iluminación escenográfica. La sala más cinematográfica.",
    accent: "#FF1E3C",
    bg: "radial-gradient(ellipse at 50% 40%, rgba(255,30,60,0.14) 0%, rgba(10,10,10,0) 65%), #0A0A0A",
    textLight: true,
    features: ["Círculo LED rojo", "Proyector dinámico", "Iluminación dual", "Barras profesionales"],
    pricePerHour: 25,
  },
  {
    id: "clean",
    title: "Sala Clean & Soft",
    badge: "LUMINOSA · FUNCIONAL · ACCESIBLE",
    description: "Paredes blancas, luz de entrenamiento clara y el legendario teléfono rojo de pared.",
    accent: "#8B0000",
    bg: "radial-gradient(ellipse at 50% 0%, rgba(255,230,230,0.6) 0%, #F0EEEB 60%)",
    textLight: false,
    features: ["Paredes blancas", "Luz de entrenamiento", "Teléfono rojo iconic", "Doble espejo"],
    pricePerHour: 20,
  },
  {
    id: "moon",
    title: "Sala Moonlight",
    badge: "ARTÍSTICA · EMOCIONAL · ÚNICA",
    description: "Luna retroiluminada, barra aérea y atmósfera nocturna. Arte, fuerza y magia en una sola sesión.",
    accent: "#8CA0FF",
    bg: "radial-gradient(ellipse at 50% 15%, rgba(100,120,255,0.2) 0%, rgba(8,11,24,0) 60%), #080B14",
    textLight: true,
    features: ["Luna retroiluminada", "Barra aérea", "Atmósfera nocturna", "Tonos fríos suaves"],
    pricePerHour: 25,
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
    pricePerHour: 0.5,
  },
];

// ─── Time slots ────────────────────────────────────────────────────────────────
const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];

// Simulate some booked slots (demo)
const bookedSlots: Record<string, string[]> = {
  dark: ["10:00", "14:00", "18:00"],
  clean: ["09:00", "13:00", "19:00"],
  moon: ["11:00", "17:00", "21:00"],
};

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
  const [duration, setDuration] = useState(1);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const room = rooms.find(r => r.id === selectedRoom);
  const total = room ? room.pricePerHour * duration : 0;

  const today = new Date();

  function formatDate() {
    if (!selectedDate) return "";
    return `${selectedDate.day} ${MONTHS_ES[selectedDate.month]} ${selectedDate.year}`;
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

          <StepBar current="room" />

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
                        <span className="text-2xl font-bold" style={{ color: r.accent }}>{r.pricePerHour}€</span>
                        <span className="text-xs ml-1" style={{ color: r.textLight ? "rgba(245,245,245,0.4)" : "rgba(26,26,26,0.4)" }}>/hora</span>
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
      </div>
    );
  }

  // ── Step: Date & time ──────────────────────────────────────────────────────
  if (step === "datetime") {
    const days = getDays(calMonth, calYear);
    const booked = bookedSlots[selectedRoom ?? "dark"] ?? [];

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
            <p className="text-sm mb-8" style={{ color: room.accent }}>
              {room.title}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="rounded-2xl border border-white/08 p-5" style={{ background: "rgba(255,255,255,0.03)" }}>
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
                HORA DE INICIO
              </p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {timeSlots.map(t => {
                  const isBooked = booked.includes(t);
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      onClick={() => !isBooked && setSelectedTime(t)}
                      disabled={isBooked}
                      className="h-10 rounded-lg text-sm tracking-wider transition-all"
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
                      {t}
                    </button>
                  );
                })}
              </div>

              <p className="text-[#F5F5F5]/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-bebas-neue)" }}>
                DURACIÓN
              </p>
              <div className="flex gap-2">
                {[1, 2, 3].map(h => (
                  <button
                    key={h}
                    onClick={() => setDuration(h)}
                    className="flex-1 h-10 rounded-lg text-sm transition-all"
                    style={{
                      fontFamily: "var(--font-bebas-neue)",
                      background: duration === h ? "#FF1E3C" : "rgba(255,255,255,0.06)",
                      color: duration === h ? "#fff" : "rgba(245,245,245,0.7)",
                      border: `1px solid ${duration === h ? "#FF1E3C" : "rgba(255,255,255,0.06)"}`,
                      boxShadow: duration === h ? "0 0 14px rgba(255,30,60,0.4)" : "none",
                    }}
                  >
                    {h}h
                  </button>
                ))}
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
                      const end = new Date(0, 0, 0, h + duration, m);
                      return `${String(end.getHours()).padStart(2,"0")}:${String(end.getMinutes()).padStart(2,"0")}`;
                    })()}</span>
                    <span className="ml-auto text-[#FF1E3C] font-bold">{total}€</span>
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
                { icon: <Clock size={15} />, label: "Hora", value: `${selectedTime} · ${duration}h` },
                { icon: <CreditCard size={15} />, label: "Precio", value: `${room?.pricePerHour}€/h × ${duration}h` },
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
                <span className="ml-auto text-2xl font-bold" style={{ color: room?.accent }}>{total}€</span>
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-xl p-4 mb-8 text-xs text-[#F5F5F5]/40 leading-relaxed" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-start gap-2">
              <Lock size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#FF1E3C" }} />
              <span>
                Recibirás un <strong className="text-[#F5F5F5]/70">código PIN temporal</strong> en tu email 10 minutos antes de la sesión.
                El código activa la cerradura exactamente durante tu reserva y se desactiva automáticamente al finalizar.
                Cancelación gratuita hasta 24h antes.
              </span>
            </div>
          </div>

          {paymentError && (
            <p className="text-red-400 text-sm mb-4 text-center">{paymentError}</p>
          )}
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
            {paymentLoading ? "PREPARANDO PAGO..." : `PROCEDER AL PAGO · ${total}€`}
          </button>
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
              <p className="text-[#F5F5F5]/30 text-xs mt-0.5">{formatDate()} · {selectedTime} · {duration}h</p>
            </div>
            <span className="text-xl font-bold" style={{ color: room?.accent }}>{total}€</span>
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
        Hemos enviado la confirmación a tu email. Recibirás tu PIN de acceso 10 minutos antes de la sesión.
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
            {formatDate()} · {selectedTime} · {duration}h
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
          onClick={() => { setStep("room"); setSelectedRoom(null); setSelectedDate(null); setSelectedTime(null); setDuration(1); }}
          className="flex items-center gap-2 h-12 px-6 text-white text-sm tracking-widest transition-all hover:scale-105 active:scale-95"
          style={{ fontFamily: "var(--font-bebas-neue)", letterSpacing: "0.1em", background: "#FF1E3C", boxShadow: "0 0 20px rgba(255,30,60,0.4)" }}
        >
          NUEVA RESERVA
        </button>
      </div>
    </div>
  );
}
