import { useState, useCallback, useEffect } from "react";

const ZUPANIJE = [
  "Zagrebačka","Krapinsko-zagorska","Sisačko-moslavačka","Karlovačka",
  "Varaždinska","Koprivničko-križevačka","Bjelovarsko-bilogorska",
  "Primorsko-goranska","Ličko-senjska","Virovitičko-podravska",
  "Požeško-slavonska","Brodsko-posavska","Zadarska","Osječko-baranjska",
  "Šibensko-kninska","Vukovarsko-srijemska","Splitsko-dalmatinska",
  "Istarska","Dubrovačko-neretvanska","Međimurska","Grad Zagreb"
];

const RUBRIKE = [
  { id:"komunalne", label:"Komunalne usluge" },
  { id:"promet",    label:"Promet" },
  { id:"sigurnost", label:"Sigurnost i civilna zaštita" },
  { id:"zupanija",  label:"Županija, grad ili općina" },
  { id:"dogadanja", label:"Događanja" },
  { id:"ostalo",    label:"Ostalo" },
];

const ADMIN_LOZINKA = "Demo1910.";
// Supabase se poziva kroz backend funkciju

async function dohvatiVijesti() {
  const res = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "get_vijesti" })
  });
  const data = await res.json();
  return data.map(v => ({
    ...v,
    vrijeme: new Date(v.vrijeme).toLocaleString("hr-HR", {
      hour:"2-digit", minute:"2-digit", day:"2-digit", month:"2-digit"
    })
  }));
}

async function spremiVijest(vijest) {
  const res = await fetch("/.netlify/functions/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "post_vijest", vijest })
  });
  const data = await res.json();
  return data[0];
}

