import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed, Shirt, Wallet, Package, ArrowLeft, Plus, Check,
  Link2, MapPin, Phone, User, Clock, Sparkles, ChevronRight, Loader2,
} from "lucide-react";
import { supabase } from "./supabase.js";

/*
  SETHU — customer ordering app (connected to Supabase)
  Home -> Food/Clothing request forms -> Wallet -> Orders.
  When an order is submitted, it SAVES into the Supabase 'orders' table,
  so the ops dashboard (built next) can read it. This is the customer->ops bridge.
*/

const K = {
  night: "#141B34", nightDeep: "#0C1122", lamp: "#E8A33D", rose: "#E6A08C",
  cream: "#F7F1E7", creamDeep: "#EFE6D6", ink: "#22283C", slate: "#5C6478",
  mist: "#9AA0B0", leaf: "#5B8C6E", thread: "#B23A48",
};
const SERIF = "'Fraunces', Georgia, serif";
const SANS = "'Karla', system-ui, sans-serif";

const KIND_COPY = {
  food: { label: "food", accent: K.lamp, icon: UtensilsCrossed, linkLabel: "Swiggy link", linkPlaceholder: "Paste the restaurant or dish link", notesLabel: "What to order", notesPlaceholder: "2 butter chicken, 1 garlic naan, extra raita", confirmWindow: "Confirmed within 15 minutes, during meal windows." },
  clothing: { label: "clothing", accent: K.rose, icon: Shirt, linkLabel: "Myntra link", linkPlaceholder: "Paste the product link", notesLabel: "Size & details", notesPlaceholder: "Size M, blue if it's in stock", confirmWindow: "Confirmed within one business day." },
};

const inputStyle = { width: "100%", border: `1px solid ${K.creamDeep}`, borderRadius: 10, padding: "11px 13px", fontSize: 15, fontFamily: SANS, color: K.ink, background: "#fff", outline: "none", boxSizing: "border-box" };

function AppHeader({ setScreen, walletBalance }) {
  return (
    <header style={{ background: K.night, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <span style={{ fontFamily: SERIF, color: K.cream, fontSize: 22, fontWeight: 600 }}>Sethu</span>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => setScreen("orders")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 999, padding: "7px 12px", color: K.cream, cursor: "pointer", fontFamily: SANS, fontSize: 14 }}>
          <Package size={14} /> Orders
        </button>
        <button onClick={() => setScreen("wallet")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: K.lamp, border: "none", borderRadius: 999, padding: "7px 14px", color: K.nightDeep, cursor: "pointer", fontFamily: SANS, fontSize: 14, fontWeight: 700 }}>
          <Wallet size={14} />${walletBalance}
        </button>
      </div>
    </header>
  );
}

function ChoiceCard({ kind, onClick }) {
  const c = KIND_COPY[kind]; const Icon = c.icon;
  const desc = kind === "food" ? "A meal from Swiggy, delivered today." : "An outfit from Myntra, chosen by you.";
  const title = kind === "food" ? "Order food" : "Order clothing";
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", textAlign: "left", background: "#fff", border: `1px solid ${K.creamDeep}`, borderRadius: 16, padding: 20, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 52, height: 52, borderRadius: 12, background: `${c.accent}1A`, color: c.accent }}>
        <Icon size={24} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: K.ink }}>{title}</div>
        <div style={{ fontSize: 14, color: K.slate, marginTop: 2 }}>{desc}</div>
      </div>
      <ChevronRight size={20} color={K.slate} />
    </button>
  );
}

function AppHome({ setScreen }) {
  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "34px 20px 40px" }}>
      <h1 style={{ fontFamily: SERIF, fontSize: 27, fontWeight: 600, color: K.ink, margin: "0 0 4px" }}>Welcome</h1>
      <p style={{ color: K.slate, fontSize: 15, margin: "0 0 26px" }}>What are you sending home today?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <ChoiceCard kind="food" onClick={() => setScreen("food")} />
        <ChoiceCard kind="clothing" onClick={() => setScreen("clothing")} />
      </div>
    </div>
  );
}

