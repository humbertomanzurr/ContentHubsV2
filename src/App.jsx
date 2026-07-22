import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── AUTH ───────────────────────────────────────────────────────────────────────
const CREDS = { email: "humberto@revolabsmedia.com", password: "Revo2026!" };

// ── TAXONOMY ───────────────────────────────────────────────────────────────────
const HOOKS = ["Impacto","Curiosidad","Historia","Transformacion","POV","Deseo","Antes/Despues","Pregunta","Estadistica","Problema","Error","Controversia","Comparacion","Autoridad","Miedo","Reto"];
const FORMATS = ["Demostracion de Producto","Hablando a Camara","Tutorial","Tendencia","UGC","Voz en Off","Fundador","Podcast","Entrevista en la Calle","Estilo de Vida","Meme","Educativo","Detras de Camaras","Caso de Estudio"];
const CTAS = ["Seguir","Guardar","Comentar","Compartir","Visitar Perfil","Comprar","Mensaje Directo","Link en Bio","Sin CTA"];
const PLATFORMS = ["TikTok","Instagram Reels","YouTube Shorts","Facebook","LinkedIn"];
const TRIGGERS = ["Sorprendente","Inspirador","Identificable","Gracioso","Educativo","Curiosidad","Satisfaccion","Miedo","Urgencia","Enojo","Asombro","Asco"];
const PILLARS = ["Entretenimiento","Educacion","Conversion","Comunidad","Reconocimiento de Marca","Retencion"];

// ── SEED DATA ──────────────────────────────────────────────────────────────────
const SEED_CLIENTS = [
  { id:"tony",    name:"Tony",          retainer:89000,   industry:"Retail",       status:"active", am:"Sofia", goal:"Brand awareness + crecimiento de seguidores" },
  { id:"unitam",  name:"Unitam",        retainer:40000,   industry:"Moda",         status:"active", am:"Sofia", goal:"Engagement y comunidad" },
  { id:"solanum", name:"Solanum",       retainer:100000,  industry:"Fitness",      status:"active", am:"Sofia", goal:"Brand awareness - debut" },
  { id:"celularte",name:"Celularte",    retainer:40000,   industry:"Retail",       status:"pending",am:"Sofia", goal:"Ventas y tráfico" },
  { id:"carso",   name:"Grupo Carso",   retainer:1300000, industry:"Conglomerado", status:"pending",am:"Sofia", goal:"Presencia digital" },
  { id:"fredinero",name:"Fredinero",    retainer:null,    industry:"Fintech",      status:"pending",am:"Sofia", goal:"Generación de leads" },
  { id:"matera",  name:"Matera Motors", retainer:null,    industry:"Automotriz",   status:"pending",am:"Sofia", goal:"Awareness" },
];