async function generirajVijestAI(natuknica, zupanija, rubrika) {
  const prompt = `Ti si novinar lokalnih vijesti za Hrvatsku. Na temelju sljedeće natuknice, napiši kratku vijest za web portal.

Natuknica: "${natuknica}"
Županija: ${zupanija}
Rubrika: ${rubrika}

Napiši vijest u JSON formatu, bez ikakvih markdown oznaka, samo čisti JSON:
{
  "naslov": "kratki naslov do 10 riječi",
  "tekst": "kratki tekst vijesti 2-3 rečenice, jasno i informativno"
}`;

  const res = await fetch("/.netlify/functions/claude", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      model:"claude-sonnet-4-5",
      max_tokens:1000,
      messages:[{ role:"user", content:prompt }]
    })
  });
  const data = await res.json();
  const text = data.content.map(i => i.text||"").join("");
  try { return JSON.parse(text.replace(/```json|```/g,"").trim()); }
  catch { return { naslov:"Nova vijest", tekst:text }; }
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --ink:#0f0f0f; --ink2:#2c2c2c; --ink3:#555; --ink4:#888;
  --paper:#f5f2ee; --paper2:#edeae5; --white:#fff;
  --rule:#d8d3cc; --accent:#8b1a1a; --accent-lt:#f9f0f0;
  --sans:'Source Sans 3',sans-serif; --serif:'Lora',Georgia,serif;
}
body{background:var(--paper);}
.oz{min-height:100vh;background:#c8b89a;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;font-family:var(--sans);}
.oz-inner{max-width:560px;width:100%;}
.oz-logo{text-align:center;margin-bottom:48px;}
.oz-logoflag{display:inline-flex;align-items:center;gap:14px;border-bottom:1px solid #b0a088;padding-bottom:18px;margin-bottom:18px;}
.oz-bar{width:3px;height:34px;background:var(--accent);}
.oz-name{font-family:var(--serif);font-size:20px;font-weight:700;color:#2c1f0f;text-align:left;}
.oz-sub{font-size:9px;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:#7a6a55;margin-top:4px;}
.oz-h1{font-family:var(--serif);font-size:26px;font-weight:400;color:#2c1f0f;margin-bottom:6px;}
.oz-desc{font-size:14px;color:#6a5a45;font-weight:300;}
.oz-input{width:100%;padding:12px 16px;margin-bottom:10px;background:#d8c8b0;border:1px solid #b0a088;color:#2c1f0f;font-size:14px;font-family:var(--sans);outline:none;transition:border-color .2s;}
.oz-input::placeholder{color:#9a8a75;}
.oz-input:focus{border-color:#8a7a65;}
.oz-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;}
.oz-btn{padding:11px 14px;background:#d8c8b0;border:1px solid #b0a088;color:#4a3a28;font-size:13px;font-family:var(--sans);text-align:left;cursor:pointer;transition:all .15s;}
.oz-btn:hover{border-color:var(--accent);color:var(--accent);background:#e0d0b8;}
.hdr{background:var(--white);border-bottom:1px solid var(--rule);position:sticky;top:0;z-index:200;}
.hdr-top{max-width:960px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;height:60px;}
.logo{display:flex;align-items:center;gap:12px;}
.logo-bar{width:3px;height:30px;background:var(--accent);}
.logo-name{font-family:var(--serif);font-size:18px;font-weight:700;color:var(--ink);}
.logo-sub{font-size:8px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--ink4);margin-top:2px;}
.hdr-right{display:flex;align-items:center;gap:10px;}
.hdr-btn{padding:7px 14px;font-size:12px;font-family:var(--sans);font-weight:600;letter-spacing:.3px;cursor:pointer;border:1px solid var(--rule);background:transparent;color:var(--ink3);transition:all .15s;}
.hdr-btn:hover{border-color:var(--ink3);color:var(--ink);}
.hdr-btn.on{border-color:var(--accent);color:var(--accent);background:var(--accent-lt);}
.hdr-zup{display:flex;align-items:center;gap:7px;background:none;border:none;cursor:pointer;font-size:12px;font-family:var(--sans);font-weight:600;color:var(--ink3);transition:color .15s;}
.hdr-zup:hover{color:var(--ink);}
.hdr-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);}
.nav{border-bottom:1px solid var(--rule);background:var(--white);}
.nav-inner{max-width:960px;margin:0 auto;padding:0 24px;display:flex;overflow-x:auto;}
.nav-btn{padding:13px 18px;font-size:13px;font-family:var(--sans);font-weight:500;white-space:nowrap;cursor:pointer;background:none;border:none;color:var(--ink3);border-bottom:2px solid transparent;margin-bottom:-1px;transition:all .15s;letter-spacing:.2px;}
.nav-btn:hover{color:var(--ink);}
.nav-btn.on{color:var(--accent);border-bottom-color:var(--accent);font-weight:600;}
.main{max-width:960px;margin:0 auto;padding:32px 24px;}
.breaking{border:1px solid var(--rule);background:var(--white);margin-bottom:28px;}
.breaking-lbl{display:inline-block;padding:8px 16px;background:var(--accent);font-size:10px;font-family:var(--sans);font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#fff;}
.breaking-row{display:flex;align-items:baseline;gap:16px;padding:10px 16px;border-bottom:1px solid var(--paper);cursor:pointer;transition:background .1s;}
.breaking-row:last-child{border-bottom:none;}
.breaking-row:hover{background:var(--paper);}
.breaking-title{font-family:var(--serif);font-size:15px;font-weight:600;color:var(--ink);flex:1;}
.breaking-time{font-size:11px;color:var(--ink4);font-family:var(--sans);white-space:nowrap;}
.ad{border:1px dashed var(--rule);background:var(--paper2);padding:18px 24px;margin-bottom:28px;display:flex;align-items:center;justify-content:center;color:var(--ink4);font-size:12px;font-family:var(--sans);letter-spacing:.5px;text-transform:uppercase;}
.card{background:var(--white);border:1px solid var(--rule);padding:22px 24px;margin-bottom:8px;cursor:pointer;transition:border-color .15s;}
.card:hover{border-color:#aaa;}
.card-meta{font-size:11px;font-family:var(--sans);font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--ink4);margin-bottom:8px;}
.card-meta-accent{color:var(--accent);}
.card-title{font-family:var(--serif);font-size:19px;font-weight:600;color:var(--ink);line-height:1.35;margin-bottom:10px;}
.card-text{font-family:var(--sans);font-size:14px;color:var(--ink3);line-height:1.65;font-weight:300;}
.card-foot{margin-top:14px;padding-top:12px;border-top:1px solid var(--paper2);font-size:11px;color:var(--ink4);font-family:var(--sans);}
.empty{text-align:center;padding:72px 24px;}
.empty-title{font-family:var(--serif);font-size:20px;color:var(--ink3);margin-bottom:8px;}
.empty-sub{font-size:14px;color:var(--ink4);font-family:var(--sans);}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:800;display:flex;align-items:center;justify-content:center;padding:24px;}
.modal{background:var(--white);max-width:580px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.35);}
.modal-head{padding:28px 32px 20px;border-bottom:1px solid var(--rule);margin-bottom:0;}
.modal-lbl{font-size:10px;font-family:var(--sans);font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:10px;}
.modal-title{font-family:var(--serif);font-size:23px;font-weight:600;color:var(--ink);line-height:1.3;}
.modal-body{padding:24px 32px 32px;}
.modal-text{font-family:var(--sans);font-size:15px;color:var(--ink2);line-height:1.75;font-weight:300;}
.modal-foot{margin-top:24px;padding-top:18px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;align-items:center;}
.modal-time{font-size:12px;color:var(--ink4);font-family:var(--sans);}
.btn-close{padding:9px 24px;background:var(--ink);color:#fff;border:none;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:600;letter-spacing:.3px;transition:background .15s;}
.btn-close:hover{background:var(--accent);}
.toast{position:fixed;top:20px;right:20px;z-index:1000;background:var(--ink);color:#fff;padding:13px 20px;font-family:var(--sans);font-size:13px;max-width:320px;border-left:3px solid var(--accent);box-shadow:0 8px 32px rgba(0,0,0,.3);animation:tin .25s ease;}
@keyframes tin{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.fab{position:fixed;bottom:28px;right:28px;z-index:700;width:46px;height:46px;background:var(--ink);border:none;cursor:pointer;color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.35);transition:background .15s;line-height:1;}
.fab:hover{background:var(--accent);}
.adm{background:var(--white);max-width:580px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.35);}
.adm-head{padding:28px 32px 24px;border-bottom:1px solid var(--rule);display:flex;justify-content:space-between;align-items:flex-start;}
.adm-title{font-family:var(--serif);font-size:21px;font-weight:600;color:var(--ink);}
.adm-sub{font-size:13px;color:var(--ink4);font-family:var(--sans);margin-top:4px;font-weight:300;}
.btn-x{background:none;border:none;cursor:pointer;font-size:20px;color:var(--ink4);line-height:1;padding:2px;}
.btn-x:hover{color:var(--ink);}
.adm-body{padding:28px 32px;}
.steps{display:flex;gap:6px;margin-bottom:32px;}
.step{flex:1;}
.sbar{height:3px;background:var(--rule);margin-bottom:6px;transition:background .3s;}
.sbar.done{background:var(--accent);}
.slbl{font-size:10px;font-family:var(--sans);font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--ink4);}
.slbl.done{color:var(--accent);}
.flbl{display:block;font-size:11px;font-family:var(--sans);font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--ink4);margin-bottom:8px;}
.finput,.ftarea,.fsel{width:100%;padding:11px 14px;border:1px solid var(--rule);font-size:14px;font-family:var(--sans);color:var(--ink);background:var(--white);outline:none;transition:border-color .2s;margin-bottom:20px;}
.finput:focus,.ftarea:focus,.fsel:focus{border-color:var(--ink3);}
.ftarea{resize:vertical;min-height:100px;line-height:1.6;}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px;}
.chip{padding:7px 14px;font-size:12px;font-family:var(--sans);font-weight:500;border:1px solid var(--rule);background:var(--white);color:var(--ink3);cursor:pointer;transition:all .15s;}
.chip.on{border-color:var(--ink);background:var(--ink);color:#fff;}
.chkrow{display:flex;align-items:center;gap:10px;margin-bottom:24px;font-family:var(--sans);font-size:13px;color:var(--ink2);cursor:pointer;}
.chkrow input{accent-color:var(--accent);width:16px;height:16px;}
.preview{background:var(--paper);border-left:3px solid var(--accent);padding:18px 20px;margin-bottom:24px;}
.preview-lbl{font-size:10px;font-family:var(--sans);font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--accent);margin-bottom:10px;}
.preview-title{font-family:var(--serif);font-size:17px;font-weight:600;color:var(--ink);margin-bottom:8px;line-height:1.3;}
.preview-text{font-family:var(--sans);font-size:13px;color:var(--ink3);line-height:1.65;}
.btn-regen{background:none;border:none;cursor:pointer;font-size:12px;color:var(--ink4);text-decoration:underline;margin-top:10px;font-family:var(--sans);padding:0;}
.btn-row{display:flex;gap:10px;}
.btn-p{flex:1;padding:13px;border:none;background:var(--ink);color:#fff;font-family:var(--sans);font-weight:700;font-size:14px;letter-spacing:.5px;cursor:pointer;transition:background .15s;}
.btn-p:hover:not(:disabled){background:var(--accent);}
.btn-p:disabled{background:var(--rule);color:var(--ink4);cursor:not-allowed;}
.btn-pub{flex:1;padding:13px;border:none;background:#1a3d1a;color:#fff;font-family:var(--sans);font-weight:700;font-size:14px;letter-spacing:.5px;cursor:pointer;transition:background .15s;}
.btn-pub:hover{background:#143014;}
.err{background:var(--accent-lt);border-left:3px solid var(--accent);padding:10px 14px;font-family:var(--sans);font-size:13px;color:var(--accent);margin-bottom:18px;}
.ok{text-align:center;padding:16px 0;}
.ok-icon{font-size:40px;margin-bottom:16px;color:#1a3d1a;}
.ok-title{font-family:var(--serif);font-size:21px;color:var(--ink);margin-bottom:8px;}
.ok-sub{font-size:14px;color:var(--ink3);font-family:var(--sans);margin-bottom:24px;}
.ok-row{display:flex;gap:10px;justify-content:center;}
.btn-sec{padding:10px 24px;border:1px solid var(--rule);background:var(--white);color:var(--ink3);font-family:var(--sans);font-size:13px;font-weight:600;cursor:pointer;}
.ucitavanje{text-align:center;padding:72px 24px;font-family:var(--sans);color:var(--ink4);font-size:14px;}
`;

function OdabirZupanije({ onOdabir }) {
  const [q, setQ] = useState("");
  const list = ZUPANIJE.filter(z => z.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="oz">
      <style>{CSS}</style>
      <div className="oz-inner">
        <div className="oz-logo">
          <div className="oz-logoflag">
            <div className="oz-bar" />
            <div>
              <div className="oz-name">Hrvatska</div>
              <div className="oz-sub">Lokalne Novosti</div>
            </div>
          </div>
          <h1 className="oz-h1">Odaberite svoju županiju</h1>
          <p className="oz-desc">Vijesti iz vašeg kraja, organizirane i jasne.</p>
        </div>
        <input className="oz-input" placeholder="Pretraži..." value={q} onChange={e => setQ(e.target.value)} />
        <div className="oz-grid">
          {list.map(z => <button key={z} className="oz-btn" onClick={() => onOdabir(z)}>{z}</button>)}
        </div>
      </div>
    </div>
  );
}

function VijestiPortal({ zupanija, onPromijeniZupaniju, vijesti, ucitavanje }) {
  const [rubrika,        setRubrika]        = useState("komunalne");
  const [obavijesti,     setObavijesti]     = useState(false);
  const [odabranaVijest, setOdabranaVijest] = useState(null);
  const [toast,          setToast]          = useState(null);

  const showToast = useCallback(msg => { setToast(msg); setTimeout(() => setToast(null), 3500); }, []);

  const filtrirane = vijesti.filter(v => v.zupanija === zupanija && v.rubrika === rubrika);
  const vazne      = vijesti.filter(v => v.zupanija === zupanija && v.vazna);

  return (
    <div style={{ minHeight:"100vh", background:"var(--paper)" }}>
      <style>{CSS}</style>
      {toast && <div className="toast">{toast}</div>}
      {odabranaVijest && (
        <div className="overlay" onClick={() => setOdabranaVijest(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-lbl">{zupanija} · {RUBRIKE.find(r => r.id === odabranaVijest.rubrika)?.label}</div>
              <h2 className="modal-title">{odabranaVijest.naslov}</h2>
            </div>
            <div className="modal-body">
              <p className="modal-text">{odabranaVijest.kratki_tekst}</p>
              <div className="modal-foot">
                <span className="modal-time">{odabranaVijest.vrijeme}</span>
                <button className="btn-close" onClick={() => setOdabranaVijest(null)}>Zatvori</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <header className="hdr">
        <div className="hdr-top">
          <div className="logo">
            <div className="logo-bar" />
            <div>
              <div className="logo-name">Hrvatska</div>
              <div className="logo-sub">Lokalne Novosti</div>
            </div>
          </div>
          <div className="hdr-right">
            <button className={`hdr-btn${obavijesti?" on":""}`} onClick={() => {
              setObavijesti(p => !p);
              showToast(obavijesti ? `Obavijesti za ${zupanija} isključene.` : `Obavijesti za ${zupanija} uključene.`);
            }}>
              {obavijesti ? "Obavijesti: uklj." : "Uključi obavijesti"}
            </button>
            <button className="hdr-zup" onClick={onPromijeniZupaniju}>
              <span className="hdr-dot" />{zupanija}
            </button>
          </div>
        </div>
        <nav className="nav">
          <div className="nav-inner">
            {RUBRIKE.map(r => (
              <button key={r.id} className={`nav-btn${rubrika===r.id?" on":""}`} onClick={() => setRubrika(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </nav>
      </header>
      <main className="main">
        {vazne.length > 0 && (
          <div className="breaking">
            <span className="breaking-lbl">Važne obavijesti</span>
            {vazne.map(v => (
              <div key={v.id} className="breaking-row" onClick={() => setOdabranaVijest(v)}>
                <span className="breaking-title">{v.naslov}</span>
                <span className="breaking-time">{v.vrijeme}</span>
              </div>
            ))}
          </div>
        )}
        <div className="ad">Reklamni prostor — kontaktirajte nas za oglašavanje</div>
        {ucitavanje ? (
          <div className="ucitavanje">Učitavanje vijesti...</div>
        ) : filtrirane.length === 0 ? (
          <div className="empty">
            <p className="empty-title">Još nema objava</p>
            <p className="empty-sub">Koristite admin panel za dodavanje vijesti.</p>
          </div>
        ) : filtrirane.map(v => (
          <div key={v.id} className="card" onClick={() => setOdabranaVijest(v)}>
            <div className="card-meta">
              {v.vazna && <span className="card-meta-accent">Važno · </span>}
              {RUBRIKE.find(r => r.id === v.rubrika)?.label}
            </div>
            <h3 className="card-title">{v.naslov}</h3>
            <p className="card-text">{v.kratki_tekst}</p>
            <div className="card-foot">{v.vrijeme}</div>
          </div>
        ))}
      </main>
    </div>
  );
}

function AdminPanel({ onZatvori, onNovaVijest }) {
  const [korak,  setKorak]  = useState(1);
  const [natuk,  setNatuk]  = useState("");
  const [zup,    setZup]    = useState("");
  const [rub,    setRub]    = useState("komunalne");
  const [vazna,  setVazna]  = useState(false);
  const [gen,    setGen]    = useState(false);
  const [vijest, setVijest] = useState(null);
  const [ok,     setOk]     = useState(false);
  const [err,    setErr]    = useState("");

  const generiraj = async () => {
    if (!natuk.trim() || !zup) return;
    setGen(true); setErr("");
    try {
      const v = await generirajVijestAI(natuk, zup, RUBRIKE.find(r=>r.id===rub)?.label);
      setVijest(v); setKorak(3);
    } catch {
      setErr("Greška pri generiranju. Provjerite vezu.");
    }
    setGen(false);
  };

  const objavi = async () => {
    if (!vijest) return;
    const rezultat = await onNovaVijest({
      zupanija: zup, rubrika: rub,
      naslov: vijest.naslov, kratki_tekst: vijest.tekst, vazna
    });
    if (rezultat) setOk(true);
    else setErr("Greška pri objavi. Pokušajte ponovo.");
  };

  const reset = () => {
    setKorak(1); setNatuk(""); setZup(""); setRub("komunalne");
    setVazna(false); setVijest(null); setOk(false); setErr("");
  };

  return (
    <div className="overlay">
      <div className="adm" onClick={e => e.stopPropagation()}>
        <div className="adm-head">
          <div>
            <div className="adm-title">Admin panel</div>
            <div className="adm-sub">Objavite novu vijest uz pomoć AI-a</div>
          </div>
          <button className="btn-x" onClick={onZatvori}>✕</button>
        </div>
        <div className="adm-body">
          <div className="steps">
            {["Natuknica","Lokacija","Pregled"].map((l,i) => (
              <div key={i} className="step">
                <div className={`sbar${korak>i?" done":""}`}/>
                <div className={`slbl${korak>i?" done":""}`}>{l}</div>
              </div>
            ))}
          </div>
          {ok ? (
            <div className="ok">
              <div className="ok-icon">✓</div>
              <h3 className="ok-title">Vijest je objavljena</h3>
              <p className="ok-sub">Dodano na portal za <strong>{zup}</strong></p>
              <div className="ok-row">
                <button className="btn-p" style={{flex:"0 0 auto",padding:"10px 28px"}} onClick={reset}>Nova vijest</button>
                <button className="btn-sec" onClick={onZatvori}>Zatvori</button>
              </div>
            </div>
          ) : (
            <>
              <label className="flbl">1. Natuknica</label>
              <textarea className="ftarea" value={natuk} onChange={e=>setNatuk(e.target.value)} placeholder="Npr: Otvoren novi most u centru grada, promet preusmjeren" />
              <label className="flbl">2. Županija</label>
              <select className="fsel" value={zup} onChange={e=>{setZup(e.target.value);if(e.target.value)setKorak(2);}}>
                <option value="">— Odaberite —</option>
                {ZUPANIJE.map(z=><option key={z} value={z}>{z}</option>)}
              </select>
              <label className="flbl">Rubrika</label>
              <div className="chips">
                {RUBRIKE.map(r=>(
                  <button key={r.id} className={`chip${rub===r.id?" on":""}`} onClick={()=>setRub(r.id)}>{r.label}</button>
                ))}
              </div>
              <label className="chkrow">
                <input type="checkbox" checked={vazna} onChange={e=>setVazna(e.target.checked)} />
                Označi kao važnu vijest
              </label>
              {err && <div className="err">{err}</div>}
              {vijest && korak===3 && (
                <div className="preview">
                  <div className="preview-lbl">AI generirani sadržaj</div>
                  <div className="preview-title">{vijest.naslov}</div>
                  <div className="preview-text">{vijest.tekst}</div>
                  <button className="btn-regen" onClick={()=>{setVijest(null);setKorak(2);}}>Generiraj ponovo</button>
                </div>
              )}
              <div className="btn-row">
                {!vijest ? (
                  <button className="btn-p" onClick={generiraj} disabled={!natuk.trim()||!zup||gen}>
                    {gen ? "Generiranje u tijeku..." : "Generiraj vijest s AI"}
                  </button>
                ) : (
                  <button className="btn-pub" onClick={objavi}>Objavi vijest</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LozinkaModal({ onUspjeh, onOdustani }) {
  const [unos, setUnos] = useState("");
  const [err,  setErr]  = useState(false);

  const provjeri = () => {
    if (unos === ADMIN_LOZINKA) { onUspjeh(); }
    else { setErr(true); setUnos(""); }
  };

  return (
    <div className="overlay">
      <div style={{background:"#fff",padding:"36px 32px",maxWidth:360,width:"100%",boxShadow:"0 24px 80px rgba(0,0,0,.35)"}}>
        <div style={{fontFamily:"'Lora',serif",fontSize:20,fontWeight:600,color:"#0f0f0f",marginBottom:6}}>Admin pristup</div>
        <div style={{fontFamily:"'Source Sans 3',sans-serif",fontSize:13,color:"#888",marginBottom:24,fontWeight:300}}>Unesite lozinku za objavu vijesti</div>
        {err && <div className="err">Pogrešna lozinka. Pokušajte ponovo.</div>}
        <input
          type="password"
          placeholder="Lozinka"
          value={unos}
          onChange={e=>{setUnos(e.target.value);setErr(false);}}
          onKeyDown={e=>e.key==="Enter" && provjeri()}
          style={{width:"100%",padding:"11px 14px",border:"1px solid #d8d3cc",fontSize:14,fontFamily:"sans-serif",outline:"none",marginBottom:16,boxSizing:"border-box"}}
        />
        <div style={{display:"flex",gap:10}}>
          <button className="btn-p" onClick={provjeri}>Prijava</button>
          <button className="btn-sec" onClick={onOdustani}>Odustani</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [ekran,      setEkran]      = useState("odabir");
  const [zup,        setZup]        = useState("");
  const [admin,      setAdmin]      = useState(false);
  const [lozinkaOk,  setLozinkaOk]  = useState(false);
  const [vijesti,    setVijesti]    = useState([]);
  const [ucitavanje, setUcitavanje] = useState(true);

  useEffect(() => {
    dohvatiVijesti()
      .then(data => { setVijesti(data); setUcitavanje(false); })
      .catch(() => setUcitavanje(false));
  }, []);

  const handleNovaVijest = async (v) => {
    const spremljena = await spremiVijest(v);
    if (spremljena) {
      const formatirana = {
        ...spremljena,
        vrijeme: new Date(spremljena.vrijeme).toLocaleString("hr-HR", {
          hour:"2-digit", minute:"2-digit", day:"2-digit", month:"2-digit"
        })
      };
      setVijesti(p => [formatirana, ...p]);
      return formatirana;
    }
    return null;
  };

  return (
    <>
      <style>{CSS}</style>
      {ekran==="odabir" && <OdabirZupanije onOdabir={z=>{setZup(z);setEkran("portal");}} />}
      {ekran==="portal" && (
        <>
          <VijestiPortal
            zupanija={zup}
            onPromijeniZupaniju={()=>setEkran("odabir")}
            vijesti={vijesti}
            ucitavanje={ucitavanje}
          />
          <button className="fab" onClick={()=>setAdmin(true)} title="Admin panel">✎</button>
        </>
      )}
      {admin && !lozinkaOk && (
        <LozinkaModal
          onUspjeh={()=>setLozinkaOk(true)}
          onOdustani={()=>setAdmin(false)}
        />
      )}
      {admin && lozinkaOk && (
        <AdminPanel
          onZatvori={()=>{ setAdmin(false); setLozinkaOk(false); }}
          onNovaVijest={handleNovaVijest}
        />
      )}
    </>
  );
}