function BackBar({ onBack }) {
  return (
    <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: K.ink, padding: "18px 20px 4px", fontFamily: SANS, fontSize: 14, fontWeight: 600 }}>
      <ArrowLeft size={16} /> Home
    </button>
  );
}

function Field({ label, icon, children }) {
  const Icon = icon;
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: K.ink, marginBottom: 7, fontFamily: SANS }}>
        {Icon && <Icon size={14} color={K.slate} />}{label}
      </label>
      {children}
    </div>
  );
}

function RequestForm({ kind, walletBalance, onSubmit, onBack, submitting }) {
  const c = KIND_COPY[kind];
  const [link, setLink] = useState(""); const [notes, setNotes] = useState("");
  const [deliveryWindow, setDeliveryWindow] = useState("lunch"); const [budget, setBudget] = useState("");
  const [recipientName, setRecipientName] = useState(""); const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState(""); const [occasion, setOccasion] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!link.trim()) return setError("Add a link so we know exactly what to order.");
    if (!budget || Number(budget) <= 0) return setError("Set a budget cap.");
    if (!recipientName.trim() || !recipientAddress.trim()) return setError("Add who this is for, and where it's going.");
    if (Number(budget) > walletBalance) return setError(`Your wallet has $${walletBalance} — add funds before sending this.`);
    setError("");
    onSubmit({
      kind,
      title: kind === "food" ? `Dinner for ${recipientName}` : `${recipientName}'s order`,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      recipient_address: recipientAddress,
      item_link: link,
      notes,
      budget: Number(budget),
      delivery_window: kind === "food" ? deliveryWindow : null,
      occasion,
    });
  }

  return (
    <div style={{ maxWidth: 460, margin: "0 auto", paddingBottom: 40 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <c.icon size={20} color={c.accent} />
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: K.ink, margin: 0 }}>{kind === "food" ? "Order food" : "Order clothing"}</h2>
        </div>
        <p style={{ color: K.slate, fontSize: 14, margin: "0 0 22px" }}>Paste a link, tell us the details, and our India team takes it from there.</p>

        <Field label={c.linkLabel} icon={Link2}><input style={inputStyle} value={link} onChange={(e) => setLink(e.target.value)} placeholder={c.linkPlaceholder} /></Field>
        <Field label={c.notesLabel}><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={c.notesPlaceholder} /></Field>

        {kind === "food" && (
          <Field label="When should it arrive?" icon={Clock}>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ id: "lunch", label: "Lunch · 12–2pm IST" }, { id: "dinner", label: "Dinner · 7–10pm IST" }].map((opt) => (
                <button key={opt.id} onClick={() => setDeliveryWindow(opt.id)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${deliveryWindow === opt.id ? c.accent : K.creamDeep}`, background: deliveryWindow === opt.id ? `${c.accent}14` : "#fff", color: deliveryWindow === opt.id ? c.accent : K.slate, cursor: "pointer", fontFamily: SANS, fontSize: 13.5, fontWeight: 600 }}>{opt.label}</button>
              ))}
            </div>
          </Field>
        )}

        <Field label="Budget cap">
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: K.slate, fontSize: 15 }}>$</span>
            <input style={{ ...inputStyle, paddingLeft: 24 }} value={budget} onChange={(e) => setBudget(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="25" inputMode="decimal" />
          </div>
        </Field>
        <Field label="Who's this for?" icon={User}><input style={inputStyle} value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient's name" /></Field>
        <Field label="Their phone number" icon={Phone}><input style={inputStyle} value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+91 ..." /></Field>
        <Field label="Delivery address in India" icon={MapPin}><textarea style={{ ...inputStyle, minHeight: 62, resize: "vertical" }} value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="Street, city, PIN code" /></Field>
        <Field label="Occasion (optional)" icon={Sparkles}><input style={inputStyle} value={occasion} onChange={(e) => setOccasion(e.target.value)} placeholder="Just because, a birthday, Diwali..." /></Field>

        {error && <p style={{ color: K.thread, fontSize: 13.5, marginBottom: 14, fontWeight: 600 }}>{error}</p>}
        <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", background: K.night, color: K.cream, border: "none", borderRadius: 12, padding: 14, fontSize: 15.5, cursor: submitting ? "wait" : "pointer", fontFamily: SANS, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? <><Loader2 size={16} className="spin" /> Sending…</> : "Send this request"}
        </button>
        <p style={{ color: K.slate, fontSize: 12.5, marginTop: 10, textAlign: "center" }}>{c.confirmWindow}</p>
      </div>
    </div>
  );
}

function ConfirmationScreen({ order, setScreen }) {
  const c = KIND_COPY[order.kind];
  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, borderRadius: "50%", background: `${K.leaf}1A`, color: K.leaf, margin: "0 auto 18px" }}><Check size={30} /></div>
      <h2 style={{ fontFamily: SERIF, fontSize: 25, fontWeight: 600, color: K.ink, marginBottom: 8 }}>Request sent.</h2>
      <p style={{ color: K.slate, fontSize: 14.5, marginBottom: 26 }}>{c.confirmWindow}</p>
      <div style={{ background: "#fff", border: `1px solid ${K.creamDeep}`, borderRadius: 14, padding: 18, textAlign: "left", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><c.icon size={16} color={c.accent} /><span style={{ fontWeight: 700, color: K.ink, fontSize: 15 }}>{order.title}</span></div>
        <div style={{ fontSize: 13.5, color: K.slate, lineHeight: 1.7 }}>
          <div>To: {order.recipient_name}</div><div>Budget: ${order.budget}</div>
          {order.delivery_window && <div>Window: {order.delivery_window === "lunch" ? "Lunch · 12–2pm IST" : "Dinner · 7–10pm IST"}</div>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => setScreen("orders")} style={{ background: K.night, color: K.cream, border: "none", borderRadius: 12, padding: 13, fontFamily: SANS, cursor: "pointer", fontWeight: 600 }}>See all orders</button>
        <button onClick={() => setScreen("home")} style={{ background: "none", color: K.ink, border: `1px solid ${K.creamDeep}`, borderRadius: 12, padding: 13, fontFamily: SANS, cursor: "pointer", fontWeight: 600 }}>Back to home</button>
      </div>
    </div>
  );
}

function WalletScreen({ balance, ledger, onAddFunds, onBack }) {
  const [custom, setCustom] = useState("");
  return (
    <div style={{ maxWidth: 460, margin: "0 auto", paddingBottom: 40 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "8px 20px 0" }}>
        <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: K.ink, margin: "0 0 4px" }}>Wallet</h2>
        <p style={{ color: K.slate, fontSize: 14, margin: "0 0 20px" }}>Funds here pay for requests instantly — no card entry each time.</p>
        <div style={{ background: K.night, borderRadius: 16, padding: 22, marginBottom: 22, textAlign: "center" }}>
          <p style={{ color: "#C4CADA", fontSize: 13, marginBottom: 6 }}>Current balance</p>
          <p style={{ fontFamily: SERIF, color: K.cream, fontSize: 38, fontWeight: 600, margin: 0 }}>${balance}</p>
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: K.ink, marginBottom: 10 }}>Add funds</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[25, 50, 100].map((amt) => (
            <button key={amt} onClick={() => onAddFunds(amt)} style={{ flex: 1, border: `1.5px solid ${K.creamDeep}`, borderRadius: 10, padding: "11px 0", background: "#fff", color: K.ink, cursor: "pointer", fontFamily: SANS, fontWeight: 600 }}>+${amt}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          <input style={inputStyle} value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Custom amount" inputMode="decimal" />
          <button onClick={() => { const n = Number(custom); if (n > 0) { onAddFunds(n); setCustom(""); } }} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: K.lamp, color: K.nightDeep, border: "none", borderRadius: 10, padding: "0 16px", cursor: "pointer", fontFamily: SANS, fontWeight: 700, whiteSpace: "nowrap" }}><Plus size={15} /> Add</button>
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: K.ink, marginBottom: 10 }}>Recent activity</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ledger.map((item) => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: `1px solid ${K.creamDeep}`, borderRadius: 10, padding: "11px 13px" }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: K.ink }}>{item.desc}</div><div style={{ fontSize: 12, color: K.slate }}>{item.date}</div></div>
              <span style={{ fontWeight: 700, fontSize: 14, color: item.amount > 0 ? K.leaf : K.thread }}>{item.amount > 0 ? "+" : "-"}${Math.abs(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STATUS_COPY = {
  requested: { label: "Requested", color: K.slate },
  confirmed: { label: "Confirmed", color: K.lamp },
  out_for_delivery: { label: "Out for delivery", color: K.night },
  delivered: { label: "Delivered", color: K.leaf },
};

function OrdersScreen({ orders, loading, onBack, onRefresh }) {
  return (
    <div style={{ maxWidth: 460, margin: "0 auto", paddingBottom: 40 }}>
      <BackBar onBack={onBack} />
      <div style={{ padding: "8px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 600, color: K.ink, margin: 0 }}>Your orders</h2>
          <button onClick={onRefresh} style={{ background: "none", border: `1px solid ${K.creamDeep}`, borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600, color: K.ink, cursor: "pointer", fontFamily: SANS }}>Refresh</button>
        </div>
        {loading && <p style={{ color: K.slate, fontSize: 14 }}>Loading…</p>}
        {!loading && orders.length === 0 && <p style={{ color: K.slate, fontSize: 14 }}>Nothing yet — send your first request from the home screen.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => {
            const c = KIND_COPY[o.kind] || KIND_COPY.food; const s = STATUS_COPY[o.status] || STATUS_COPY.requested;
            return (
              <div key={o.id} style={{ background: "#fff", border: `1px solid ${K.creamDeep}`, borderRadius: 14, padding: 15 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9, background: `${c.accent}1A`, color: c.accent }}><c.icon size={16} /></div>
                    <div><div style={{ fontWeight: 700, fontSize: 14.5, color: K.ink }}>{o.title}</div><div style={{ fontSize: 12.5, color: K.slate }}>{o.recipient_name}{o.recipient_address ? ` · ${(o.recipient_address.split(",")[0] || "").trim()}` : ""}</div></div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14.5, color: K.ink }}>${o.budget}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: s.color, background: `${s.color}14`, padding: "3px 9px", borderRadius: 999 }}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [walletBalance, setWalletBalance] = useState(150);
  const [ledger, setLedger] = useState([{ id: 1, amount: 100, date: "Recently", desc: "Wallet top-up" }, { id: 2, amount: 50, date: "Recently", desc: "Wallet top-up" }]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadOrders() {
    setOrdersLoading(true);
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setOrdersLoading(false);
  }

  useEffect(() => { if (screen === "orders") loadOrders(); }, [screen]);

  async function handleSubmitOrder(order) {
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert([{ ...order, status: "requested" }]);
    setSubmitting(false);
    if (error) { alert("Something went wrong saving your order. Please try again."); return; }
    setWalletBalance((b) => b - order.budget);
    setLedger((list) => [{ id: Date.now(), amount: -order.budget, date: "Today", desc: order.title }, ...list]);
    setLastOrder(order);
    setScreen("confirmation");
  }

  function handleAddFunds(amount) {
    setWalletBalance((b) => b + amount);
    setLedger((list) => [{ id: Date.now(), amount, date: "Today", desc: "Wallet top-up" }, ...list]);
  }

  return (
    <div style={{ fontFamily: SANS, background: K.cream, minHeight: "100vh", color: K.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Karla:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; } body { margin: 0; }
        input:focus, textarea:focus { border-color: ${K.night} !important; }
        input::placeholder, textarea::placeholder { color: ${K.mist}; opacity: 0.75; }
        .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <AppHeader setScreen={setScreen} walletBalance={walletBalance} />
      {screen === "home" && <AppHome setScreen={setScreen} />}
      {(screen === "food" || screen === "clothing") && <RequestForm kind={screen} walletBalance={walletBalance} onSubmit={handleSubmitOrder} onBack={() => setScreen("home")} submitting={submitting} />}
      {screen === "wallet" && <WalletScreen balance={walletBalance} ledger={ledger} onAddFunds={handleAddFunds} onBack={() => setScreen("home")} />}
      {screen === "confirmation" && lastOrder && <ConfirmationScreen order={lastOrder} setScreen={setScreen} />}
      {screen === "orders" && <OrdersScreen orders={orders} loading={ordersLoading} onBack={() => setScreen("home")} onRefresh={loadOrders} />}
    </div>
  );
}