const SEED_VIDEOS = [
  { id:"v001",clientId:"tony",   title:"TOP INESPERADO",             platform:"TikTok",publishDate:"2026-06-23",creator:"Álvaro Salinas",      editor:"Paco",  cm:"Itzel",  hook:"Impacto",      format:"Demostracion de Producto",cta:"Seguir",       trigger:"Sorprendente",pillar:"Entretenimiento",      pauta:800, views:56000,likes:2100,comments:340,shares:890, saves:760,duration:45,watchTimeAvg:28,followers:520 },
  { id:"v002",clientId:"tony",   title:"COLECCIÓN MUNDIAL",          platform:"TikTok",publishDate:"2026-06-25",creator:"Santiago Paniagua",   editor:"Paco",  cm:"Itzel",  hook:"Impacto",      format:"Tendencia",               cta:"Compartir",    trigger:"Inspirador",  pillar:"Entretenimiento",      pauta:800, views:53000,likes:1980,comments:290,shares:1200,saves:430,duration:38,watchTimeAvg:24,followers:490 },
  { id:"v003",clientId:"tony",   title:"HAÚL ASMR",                  platform:"TikTok",publishDate:"2026-06-13",creator:"Ivanna Paniagua",     editor:"Paco",  cm:"Paula",  hook:"Impacto",      format:"Demostracion de Producto",cta:"Guardar",      trigger:"Satisfaccion",pillar:"Entretenimiento",      pauta:714, views:33000,likes:1450,comments:210,shares:340, saves:890,duration:52,watchTimeAvg:31,followers:310 },
  { id:"v004",clientId:"tony",   title:"SEMANA SMARTY",              platform:"TikTok",publishDate:"2026-06-22",creator:"Álvaro Salinas",      editor:"Danny", cm:"Itzel",  hook:"Impacto",      format:"Hablando a Camara",       cta:"Seguir",       trigger:"Curiosidad",  pillar:"Educacion",            pauta:840, views:32000,likes:1230,comments:450,shares:280, saves:340,duration:41,watchTimeAvg:26,followers:290 },
  { id:"v005",clientId:"tony",   title:"Lo hicimos real",            platform:"TikTok",publishDate:"2026-06-03",creator:"Efrén",               editor:"Danny", cm:"Itzel",  hook:"Transformacion",format:"Tutorial",                cta:"Guardar",      trigger:"Inspirador",  pillar:"Educacion",            pauta:410, views:27300,likes:980, comments:320,shares:180, saves:720,duration:58,watchTimeAvg:34,followers:250 },
  { id:"v006",clientId:"tony",   title:"Vibras de verano",           platform:"TikTok",publishDate:"2026-06-05",creator:"Ivanna Paniagua",     editor:"Danny", cm:"Paula",  hook:"Deseo",        format:"Voz en Off",              cta:"Seguir",       trigger:"Identificable",pillar:"Entretenimiento",      pauta:410, views:25000,likes:920, comments:180,shares:420, saves:290,duration:30,watchTimeAvg:19,followers:230 },
  { id:"v007",clientId:"tony",   title:"REGALO PARA PAPÁ",           platform:"TikTok",publishDate:"2026-06-19",creator:"Álvaro Salinas",      editor:"Danny", cm:"Itzel",  hook:"Antes/Despues", format:"Tutorial",               cta:"Comprar",      trigger:"Deseo",       pillar:"Conversion",           pauta:400, views:20000,likes:760, comments:290,shares:120, saves:480,duration:44,watchTimeAvg:22,followers:180 },
  { id:"v008",clientId:"tony",   title:"PARA MI PAPÁ ES",            platform:"TikTok",publishDate:"2026-06-21",creator:"Hugo",                editor:"Danny", cm:"Itzel",  hook:"Deseo",        format:"Tendencia",               cta:"Sin CTA",      trigger:"Identificable",pillar:"Entretenimiento",      pauta:400, views:7461, likes:890, comments:340,shares:120, saves:220,duration:22,watchTimeAvg:14,followers:70  },
  { id:"v009",clientId:"tony",   title:"EXPERTONY CONTESTA P.3",     platform:"TikTok",publishDate:"2026-06-29",creator:"Álvaro Salinas",      editor:"Danny", cm:"Itzel",  hook:"Pregunta",     format:"Hablando a Camara",       cta:"Comentar",     trigger:"Curiosidad",  pillar:"Comunidad",            pauta:0,   views:849,  likes:45,  comments:89, shares:12,  saves:23, duration:35,watchTimeAvg:18,followers:8   },
  { id:"v010",clientId:"unitam", title:"¡Ya llego a Unitam!",        platform:"TikTok",publishDate:"2026-06-15",creator:"Álvaro Salinas",      editor:"Danny", cm:"Ivanna", hook:"Impacto",      format:"Hablando a Camara",       cta:"Visitar Perfil",trigger:"Sorprendente",pillar:"Entretenimiento",      pauta:800, views:46000,likes:1780,comments:390,shares:650, saves:420,duration:28,watchTimeAvg:19,followers:420 },
  { id:"v011",clientId:"unitam", title:"Playeras nuevas",            platform:"TikTok",publishDate:"2026-06-12",creator:"Paula, Cristian, Paco",editor:"Danny", cm:"Ivanna", hook:"POV",          format:"Tendencia",               cta:"Compartir",    trigger:"Identificable",pillar:"Entretenimiento",      pauta:800, views:40000,likes:1560,comments:280,shares:890, saves:340,duration:18,watchTimeAvg:14,followers:370 },
  { id:"v012",clientId:"unitam", title:"Prompt Guion Viral ChatGPT", platform:"TikTok",publishDate:"2026-06-29",creator:"Galilea Espinoza",    editor:"Paco",  cm:"Ivanna", hook:"Curiosidad",   format:"Hablando a Camara",       cta:"Guardar",      trigger:"Educativo",   pillar:"Educacion",            pauta:0,   views:12000,likes:580, comments:210,shares:180, saves:890,duration:45,watchTimeAvg:32,followers:110 },
  { id:"v013",clientId:"unitam", title:"1, 2, 3... ¡UNITAM!",        platform:"TikTok",publishDate:"2026-06-18",creator:"Mariana García",      editor:"Paco",  cm:"Ivanna", hook:"Historia",     format:"Tendencia",               cta:"Seguir",       trigger:"Gracioso",    pillar:"Entretenimiento",      pauta:200, views:8795, likes:340, comments:120,shares:89,  saves:67, duration:15,watchTimeAvg:12,followers:82  },
  { id:"v014",clientId:"unitam", title:"Día del padre",              platform:"TikTok",publishDate:"2026-06-21",creator:"Álvaro Salinas",      editor:"Danny", cm:"Ivanna", hook:"Deseo",        format:"Hablando a Camara",       cta:"Compartir",    trigger:"Identificable",pillar:"Entretenimiento",      pauta:200, views:7958, likes:310, comments:98, shares:120, saves:89, duration:22,watchTimeAvg:15,followers:74  },
  { id:"v015",clientId:"unitam", title:"Tiempo Récord",              platform:"TikTok",publishDate:"2026-06-23",creator:"Mariana García",      editor:"Paco",  cm:"Ivanna", hook:"Impacto",      format:"Tutorial",                cta:"Guardar",      trigger:"Sorprendente",pillar:"Educacion",            pauta:200, views:719,  likes:34,  comments:18, shares:8,   saves:45, duration:30,watchTimeAvg:12,followers:7   },
  { id:"v016",clientId:"solanum",title:"This is Solanum",            platform:"TikTok",publishDate:"2026-06-16",creator:"Ana Paula y Sofia",   editor:"Danny", cm:"Larissa",hook:"Historia",     format:"Hablando a Camara",       cta:"Seguir",       trigger:"Inspirador",  pillar:"Reconocimiento de Marca",pauta:700, views:20000,likes:780, comments:210,shares:340, saves:290,duration:42,watchTimeAvg:26,followers:188 },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
const fmt = n => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(0)+"K" : String(n||0);
const engRate = v => v.views > 0 ? (((v.likes+v.comments+v.shares+v.saves)/v.views)*100).toFixed(1)+"%" : "—";
const roiStr = v => v.pauta > 0 && v.views > 0 ? "$"+(v.pauta/v.views*1000).toFixed(2)+"/1K" : v.pauta === 0 ? "Orgánico" : "—";
const cVids = (videos, id) => videos.filter(v => v.clientId === id);
const totViews = vs => vs.reduce((s,v) => s+v.views, 0);
const totPauta = vs => vs.reduce((s,v) => s+v.pauta, 0);
const avgEngStr = vs => vs.length ? (vs.reduce((s,v) => s+(v.views>0?(v.likes+v.comments+v.shares+v.saves)/v.views:0),0)/vs.length*100).toFixed(1)+"%" : "—";
const hookChart = vs => {
  const m = {};
  vs.forEach(v => { if(!m[v.hook]) m[v.hook]={n:0,s:0}; m[v.hook].n++; m[v.hook].s+=v.views; });
  return Object.entries(m).map(([h,d]) => ({name:h, avg:Math.round(d.s/d.n), n:d.n})).sort((a,b) => b.avg-a.avg);
};

// ── COLORS ─────────────────────────────────────────────────────────────────────
const gold="#D4A017", dark0="#07090F", dark1="#0D1320", dark2="#141D2E", dark3="#1A2438";
const muted="#64748B", muted2="#94A3B8", green="#22C55E", text="#E2E8F0";

// ── STORAGE ────────────────────────────────────────────────────────────────────
const store = {
  get: key => { try { const v=localStorage.getItem(key); return v?JSON.parse(v):null; } catch { return null; } },
  set: (key,val) => { try { localStorage.setItem(key,JSON.stringify(val)); } catch {} },
};

// ── COMPONENTS ─────────────────────────────────────────────────────────────────
function Tag({ children, color="#D4A017" }) {
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:700,background:color+"22",color,marginRight:4,marginBottom:2}}>{children}</span>;
}

function Kpi({ v, l }) {
  return (
    <div style={{background:dark2,borderRadius:12,padding:"18px 16px",border:"1px solid "+dark3}}>
      <div style={{fontSize:28,fontWeight:800,color:gold,lineHeight:1}}>{v}</div>
      <div style={{fontSize:11,color:muted,marginTop:5}}>{l}</div>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const go = () => {
    if (email === CREDS.email && pass === CREDS.password) onLogin();
    else setErr("Credenciales incorrectas");
  };

  return (
    <div style={{minHeight:"100vh",background:dark0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:340,padding:40,background:dark1,borderRadius:20,border:"1px solid "+dark3}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:26,fontWeight:900,color:gold,letterSpacing:-1}}>TheContentHub</div>
          <div style={{fontSize:10,color:muted,letterSpacing:3,marginTop:4}}>REVO LABS</div>
        </div>
        {[["Email","email",email,setEmail],["Contraseña","password",pass,setPass]].map(([l,t,v,sv]) => (
          <div key={l} style={{marginBottom:16}}>
            <div style={{fontSize:11,color:muted,marginBottom:6}}>{l}</div>
            <input type={t} value={v} onChange={x=>sv(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()}
              placeholder={l==="Email"?"humberto@revolabsmedia.com":""}
              style={{width:"100%",background:dark0,border:"1px solid "+dark3,borderRadius:8,padding:"10px 12px",color:text,fontSize:13,outline:"none",boxSizing:"border-box"}} />
          </div>
        ))}
        {err && <div style={{color:"#EF4444",fontSize:12,marginBottom:12}}>{err}</div>}
        <button onClick={go} style={{width:"100%",padding:13,background:gold,color:dark0,border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer"}}>
          Entrar
        </button>
      </div>
    </div>
  );
}

// ── ADD VIDEO MODAL ────────────────────────────────────────────────────────────
function AddModal({ clients, defaultClientId, onSave, onClose }) {
  const blank = { clientId:defaultClientId||"",title:"",platform:"TikTok",publishDate:new Date().toISOString().slice(0,10),creator:"",editor:"",cm:"",hook:"",format:"",cta:"",trigger:"",pillar:"",pauta:"0",views:"0",likes:"0",comments:"0",shares:"0",saves:"0",duration:"0",watchTimeAvg:"0",followers:"0" };
  const [f, sf] = useState(blank);
  const set = (k,v) => sf(p => ({...p,[k]:v}));

  const save = () => {
    if (!f.clientId || !f.title) return;
    const nums = ["pauta","views","likes","comments","shares","saves","duration","watchTimeAvg","followers"];
    onSave({...f, id:"v"+Date.now(), ...nums.reduce((o,k)=>({...o,[k]:+(f[k]||0)}),{})});
    onClose();
  };

  const inp = (l,k,t="text",opts) => (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:10,color:muted,marginBottom:4,letterSpacing:.5}}>{l}</div>
      {opts
        ? <select value={f[k]} onChange={x=>set(k,x.target.value)} style={{width:"100%",background:dark0,border:"1px solid "+dark3,borderRadius:7,padding:"9px 10px",color:text,fontSize:12,outline:"none",boxSizing:"border-box"}}>
            <option value="">Seleccionar...</option>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        : <input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={{width:"100%",background:dark0,border:"1px solid "+dark3,borderRadius:7,padding:"9px 10px",color:text,fontSize:12,outline:"none",boxSizing:"border-box"}} />
      }
    </div>
  );

  const sec = l => <div style={{fontSize:10,color:gold,letterSpacing:2,fontWeight:700,margin:"14px 0 8px"}}>{l}</div>;
  const g2 = {display:"grid",gridTemplateColumns:"1fr 1fr",gap:12};

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,paddingTop:24,paddingBottom:24,overflowY:"auto"}}>
      <div style={{background:dark2,borderRadius:16,border:"1px solid "+dark3,width:"min(680px,95vw)",fontFamily:"system-ui,sans-serif"}}>
        <div style={{padding:"22px 26px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:17,fontWeight:700,color:text}}>Agregar video</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:muted,fontSize:22,cursor:"pointer",lineHeight:1}}>×</button>
        </div>
        <div style={{padding:"16px 26px 26px"}}>
          {sec("INFO GENERAL")}
          <div style={g2}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:muted,marginBottom:4}}>Cliente</div>
              <select value={f.clientId} onChange={x=>set("clientId",x.target.value)} style={{width:"100%",background:dark0,border:"1px solid "+dark3,borderRadius:7,padding:"9px 10px",color:text,fontSize:12,outline:"none",boxSizing:"border-box"}}>
                <option value="">Seleccionar...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {inp("Plataforma","platform","text",PLATFORMS)}
          </div>
          {inp("Título del video","title")}
          <div style={g2}>{inp("Fecha de publicación","publishDate","date")}{inp("Duración (seg)","duration","number")}</div>
          <div style={g2}>{inp("Creador / Talent","creator")}{inp("Editor","editor")}</div>
          <div style={g2}>{inp("Community Manager","cm")}{inp("Pauta ($)","pauta","number")}</div>
          {sec("ATRIBUTOS CREATIVOS")}
          <div style={g2}>{inp("Hook","hook","text",HOOKS)}{inp("Formato","format","text",FORMATS)}</div>
          <div style={g2}>{inp("CTA","cta","text",CTAS)}{inp("Disparador emocional","trigger","text",TRIGGERS)}</div>
          {inp("Pilar de contenido","pillar","text",PILLARS)}
          {sec("MÉTRICAS")}
          <div style={g2}>{inp("Vistas","views","number")}{inp("Me gusta","likes","number")}</div>
          <div style={g2}>{inp("Comentarios","comments","number")}{inp("Compartidos","shares","number")}</div>
          <div style={g2}>{inp("Guardados","saves","number")}{inp("Seguidores ganados","followers","number")}</div>
          <div style={g2}>{inp("Tiempo viz. promedio (seg)","watchTimeAvg","number")}</div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}>
            <button onClick={onClose} style={{padding:"9px 18px",background:dark3,color:muted2,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600}}>Cancelar</button>
            <button onClick={save} style={{padding:"9px 18px",background:gold,color:dark0,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>Guardar video</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ clients, videos, onClient }) {
  const top = [...videos].sort((a,b) => b.views-a.views)[0];
  const clName = id => clients.find(c => c.id===id)?.name||"";
  const hd = hookChart(videos);

  return (
    <div>
      <div style={{marginBottom:22}}>
        <div style={{fontSize:20,fontWeight:800,color:text}}>Agency Dashboard</div>
        <div style={{fontSize:12,color:muted,marginTop:3}}>Junio 2026 · {videos.length} videos · {clients.length} clientes</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <Kpi v={fmt(totViews(videos))} l="Vistas totales"/>
        <Kpi v={videos.length} l="Videos publicados"/>
        <Kpi v={clients.filter(c=>cVids(videos,c.id).length>0).length+"/"+clients.length} l="Clientes activos"/>
        <Kpi v={"$"+fmt(totPauta(videos))} l="Pauta invertida"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16}}>
        <div style={{background:dark2,borderRadius:12,padding:20,border:"1px solid "+dark3}}>
          <div style={{fontSize:11,color:muted,letterSpacing:1,fontWeight:600,marginBottom:14}}>CLIENTES</div>
          {clients.map(c => {
            const vs = cVids(videos, c.id);
            const has = vs.length > 0;
            return (
              <div key={c.id} onClick={()=>onClient(c.id)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid "+dark1,cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{width:7,height:7,borderRadius:"50%",background:has?green:dark3,display:"inline-block",flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:text}}>{c.name}</div>
                    <div style={{fontSize:10,color:muted}}>{c.retainer?"$"+c.retainer.toLocaleString():"Sin retainer"}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:700,color:has?gold:dark3}}>{has?fmt(totViews(vs)):"—"}</div>
                  <div style={{fontSize:10,color:muted}}>{vs.length} videos</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {top && (
            <div style={{background:dark2,borderRadius:12,padding:20,border:"1px solid "+dark3}}>
              <div style={{fontSize:11,color:muted,letterSpacing:1,fontWeight:600,marginBottom:10}}>VIDEO DEL MES</div>
              <div style={{fontSize:16,fontWeight:800,color:gold,marginBottom:4,lineHeight:1.2}}>{top.title}</div>
              <div style={{fontSize:11,color:muted,marginBottom:12}}>{clName(top.clientId)} · {top.publishDate}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[[fmt(top.views),"Vistas"],[engRate(top),"Eng."],["$"+top.pauta,"Pauta"]].map(([v,l]) => (
                  <div key={l} style={{background:dark1,borderRadius:8,padding:10}}>
                    <div style={{fontSize:18,fontWeight:800,color:text}}>{v}</div>
                    <div style={{fontSize:9,color:muted}}>{l}</div>
                  </div>
                ))}
              </div>
              <Tag>{top.hook}</Tag><Tag color="#3B82F6">{top.format}</Tag>
            </div>
          )}
          <div style={{background:dark2,borderRadius:12,padding:20,border:"1px solid "+dark3,flex:1}}>
            <div style={{fontSize:11,color:muted,letterSpacing:1,fontWeight:600,marginBottom:12}}>TOP HOOKS</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hd.slice(0,5)} layout="vertical" margin={{left:0,right:16,top:0,bottom:0}}>
                <XAxis type="number" hide/>
                <YAxis type="category" dataKey="name" width={85} tick={{fill:muted2,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:dark2,border:"1px solid "+dark3,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg vistas"]}/>
                <Bar dataKey="avg" radius={3}>
                  {hd.slice(0,5).map((_,i) => <Cell key={i} fill={i===0?gold:i===1?"#C49516":"#334155"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CLIENT PAGE ───────────────────────────────────────────────────────────────
function ClientPage({ client, videos, onAdd }) {
  const vs = cVids(videos, client.id);
  const top = [...vs].sort((a,b) => b.views-a.views)[0];
  const [q, sq] = useState("");
  const filtered = vs.filter(v => [v.title,v.creator,v.hook,v.format].some(x => x?.toLowerCase().includes(q.toLowerCase())));
  const hd = hookChart(vs);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <div style={{fontSize:22,fontWeight:800,color:text}}>{client.name}</div>
          <div style={{fontSize:12,color:muted,marginTop:3}}>
            {client.retainer?"$"+client.retainer.toLocaleString()+" retainer · ":""}{client.industry} · {client.am}
          </div>
        </div>
        <button onClick={onAdd} style={{padding:"9px 18px",background:gold,color:dark0,border:"none",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700}}>
          + Agregar video
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <Kpi v={vs.length} l="Videos"/>
        <Kpi v={fmt(totViews(vs))} l="Vistas"/>
        <Kpi v={avgEngStr(vs)} l="Engagement prom."/>
        <Kpi v={vs.length>0?roiStr({pauta:totPauta(vs),views:totViews(vs)}):"—"} l="Pauta ROI"/>
      </div>

      {vs.length === 0 ? (
        <div style={{background:dark2,borderRadius:12,padding:40,border:"1px solid "+dark3,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>📹</div>
          <div style={{fontSize:14,color:text}}>Sin videos aún</div>
          <div style={{fontSize:12,color:muted,marginTop:4}}>Agrega el primero con el botón de arriba</div>
        </div>
      ) : (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
            {hd.length > 0 && (
              <div style={{background:dark2,borderRadius:12,padding:20,border:"1px solid "+dark3}}>
                <div style={{fontSize:11,color:muted,letterSpacing:1,fontWeight:600,marginBottom:12}}>HOOK PERFORMANCE</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={hd} layout="vertical" margin={{left:0,right:16,top:0,bottom:0}}>
                    <XAxis type="number" hide/>
                    <YAxis type="category" dataKey="name" width={90} tick={{fill:muted2,fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:dark2,border:"1px solid "+dark3,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg vistas"]}/>
                    <Bar dataKey="avg" radius={3}>
                      {hd.map((_,i) => <Cell key={i} fill={i===0?gold:i===1?"#C49516":"#334155"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {top && (
              <div style={{background:dark2,borderRadius:12,padding:20,border:"1px solid "+dark3}}>
                <div style={{fontSize:11,color:muted,letterSpacing:1,fontWeight:600,marginBottom:10}}>MEJOR VIDEO</div>
                <div style={{fontSize:15,fontWeight:800,color:gold,marginBottom:10,lineHeight:1.2}}>{top.title}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  {[[fmt(top.views),"Vistas"],[engRate(top),"Engagement"],["$"+top.pauta,"Pauta"],[top.watchTimeAvg+"s","Tiempo viz"]].map(([v,l]) => (
                    <div key={l} style={{background:dark1,borderRadius:8,padding:10}}>
                      <div style={{fontSize:18,fontWeight:800,color:text}}>{v}</div>
                      <div style={{fontSize:9,color:muted}}>{l}</div>
                    </div>
                  ))}
                </div>
                <Tag>{top.hook}</Tag><Tag color="#3B82F6">{top.format}</Tag>
                <div style={{marginTop:8,fontSize:11,color:muted}}>Editor: {top.editor} · CM: {top.cm}</div>
              </div>
            )}
          </div>

          <div style={{background:dark2,borderRadius:12,padding:20,border:"1px solid "+dark3}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:11,color:muted,letterSpacing:1,fontWeight:600}}>VIDEOS ({vs.length})</div>
              <input value={q} onChange={x=>sq(x.target.value)} placeholder="Buscar..."
                style={{background:dark1,border:"1px solid "+dark3,borderRadius:7,padding:"7px 10px",color:text,fontSize:12,outline:"none",width:200}} />
            </div>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                <thead>
                  <tr>{["Título","Fecha","Hook","Vistas","Eng.","Pauta"].map(h => (
                    <th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:muted,letterSpacing:1,fontWeight:600,borderBottom:"1px solid "+dark3}}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.sort((a,b) => b.views-a.views).map(v => (
                    <tr key={v.id}>
                      <td style={{padding:"11px 10px",borderBottom:"1px solid "+dark1}}>
                        <div style={{fontSize:13,fontWeight:600,color:text,maxWidth:220}}>{v.title}</div>
                        <div style={{fontSize:10,color:muted}}>{v.creator}</div>
                      </td>
                      <td style={{padding:"11px 10px",fontSize:11,color:muted,borderBottom:"1px solid "+dark1}}>{v.publishDate}</td>
                      <td style={{padding:"11px 10px",borderBottom:"1px solid "+dark1}}><Tag>{v.hook}</Tag></td>
                      <td style={{padding:"11px 10px",fontSize:14,fontWeight:700,color:gold,borderBottom:"1px solid "+dark1}}>{fmt(v.views)}</td>
                      <td style={{padding:"11px 10px",fontSize:12,color:text,borderBottom:"1px solid "+dark1}}>{engRate(v)}</td>
                      <td style={{padding:"11px 10px",fontSize:12,color:muted,borderBottom:"1px solid "+dark1}}>${v.pauta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(() => store.get("tch_session") === true);
  const [clients, setClients] = useState(() => store.get("tch_clients") || SEED_CLIENTS);
  const [videos, setVideos] = useState(() => store.get("tch_videos") || SEED_VIDEOS);
  const [page, setPage] = useState("dashboard");
  const [modal, setModal] = useState(null);

  useEffect(() => { store.set("tch_clients", clients); }, [clients]);
  useEffect(() => { store.set("tch_videos", videos); }, [videos]);
  useEffect(() => { store.set("tch_session", authed); }, [authed]);

  const addVideo = useCallback(v => setVideos(p => [...p, v]), []);
  const logout = () => { setAuthed(false); store.set("tch_session", false); };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const activeClient = clients.find(c => c.id === page);
  const withData = clients.filter(c => cVids(videos, c.id).length > 0);
  const noData = clients.filter(c => cVids(videos, c.id).length === 0);

  const navItem = (id, label, dotColor) => (
    <div key={id} onClick={() => setPage(id)}
      style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",cursor:"pointer",fontSize:13,
        fontWeight:page===id?600:400, color:page===id?gold:muted2,
        borderLeft:page===id?"2px solid "+gold:"2px solid transparent",
        background:page===id?"rgba(212,160,23,.07)":"transparent"}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:dotColor,flexShrink:0,display:"inline-block"}}/>
      {label}
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",background:dark0,fontFamily:"system-ui,sans-serif",color:text,overflow:"hidden"}}>
      {/* Sidebar */}
      <div style={{width:210,background:dark1,flexShrink:0,borderRight:"1px solid "+dark3,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"18px 16px 12px",borderBottom:"1px solid "+dark3,flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:900,color:gold,letterSpacing:-0.5}}>TheContentHub</div>
          <div style={{fontSize:9,color:muted,letterSpacing:3,marginTop:2}}>REVO LABS</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
          <div onClick={() => setPage("dashboard")}
            style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",cursor:"pointer",fontSize:13,
              fontWeight:page==="dashboard"?600:400, color:page==="dashboard"?gold:muted2,
              borderLeft:page==="dashboard"?"2px solid "+gold:"2px solid transparent",
              background:page==="dashboard"?"rgba(212,160,23,.07)":"transparent"}}>
            <span style={{fontSize:15}}>◻</span> Dashboard
          </div>
          {withData.length > 0 && <>
            <div style={{padding:"12px 14px 4px",fontSize:9,color:muted,letterSpacing:3,fontWeight:600}}>ACTIVOS</div>
            {withData.map(c => navItem(c.id, c.name, green))}
          </>}
          {noData.length > 0 && <>
            <div style={{padding:"12px 14px 4px",fontSize:9,color:muted,letterSpacing:3,fontWeight:600}}>SIN DATOS</div>
            {noData.map(c => navItem(c.id, c.name, dark3))}
          </>}
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid "+dark3,flexShrink:0}}>
          <div style={{fontSize:10,color:muted,wordBreak:"break-all"}}>humberto@revolabsmedia.com</div>
          <div style={{fontSize:9,color:"#334155",marginTop:1}}>CSO · REVO Labs</div>
          <button onClick={logout} style={{marginTop:8,background:"none",border:"none",color:"#EF4444",fontSize:11,cursor:"pointer",padding:0}}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:dark1,borderBottom:"1px solid "+dark3,padding:"0 24px",height:50,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{fontSize:14,fontWeight:600}}>{activeClient ? activeClient.name : "Agency Dashboard"}</div>
          <button onClick={() => setModal(activeClient?.id || "")}
            style={{padding:"7px 16px",background:gold,color:dark0,border:"none",borderRadius:7,cursor:"pointer",fontSize:12,fontWeight:700}}>
            + Agregar video
          </button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:22}}>
          {page === "dashboard" && <Dashboard clients={clients} videos={videos} onClient={setPage} />}
          {activeClient && <ClientPage client={activeClient} videos={videos} onAdd={() => setModal(activeClient.id)} />}
        </div>
      </div>

      {/* Modal */}
      {modal !== null && (
        <AddModal clients={clients} defaultClientId={modal} onSave={addVideo} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
