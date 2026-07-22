import { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── AUTH ───────────────────────────────────────────────────────────────────────
const USERS = {
  admin:     { email:"humberto@revolabsmedia.com",  password:"Revo2026!",      role:"admin" },
  community: { email:"community@revolabsmedia.com", password:"Community2026!", role:"community" },
};

// ── TAXONOMY ───────────────────────────────────────────────────────────────────
const HOOKS      = ["Impacto","Curiosidad","Historia","Transformacion","POV","Deseo","Antes/Despues","Pregunta","Estadistica","Problema","Error","Controversia","Comparacion","Autoridad","Miedo","Reto"];
const FORMATS    = ["Demostracion de Producto","Hablando a Camara","Tutorial","Tendencia","UGC","Voz en Off","Fundador","Podcast","Entrevista en la Calle","Estilo de Vida","Meme","Educativo","Detras de Camaras","Caso de Estudio"];
const CTAS       = ["Seguir","Guardar","Comentar","Compartir","Visitar Perfil","Comprar","Mensaje Directo","Link en Bio","Sin CTA"];
const PLATFORMS  = ["TikTok","Instagram Reels","YouTube Shorts","Facebook","LinkedIn"];
const TRIGGERS   = ["Sorprendente","Inspirador","Identificable","Gracioso","Educativo","Curiosidad","Satisfaccion","Miedo","Urgencia","Enojo","Asombro","Asco"];
const PILLARS    = ["Entretenimiento","Educacion","Conversion","Comunidad","Reconocimiento de Marca","Retencion"];
const INDUSTRIES = ["Retail","Moda","Fitness","Fintech","Automotriz","Conglomerado","Bebidas","Restaurante","Salud","Tecnología","Bienes Raíces","Entretenimiento","Otro"];
const EMP_ROLES  = ["Editor","Community Manager","Productor","Guionista","Otro"];
const DATE_RANGES = [
  { value:"all",    label:"Todo el tiempo" },
  { value:"year",   label:"Este año" },
  { value:"90days", label:"Últimos 90 días" },
  { value:"30days", label:"Últimos 30 días" },
  { value:"month",  label:"Este mes" },
  { value:"week",   label:"Esta semana" },
];

// ── PIPELINE ───────────────────────────────────────────────────────────────────
const STAGES = [
  { id:"brief",      label:"📋 Brief",      color:"#3B82F6", communityCanMove:true  },
  { id:"produccion", label:"🎬 Producción",  color:"#8B5CF6", communityCanMove:true  },
  { id:"edicion",    label:"✂️ Edición",    color:"#F59E0B", communityCanMove:true  },
  { id:"revision",   label:"🔄 Revisiones", color:"#EC4899", communityCanMove:true  },
  { id:"aprobacion", label:"👁 Aprobación", color:"#EF4444", communityCanMove:false },
  { id:"publicado",  label:"📱 Publicado",  color:"#6B7280", communityCanMove:false },
  { id:"metricas",   label:"📊 Métricas",   color:"#059669", communityCanMove:true  },
];

const NOW        = new Date();
const curMonth   = () => `${NOW.getFullYear()}-${String(NOW.getMonth()+1).padStart(2,"0")}`;
const daysAfterPublish = card => card.publishDate ? Math.floor((NOW - new Date(card.publishDate)) / 864e5) : 0;
const metricsUnlocked  = card => card.stage === "metricas" && daysAfterPublish(card) >= 7;
const daysUntil        = card => Math.max(0, 7 - daysAfterPublish(card));

// ── SEED DATA ──────────────────────────────────────────────────────────────────
const SEED_CLIENTS = [
  { id:"tony",     name:"Tony",          industry:"Retail",       status:"active", am:"Sofia",  goal:"Brand awareness + crecimiento" },
  { id:"unitam",   name:"Unitam",        industry:"Moda",         status:"active", am:"Sofia",  goal:"Engagement y comunidad" },
  { id:"solanum",  name:"Solanum",       industry:"Fitness",      status:"active", am:"Sofia",  goal:"Brand awareness — debut" },
  { id:"celularte",name:"Celularte",     industry:"Retail",       status:"pending",am:"Sofia",  goal:"Ventas y tráfico" },
  { id:"carso",    name:"Grupo Carso",   industry:"Conglomerado", status:"pending",am:"Sofia",  goal:"Presencia digital" },
  { id:"fredinero",name:"Fredinero",     industry:"Fintech",      status:"pending",am:"Sofia",  goal:"Generación de leads" },
  { id:"matera",   name:"Matera Motors", industry:"Automotriz",   status:"pending",am:"Sofia",  goal:"Awareness" },
];
const SEED_EMPLOYEES = [
  { id:"e009",name:"Paco",   role:"Editor",            status:"active" },
  { id:"e010",name:"Danny",  role:"Editor",            status:"active" },
  { id:"e011",name:"Cristian",role:"Editor",           status:"active" },
  { id:"e012",name:"Itzel",  role:"Community Manager", status:"active" },
  { id:"e013",name:"Ivanna", role:"Community Manager", status:"active" },
  { id:"e014",name:"Paula",  role:"Community Manager", status:"active" },
  { id:"e015",name:"Larissa",role:"Community Manager", status:"active" },
];
const SEED_VIDEOS = [
  { id:"v001",clientId:"tony",   title:"TOP INESPERADO",             platform:"TikTok",publishDate:"2026-06-23",creator:"Álvaro Salinas",   editor:"Paco", cm:"Itzel", producer:"",hook:"Impacto",      format:"Demostracion de Producto",cta:"Seguir",        trigger:"Sorprendente", pillar:"Entretenimiento",        pauta:800,views:56000,likes:2100,comments:340,shares:890, saves:760,duration:45,watchTimeAvg:28,followers:520,paraTi:84,siguiendo:11,busqueda:5  },
  { id:"v002",clientId:"tony",   title:"COLECCIÓN MUNDIAL",          platform:"TikTok",publishDate:"2026-06-25",creator:"Santiago Paniagua",editor:"Paco", cm:"Itzel", producer:"",hook:"Impacto",      format:"Tendencia",               cta:"Compartir",     trigger:"Inspirador",   pillar:"Entretenimiento",        pauta:800,views:53000,likes:1980,comments:290,shares:1200,saves:430,duration:38,watchTimeAvg:24,followers:490,paraTi:81,siguiendo:13,busqueda:6  },
  { id:"v003",clientId:"tony",   title:"HAÚL ASMR",                  platform:"TikTok",publishDate:"2026-06-13",creator:"Ivanna Paniagua", editor:"Paco", cm:"Paula", producer:"",hook:"Impacto",      format:"Demostracion de Producto",cta:"Guardar",       trigger:"Satisfaccion", pillar:"Entretenimiento",        pauta:714,views:33000,likes:1450,comments:210,shares:340, saves:890,duration:52,watchTimeAvg:31,followers:310,paraTi:76,siguiendo:16,busqueda:8  },
  { id:"v004",clientId:"tony",   title:"SEMANA SMARTY",              platform:"TikTok",publishDate:"2026-06-22",creator:"Álvaro Salinas",   editor:"Danny",cm:"Itzel", producer:"",hook:"Impacto",      format:"Hablando a Camara",       cta:"Seguir",        trigger:"Curiosidad",   pillar:"Educacion",              pauta:840,views:32000,likes:1230,comments:450,shares:280, saves:340,duration:41,watchTimeAvg:26,followers:290,paraTi:72,siguiendo:20,busqueda:8  },
  { id:"v005",clientId:"tony",   title:"Lo hicimos real",            platform:"TikTok",publishDate:"2026-06-03",creator:"Efrén",           editor:"Danny",cm:"Itzel", producer:"",hook:"Transformacion",format:"Tutorial",                cta:"Guardar",       trigger:"Inspirador",   pillar:"Educacion",              pauta:410,views:27300,likes:980, comments:320,shares:180, saves:720,duration:58,watchTimeAvg:34,followers:250,paraTi:68,siguiendo:22,busqueda:10 },
  { id:"v006",clientId:"tony",   title:"Vibras de verano",           platform:"TikTok",publishDate:"2026-06-05",creator:"Ivanna Paniagua", editor:"Danny",cm:"Paula", producer:"",hook:"Deseo",        format:"Voz en Off",              cta:"Seguir",        trigger:"Identificable",pillar:"Entretenimiento",        pauta:410,views:25000,likes:920, comments:180,shares:420, saves:290,duration:30,watchTimeAvg:19,followers:230,paraTi:65,siguiendo:24,busqueda:11 },
  { id:"v007",clientId:"tony",   title:"REGALO PARA PAPÁ",           platform:"TikTok",publishDate:"2026-06-19",creator:"Álvaro Salinas",   editor:"Danny",cm:"Itzel", producer:"",hook:"Antes/Despues",format:"Tutorial",                cta:"Comprar",       trigger:"Deseo",        pillar:"Conversion",             pauta:400,views:20000,likes:760, comments:290,shares:120, saves:480,duration:44,watchTimeAvg:22,followers:180,paraTi:61,siguiendo:28,busqueda:11 },
  { id:"v008",clientId:"tony",   title:"PARA MI PAPÁ ES",            platform:"TikTok",publishDate:"2026-06-21",creator:"Hugo",            editor:"Danny",cm:"Itzel", producer:"",hook:"Deseo",        format:"Tendencia",               cta:"Sin CTA",       trigger:"Identificable",pillar:"Entretenimiento",        pauta:400,views:7461, likes:890, comments:340,shares:120, saves:220,duration:22,watchTimeAvg:14,followers:70, paraTi:42,siguiendo:48,busqueda:10 },
  { id:"v009",clientId:"tony",   title:"EXPERTONY CONTESTA P.3",     platform:"TikTok",publishDate:"2026-06-29",creator:"Álvaro Salinas",   editor:"Danny",cm:"Itzel", producer:"",hook:"Pregunta",     format:"Hablando a Camara",       cta:"Comentar",      trigger:"Curiosidad",   pillar:"Comunidad",              pauta:0,  views:849,  likes:45,  comments:89, shares:12,  saves:23, duration:35,watchTimeAvg:18,followers:8,  paraTi:38,siguiendo:55,busqueda:7  },
  { id:"v010",clientId:"unitam", title:"¡Ya llego a Unitam!",        platform:"TikTok",publishDate:"2026-06-15",creator:"Álvaro Salinas",   editor:"Danny",cm:"Ivanna",producer:"",hook:"Impacto",      format:"Hablando a Camara",       cta:"Visitar Perfil",trigger:"Sorprendente", pillar:"Entretenimiento",        pauta:800,views:46000,likes:1780,comments:390,shares:650, saves:420,duration:28,watchTimeAvg:19,followers:420,paraTi:79,siguiendo:15,busqueda:6  },
  { id:"v011",clientId:"unitam", title:"Playeras nuevas",            platform:"TikTok",publishDate:"2026-06-12",creator:"Paco",            editor:"Danny",cm:"Ivanna",producer:"",hook:"POV",          format:"Tendencia",               cta:"Compartir",     trigger:"Identificable",pillar:"Entretenimiento",        pauta:800,views:40000,likes:1560,comments:280,shares:890, saves:340,duration:18,watchTimeAvg:14,followers:370,paraTi:77,siguiendo:17,busqueda:6  },
  { id:"v012",clientId:"unitam", title:"Prompt Guion Viral ChatGPT", platform:"TikTok",publishDate:"2026-06-29",creator:"Galilea Espinoza",editor:"Paco", cm:"Ivanna",producer:"",hook:"Curiosidad",   format:"Hablando a Camara",       cta:"Guardar",       trigger:"Educativo",    pillar:"Educacion",              pauta:0,  views:12000,likes:580, comments:210,shares:180, saves:890,duration:45,watchTimeAvg:32,followers:110,paraTi:88,siguiendo:8, busqueda:4  },
  { id:"v013",clientId:"unitam", title:"1, 2, 3... ¡UNITAM!",        platform:"TikTok",publishDate:"2026-06-18",creator:"Mariana García",  editor:"Paco", cm:"Ivanna",producer:"",hook:"Historia",     format:"Tendencia",               cta:"Seguir",        trigger:"Gracioso",     pillar:"Entretenimiento",        pauta:200,views:8795, likes:340, comments:120,shares:89,  saves:67, duration:15,watchTimeAvg:12,followers:82, paraTi:55,siguiendo:36,busqueda:9  },
  { id:"v014",clientId:"unitam", title:"Día del padre",              platform:"TikTok",publishDate:"2026-06-21",creator:"Álvaro Salinas",   editor:"Danny",cm:"Ivanna",producer:"",hook:"Deseo",        format:"Hablando a Camara",       cta:"Compartir",     trigger:"Identificable",pillar:"Entretenimiento",        pauta:200,views:7958, likes:310, comments:98, shares:120, saves:89, duration:22,watchTimeAvg:15,followers:74, paraTi:50,siguiendo:40,busqueda:10 },
  { id:"v015",clientId:"unitam", title:"Tiempo Récord",              platform:"TikTok",publishDate:"2026-06-23",creator:"Mariana García",  editor:"Paco", cm:"Ivanna",producer:"",hook:"Impacto",      format:"Tutorial",                cta:"Guardar",       trigger:"Sorprendente", pillar:"Educacion",              pauta:200,views:719,  likes:34,  comments:18, shares:8,   saves:45, duration:30,watchTimeAvg:12,followers:7,  paraTi:31,siguiendo:58,busqueda:11 },
  { id:"v016",clientId:"solanum",title:"This is Solanum",            platform:"TikTok",publishDate:"2026-06-16",creator:"Ana Paula",       editor:"Danny",cm:"Larissa",producer:"",hook:"Historia",     format:"Hablando a Camara",       cta:"Seguir",        trigger:"Inspirador",   pillar:"Reconocimiento de Marca",pauta:700,views:20000,likes:780, comments:210,shares:340, saves:290,duration:42,watchTimeAvg:26,followers:188,paraTi:70,siguiendo:22,busqueda:8  },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
const fmt=n=>n>=1000000?(n/1000000).toFixed(1)+"M":n>=1000?(n/1000).toFixed(0)+"K":String(n||0);
const pct=n=>n!=null?n+"%":"—";
const eng=v=>v.views>0?(((v.likes+v.comments+v.shares+v.saves)/v.views)*100).toFixed(1)+"%":"—";
const roiStr=v=>v.pauta>0&&v.views>0?"$"+(v.pauta/v.views*1000).toFixed(2)+"/1K":v.pauta===0?"🌱 Orgánico":"—";
const cVids=(vs,id)=>vs.filter(v=>v.clientId===id);
const totV=vs=>vs.reduce((s,v)=>s+v.views,0);
const avgE=vs=>vs.length?(vs.reduce((s,v)=>s+(v.views>0?(v.likes+v.comments+v.shares+v.saves)/v.views:0),0)/vs.length*100).toFixed(1)+"%":"—";
const avgParaTi=vs=>{const w=vs.filter(v=>v.paraTi!=null);return w.length?Math.round(w.reduce((s,v)=>s+v.paraTi,0)/w.length)+"%":"—";};
const uid=()=>Math.random().toString(36).slice(2,10);

const groupBy=(vs,key)=>{
  const m={};
  vs.forEach(v=>{if(!v[key])return;if(!m[v[key]])m[v[key]]={n:0,s:0};m[v[key]].n++;m[v[key]].s+=v.views;});
  return Object.entries(m).map(([k,d])=>({name:k,avg:Math.round(d.s/d.n),n:d.n})).sort((a,b)=>b.avg-a.avg);
};
const filterByDate=(videos,range)=>{
  if(range==="all")return videos;
  const now=NOW;let start;
  if(range==="year")  start=new Date("2026-01-01");
  if(range==="90days")start=new Date(+now-90*864e5);
  if(range==="30days")start=new Date(+now-30*864e5);
  if(range==="month") start=new Date("2026-07-01");
  if(range==="week")  start=new Date(+now-7*864e5);
  return videos.filter(v=>new Date(v.publishDate)>=start);
};
const teamStats=videos=>{
  const roles={creator:{},editor:{},cm:{},producer:{}};
  videos.forEach(v=>{
    [["creator",v.creator],["editor",v.editor],["cm",v.cm],["producer",v.producer]].forEach(([role,name])=>{
      if(!name)return;
      if(!roles[role][name])roles[role][name]={videos:[],name,role};
      roles[role][name].videos.push(v);
    });
  });
  const rank=obj=>Object.values(obj).map(p=>({
    ...p,count:p.videos.length,
    avgViews:Math.round(totV(p.videos)/p.videos.length),
    topVideo:[...p.videos].sort((a,b)=>b.views-a.views)[0],
  })).sort((a,b)=>b.topVideo.views-a.topVideo.views);
  return{creators:rank(roles.creator),editors:rank(roles.editor),cms:rank(roles.cm),producers:rank(roles.producer)};
};

// ── STORAGE ────────────────────────────────────────────────────────────────────
const store={
  get:k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
};

// ── COLORS ─────────────────────────────────────────────────────────────────────
const C={
  bg:"#F8FAFC",surface:"#FFFFFF",border:"#E2E8F0",
  text:"#0F172A",muted:"#64748B",light:"#F1F5F9",
  accent:"#2563EB",gold:"#D97706",green:"#059669",
  red:"#DC2626",amber:"#F59E0B",
  sidebar:"#0F172A",sideGold:"#F59E0B",sideText:"#CBD5E1",sideMuted:"#475569",
};
const shadow="0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.04)";
const shadowMd="0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04)";

// ── SHARED UI ─────────────────────────────────────────────────────────────────
const Tag=({children,color=C.gold})=>(
  <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:600,background:color+"18",color,border:`1px solid ${color}30`,marginRight:4,marginBottom:2}}>{children}</span>
);
const Kpi=({emoji,v,l,color=C.gold})=>(
  <div style={{background:C.surface,borderRadius:12,padding:"20px 18px",border:`1px solid ${C.border}`,boxShadow:shadow}}>
    <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{emoji} {l}</div>
    <div style={{fontSize:30,fontWeight:800,color,lineHeight:1}}>{v}</div>
  </div>
);
const Card=({children,pad=20,style={}})=>(
  <div style={{background:C.surface,borderRadius:12,padding:pad,border:`1px solid ${C.border}`,boxShadow:shadow,...style}}>{children}</div>
);
const SecTitle=({children})=>(
  <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:14,textTransform:"uppercase"}}>{children}</div>
);
const Btn=({children,primary,danger,onClick,small,style={}})=>(
  <button onClick={onClick} style={{
    padding:small?"6px 12px":"9px 18px",
    background:primary?C.text:danger?"#FEE2E2":C.surface,
    color:primary?"#FFF":danger?C.red:C.text,
    border:`1px solid ${primary?C.text:danger?"#FECACA":C.border}`,
    borderRadius:8,cursor:"pointer",fontSize:small?12:13,fontWeight:600,
    boxShadow:shadow,...style
  }}>{children}</button>
);
const inp={width:"100%",background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",boxSizing:"border-box"};
const DateRangePicker=({value,onChange})=>(
  <select value={value} onChange={e=>onChange(e.target.value)}
    style={{padding:"8px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:13,color:C.text,cursor:"pointer",boxShadow:shadow,outline:"none"}}>
    {DATE_RANGES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
  </select>
);

// ── LOGIN ──────────────────────────────────────────────────────────────────────
function Login({onLogin}){
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const go=()=>{
    const user=Object.values(USERS).find(u=>u.email===email&&u.password===pass);
    if(user)onLogin(user.role);else setErr("Credenciales incorrectas ❌");
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:360,padding:40,background:C.surface,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:shadowMd}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:-1}}>TheContentHub</div>
          <div style={{fontSize:11,color:C.muted,letterSpacing:2,marginTop:4}}>🚀 REVO LABS</div>
        </div>
        {[["📧 Email","email",email,setEmail],["🔒 Contraseña","password",pass,setPass]].map(([l,t,v,sv])=>(
          <div key={l} style={{marginBottom:16}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:6,fontWeight:500}}>{l}</div>
            <input type={t} value={v} onChange={x=>sv(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()}
              placeholder={t==="email"?"humberto@revolabsmedia.com":""} style={inp}/>
          </div>
        ))}
        {err&&<div style={{color:C.red,fontSize:12,marginBottom:12}}>{err}</div>}
        <button onClick={go} style={{width:"100%",padding:13,background:C.text,color:"#FFF",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",marginTop:4}}>Entrar →</button>
        <div style={{marginTop:20,padding:12,background:C.light,borderRadius:8,fontSize:11,color:C.muted}}>
          <div>👑 Admin: humberto@revolabsmedia.com / Revo2026!</div>
          <div style={{marginTop:4}}>👥 Community: community@revolabsmedia.com / Community2026!</div>
        </div>
      </div>
    </div>
  );
}

// ── SET TARGETS MODAL ─────────────────────────────────────────────────────────
function SetTargetsModal({clients,targets,month,onSave,onClose}){
  const active=clients.filter(c=>c.status!=="archived");
  const[vals,setVals]=useState(()=>active.reduce((o,c)=>({...o,[c.id]:targets[month]?.[c.id]||""}),{}));
  const save=()=>{
    const t={...targets,[month]:Object.fromEntries(Object.entries(vals).map(([k,v])=>[k,+v||0]))};
    onSave(t);onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(480px,95vw)",padding:28,fontFamily:"system-ui,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>🎯 Meta de videos — {month}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{fontSize:12,color:C.muted,marginBottom:16}}>¿Cuántos videos se deben entregar por cliente este mes?</div>
        {active.map(c=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div>
            <input type="number" min="0" value={vals[c.id]} onChange={x=>setVals(p=>({...p,[c.id]:x.target.value}))}
              style={{...inp,width:80,textAlign:"center"}} placeholder="0"/>
          </div>
        ))}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn onClick={save} primary>Guardar metas ✓</Btn>
        </div>
      </div>
    </div>
  );
}

// ── ADD CARD MODAL ────────────────────────────────────────────────────────────
function AddCardModal({clients,employees,defaultClientId,role,onSave,onClose}){
  const activeClients=clients.filter(c=>c.status!=="archived");
  const activeEmps=employees.filter(e=>e.status==="active");
  const[f,sf]=useState({clientId:defaultClientId||"",title:"",editor:"",dueDate:"",platform:"TikTok"});
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.clientId||!f.title.trim())return;
    onSave({...f,id:"c"+Date.now(),stage:"brief",month:curMonth(),createdAt:NOW.toISOString().slice(0,10),publishDate:null,revisionCount:0});
    onClose();
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(480px,95vw)",padding:28,fontFamily:"system-ui,sans-serif"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>📋 Nuevo video al pipeline</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        {[
          ["Cliente","clientId","sel"],
          ["Título del video","title","text"],
          ["Editor","editor","empsel"],
          ["Fecha límite","dueDate","date"],
        ].map(([l,k,t])=>(
          <div key={k} style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
            {t==="sel"
              ?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}>
                <option value="">Seleccionar...</option>
                {(defaultClientId?activeClients.filter(c=>c.id===defaultClientId):activeClients).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
              :t==="empsel"
              ?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}>
                <option value="">Sin asignar</option>
                {activeEmps.map(e=><option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}
               </select>
              :<input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}/>
            }
          </div>
        ))}
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn onClick={save} primary>Agregar al pipeline ✓</Btn>
        </div>
      </div>
    </div>
  );
}

// ── METRICS MODAL ─────────────────────────────────────────────────────────────
function MetricsModal({card,employees,onSave,onClose}){
  const activeEmps=employees.filter(e=>e.status==="active");
  const[f,sf]=useState({
    creator:"",hook:"",format:"",cta:"",trigger:"",pillar:"",duration:"",
    views:"",likes:"",comments:"",shares:"",saves:"",followers:"",watchTimeAvg:"",pauta:"0",
    paraTi:"",siguiendo:"",busqueda:"",
  });
  const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=()=>{
    const nums=["views","likes","comments","shares","saves","followers","watchTimeAvg","pauta","paraTi","siguiendo","busqueda","duration"];
    onSave({...f,...nums.reduce((o,k)=>({...o,[k]:f[k]!==""?+f[k]:null}),{})});
    onClose();
  };
  const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:12};
  const fld=(l,k,t="text",opts)=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
      {opts?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Seleccionar...</option>{opts.map(o=><option key={o}>{o}</option>)}</select>
           :<input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}/>}
    </div>
  );
  const sec=(e,l)=><div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,margin:"14px 0 10px"}}>{e} {l}</div>;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,paddingTop:24,paddingBottom:24,overflowY:"auto"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(640px,95vw)",fontFamily:"system-ui,sans-serif"}}>
        <div style={{padding:"22px 26px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:17,fontWeight:800,color:C.text}}>📊 Agregar métricas</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{card.title}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"14px 26px 26px"}}>
          {sec("🎨","ATRIBUTOS CREATIVOS")}
          <div style={g2}>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>🎭 Creador / Talent</div>
              <input value={f.creator} onChange={x=>set("creator",x.target.value)} style={inp} placeholder="Nombre del talent"/>
            </div>
            {fld("Duración (seg)","duration","number")}
          </div>
          <div style={g2}>{fld("🪝 Hook","hook","text",HOOKS)}{fld("🎬 Formato","format","text",FORMATS)}</div>
          <div style={g2}>{fld("CTA","cta","text",CTAS)}{fld("Disparador emocional","trigger","text",TRIGGERS)}</div>
          {fld("Pilar de contenido","pillar","text",PILLARS)}
          {sec("📊","MÉTRICAS")}
          <div style={g2}>{fld("👁 Vistas","views","number")}{fld("❤️ Me gusta","likes","number")}</div>
          <div style={g2}>{fld("💬 Comentarios","comments","number")}{fld("🔁 Compartidos","shares","number")}</div>
          <div style={g2}>{fld("🔖 Guardados","saves","number")}{fld("👤 Seguidores ganados","followers","number")}</div>
          <div style={g2}>{fld("⏱ Tiempo viz. prom. (seg)","watchTimeAvg","number")}{fld("💰 Pauta ($)","pauta","number")}</div>
          {sec("📡","FUENTES DE TRÁFICO")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {fld("📱 % Para Ti","paraTi","number")}
            {fld("👥 % Siguiendo","siguiendo","number")}
            {fld("🔍 % Búsqueda","busqueda","number")}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}>
            <Btn onClick={onClose}>Cancelar</Btn>
            <Btn onClick={save} primary>Guardar y completar ✓</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KANBAN CARD ───────────────────────────────────────────────────────────────
function KanbanCard({card,clients,role,onMove,onApprove,onMetrics,onDelete,isDragging,onDragStart,onDragEnd}){
  const client=clients.find(c=>c.id===card.clientId);
  const stageIdx=STAGES.findIndex(s=>s.id===card.stage);
  const nextStage=STAGES[stageIdx+1];
  const prevStage=STAGES[stageIdx-1];
  const isPublicado=card.stage==="publicado";
  const isMetricas=card.stage==="metricas";
  const unlocked=metricsUnlocked(card);
  const days=daysUntil(card);
  const isOverdue=card.dueDate&&new Date(card.dueDate)<NOW&&card.stage!=="metricas";
  const stageInfo=STAGES.find(s=>s.id===card.stage);
  const [confirmDel,setConfirmDel]=useState(false);
  const canDelete=role==="admin"||(role==="community"&&card.stage==="brief");

  return(
    <div
      draggable
      onDragStart={e=>{e.dataTransfer.setData("cardId",card.id);onDragStart&&onDragStart(card.id);}}
      onDragEnd={()=>onDragEnd&&onDragEnd()}
      style={{
        background:C.surface,borderRadius:10,padding:14,
        border:`1px solid ${isOverdue?"#FECACA":isMetricas&&unlocked?"#BBF7D0":C.border}`,
        boxShadow:isDragging?"0 8px 24px rgba(0,0,0,.2)":shadow,
        marginBottom:10,cursor:"grab",opacity:isDragging?.3:1,
        borderLeft:`3px solid ${stageInfo?.color||C.border}`,
        transform:isDragging?"rotate(2deg)":"none",
        transition:"transform .1s, box-shadow .1s",
      }}>
      {/* Client badge */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:10,fontWeight:700,background:C.accent+"18",color:C.accent,padding:"2px 7px",borderRadius:20}}>{client?.name||"—"}</span>
        {isOverdue&&<span style={{fontSize:10,fontWeight:700,color:C.red}}>⚠️ Vencido</span>}
        {isMetricas&&!unlocked&&<span style={{fontSize:10,color:C.muted}}>🔒 {days}d</span>}
        {isMetricas&&unlocked&&<span style={{fontSize:10,fontWeight:700,color:C.green}}>🔓 Listo</span>}
      </div>

      {/* Title */}
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6,lineHeight:1.3}}>{card.title}</div>

      {/* Meta */}
      <div style={{fontSize:11,color:C.muted,marginBottom:8}}>
        {card.editor&&<div>✂️ {card.editor}</div>}
        {card.dueDate&&<div>📅 {card.dueDate}</div>}
        {isPublicado&&card.publishDate&&<div>📱 Publicado {card.publishDate}</div>}
        {(card.revisionCount||0)>0&&<div style={{color:"#EC4899",fontWeight:700}}>🔄 {card.revisionCount} revisión{card.revisionCount>1?"es":""}</div>}
      </div>

      {/* Actions */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {/* Community: move forward (except to publicado) */}
        {nextStage&&!(nextStage.id==="publicado"&&role==="community")&&card.stage!=="metricas"&&(
          <button onClick={()=>onMove(card.id,nextStage.id)} style={{fontSize:11,padding:"4px 10px",background:C.light,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",color:C.text,fontWeight:600}}>
            → {nextStage.label.split(" ")[1]}
          </button>
        )}
        {/* Admin only: approve to publicado */}
        {card.stage==="aprobacion"&&role==="admin"&&(
          <button onClick={()=>onApprove(card.id)} style={{fontSize:11,padding:"4px 10px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:6,cursor:"pointer",color:C.green,fontWeight:700}}>
            ✅ Publicar
          </button>
        )}
        {/* Admin: move back */}
        {prevStage&&role==="admin"&&(
          <button onClick={()=>onMove(card.id,prevStage.id)} style={{fontSize:11,padding:"4px 10px",background:C.light,border:`1px solid ${C.border}`,borderRadius:6,cursor:"pointer",color:C.muted}}>
            ← Back
          </button>
        )}
        {/* Add metrics */}
        {isMetricas&&unlocked&&(
          <button onClick={()=>onMetrics(card)} style={{fontSize:11,padding:"4px 10px",background:"#DCFCE7",border:"1px solid #BBF7D0",borderRadius:6,cursor:"pointer",color:C.green,fontWeight:700}}>
            📊 Métricas
          </button>
        )}
        {/* Delete with confirmation */}
        {canDelete&&!confirmDel&&(
          <button onClick={()=>setConfirmDel(true)} style={{fontSize:11,padding:"4px 10px",background:"#FEE2E2",border:"1px solid #FECACA",borderRadius:6,cursor:"pointer",color:C.red}}>🗑</button>
        )}
        {canDelete&&confirmDel&&(
          <div style={{display:"flex",gap:4,alignItems:"center",marginTop:4}}>
            <span style={{fontSize:10,color:C.red,fontWeight:700}}>¿Eliminar?</span>
            <button onClick={()=>onDelete(card.id)} style={{fontSize:10,padding:"3px 8px",background:C.red,border:"none",borderRadius:5,cursor:"pointer",color:"#fff",fontWeight:700}}>Sí</button>
            <button onClick={()=>setConfirmDel(false)} style={{fontSize:10,padding:"3px 8px",background:C.light,border:`1px solid ${C.border}`,borderRadius:5,cursor:"pointer",color:C.text}}>No</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PIPELINE PAGE ─────────────────────────────────────────────────────────────
function PipelinePage({clients,employees,cards,videos,targets,role,onAddCard,onMoveCard,onMetrics,onDeleteCard,onSetTargets,communityClientId}){
  const month=curMonth();
  const activeClients=clients.filter(c=>c.status!=="archived");
  const [selectedClient,setSelectedClient]=useState(communityClientId||null);
  const [showSetTargets,setShowSetTargets]=useState(false);

  const publishedThisMonth=clientId=>
    videos.filter(v=>v.clientId===clientId&&v.publishDate?.startsWith(month)).length;
  const clientCards=clientId=>cards.filter(c=>c.clientId===clientId&&c.month===month);

  // ── OVERVIEW (admin only) ──────────────────────────────────────────────────
  if(!selectedClient){
    return(
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:C.text}}>🗂 Pipeline — {month}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>Selecciona un cliente para ver su tablero</div>
          </div>
          {role==="admin"&&<Btn onClick={()=>setShowSetTargets(true)}>🎯 Metas del mes</Btn>}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {activeClients.map(c=>{
            const target=targets[month]?.[c.id]||0;
            const published=publishedThisMonth(c.id);
            const cCards=clientCards(c.id);
            const total=published+cCards.length;
            const pct=target>0?Math.min(100,Math.round(published/target*100)):null;
            const behind=target>0&&published<Math.floor(target*0.5);
            const stageCount=stageId=>cCards.filter(c=>c.stage===stageId).length;
            const stuck=cCards.filter(c=>c.stage==="revision").length;
            const statusColor=behind?C.red:pct===100?C.green:C.amber;

            return(
              <div key={c.id} onClick={()=>setSelectedClient(c.id)}
                style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:shadow,cursor:"pointer",overflow:"hidden",transition:"transform .15s, box-shadow .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=shadowMd;}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=shadow;}}>

                {/* Header */}
                <div style={{padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{fontSize:16,fontWeight:800,color:C.text}}>{c.name}</div>
                    {stuck>0&&<span style={{fontSize:10,fontWeight:700,background:"#FCE7F3",color:"#BE185D",padding:"2px 8px",borderRadius:20}}>🔄 {stuck} en revisión</span>}
                  </div>
                  <div style={{fontSize:11,color:C.muted}}>{c.industry}</div>
                </div>

                {/* Progress */}
                <div style={{padding:"12px 18px"}}>
                  {target>0&&<>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                      <span style={{color:C.muted}}>Videos publicados</span>
                      <span style={{fontWeight:700,color:statusColor}}>{published}/{target}</span>
                    </div>
                    <div style={{background:C.light,borderRadius:20,height:8,overflow:"hidden",marginBottom:12}}>
                      <div style={{width:`${pct}%`,height:"100%",background:statusColor,borderRadius:20,transition:"width .3s"}}/>
                    </div>
                  </>}
                  {!target&&<div style={{fontSize:12,color:C.muted,marginBottom:12}}>Sin meta definida este mes</div>}

                  {/* Stage mini-counts */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {STAGES.filter(s=>stageCount(s.id)>0).map(s=>(
                      <span key={s.id} style={{fontSize:10,fontWeight:700,background:s.color+"18",color:s.color,padding:"2px 8px",borderRadius:20,border:`1px solid ${s.color}30`}}>
                        {s.label.split(" ")[0]} {stageCount(s.id)}
                      </span>
                    ))}
                    {cCards.length===0&&published===0&&<span style={{fontSize:11,color:C.muted}}>Sin actividad</span>}
                  </div>
                </div>

                {/* Footer */}
                <div style={{padding:"10px 18px",background:C.light,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.muted}}>{cCards.length} en pipeline · {published} publicados</span>
                  <span style={{fontSize:12,color:C.accent,fontWeight:600}}>Ver tablero →</span>
                </div>
              </div>
            );
          })}
        </div>

        {showSetTargets&&<SetTargetsModal clients={clients} targets={targets} month={month} onSave={onSetTargets} onClose={()=>setShowSetTargets(false)}/>}
      </div>
    );
  }

  // ── CLIENT KANBAN BOARD ────────────────────────────────────────────────────
  const selClient=clients.find(c=>c.id===selectedClient);
  const monthCards=cards.filter(c=>c.clientId===selectedClient&&c.month===month);
  const [draggingId,setDraggingId]=useState(null);
  const [showAddCard,setShowAddCard]=useState(false);
  const [metricsCard,setMetricsCard]=useState(null);
  const target=targets[month]?.[selectedClient]||0;
  const published=publishedThisMonth(selectedClient);
  const pct=target>0?Math.min(100,Math.round(published/target*100)):null;
  const behind=target>0&&published<Math.floor(target*0.5);

  const cardsInStage=stageId=>monthCards.filter(c=>c.stage===stageId);

  const handleDrop=(e,stageId)=>{
    e.preventDefault();
    const cardId=e.dataTransfer.getData("cardId");
    const card=cards.find(c=>c.id===cardId);
    if(!card)return;
    if(stageId==="publicado"&&role==="community")return;
    onMoveCard(cardId,stageId);
    setDraggingId(null);
  };

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {role==="admin"&&(
            <button onClick={()=>setSelectedClient(null)} style={{background:C.light,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:12,fontWeight:600,color:C.text}}>
              ← Clientes
            </button>
          )}
          <div>
            <div style={{fontSize:20,fontWeight:800,color:C.text}}>🗂 {selClient?.name} — {month}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2}}>{monthCards.length} videos en pipeline · {published} publicados{target>0?` · Meta: ${target}`:""}</div>
          </div>
        </div>
        <Btn primary onClick={()=>setShowAddCard(true)}>+ Nuevo video</Btn>
      </div>

      {/* Progress bar */}
      {target>0&&(
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:16}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
              <span style={{color:C.muted}}>Progreso mensual</span>
              <span style={{fontWeight:700,color:behind?C.red:pct===100?C.green:C.amber}}>{published}/{target} publicados</span>
            </div>
            <div style={{background:C.light,borderRadius:20,height:8,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:behind?C.red:pct===100?C.green:C.amber,borderRadius:20,transition:"width .3s"}}/>
            </div>
          </div>
          <div style={{fontSize:12,fontWeight:700,color:behind?C.red:pct===100?C.green:C.amber,flexShrink:0}}>
            {pct===100?"✅ Meta cumplida":behind?"⚠️ Por debajo":Math.max(0,target-published)+" restantes"}
          </div>
        </div>
      )}

      {/* Bottleneck summary */}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        {STAGES.map(stage=>{
          const count=cardsInStage(stage.id).length;
          const isHigh=count>=5;const isMed=count>=3&&count<5;
          return(
            <div key={stage.id} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:20,background:isHigh?"#FEE2E2":isMed?"#FEF9C3":C.light,border:`1px solid ${isHigh?"#FECACA":isMed?"#FDE68A":C.border}`,flexShrink:0}}>
              <span style={{fontSize:13}}>{stage.label.split(" ")[0]}</span>
              <span style={{fontSize:12,fontWeight:700,color:isHigh?C.red:isMed?C.amber:C.muted}}>{count}</span>
              <span style={{fontSize:11,color:C.muted}}>{stage.label.split(" ").slice(1).join(" ")}</span>
              {isHigh&&<span style={{fontSize:10,color:C.red,fontWeight:700}}>⚠️ cuello</span>}
            </div>
          );
        })}
      </div>

      {/* Kanban */}
      <div style={{display:"flex",gap:12,overflowX:"auto",paddingBottom:12}}>
        {STAGES.map(stage=>(
          <div key={stage.id}
            onDragOver={e=>{e.preventDefault();e.currentTarget.style.background="#EFF6FF";}}
            onDragLeave={e=>{e.currentTarget.style.background="";}}
            onDrop={e=>{e.currentTarget.style.background="";handleDrop(e,stage.id);}}
            style={{flex:"0 0 220px",background:C.light,borderRadius:12,padding:12,border:`1px solid ${C.border}`,opacity:(stage.id==="publicado"&&role==="community")?0.6:1,transition:"background .15s"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{stage.label}</div>
              <span style={{fontSize:11,fontWeight:700,background:stage.color+"22",color:stage.color,padding:"2px 8px",borderRadius:20}}>{cardsInStage(stage.id).length}</span>
            </div>
            {stage.id==="publicado"&&role==="community"&&(
              <div style={{fontSize:10,color:C.muted,marginBottom:8,padding:"6px 8px",background:"#F1F5F9",borderRadius:6}}>🔒 Solo admins</div>
            )}
            {cardsInStage(stage.id).map(card=>(
              <KanbanCard key={card.id} card={card} clients={clients} role={role}
                isDragging={draggingId===card.id}
                onDragStart={setDraggingId} onDragEnd={()=>setDraggingId(null)}
                onMove={onMoveCard} onApprove={id=>onMoveCard(id,"publicado",true)}
                onMetrics={c=>setMetricsCard(c)} onDelete={onDeleteCard}/>
            ))}
            {cardsInStage(stage.id).length===0&&(
              <div style={{textAlign:"center",padding:"24px 10px",color:C.muted,fontSize:12,border:`2px dashed ${C.border}`,borderRadius:8,background:C.bg}}>Arrastra aquí</div>
            )}
          </div>
        ))}
      </div>

      {showAddCard&&<AddCardModal clients={clients} employees={employees} defaultClientId={selectedClient} role={role} onSave={card=>{onAddCard(card);setShowAddCard(false);}} onClose={()=>setShowAddCard(false)}/>}
      {metricsCard&&<MetricsModal card={metricsCard} employees={employees} onSave={m=>{onMetrics(metricsCard,m);setMetricsCard(null);}} onClose={()=>setMetricsCard(null)}/>}
    </div>
  );
}

// ── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage({clients,employees,setClients,setEmployees}){
  const[tab,setTab]=useState("clients");
  const[confirmDelete,setConfirmDelete]=useState(null);
  const[editItem,setEditItem]=useState(null);
  const[showAdd,setShowAdd]=useState(false);
  const blankC={name:"",industry:"Retail",status:"active",am:"",goal:""};
  const[cf,setCf]=useState(blankC);
  const setC=(k,v)=>setCf(p=>({...p,[k]:v}));
  const saveClient=()=>{
    if(!cf.name.trim())return;
    if(editItem?.type==="client")setClients(prev=>prev.map(c=>c.id===editItem.data.id?{...c,...cf}:c));
    else setClients(prev=>[...prev,{...cf,id:uid()}]);
    setCf(blankC);setEditItem(null);setShowAdd(false);
  };
  const startEditC=c=>{setCf({name:c.name,industry:c.industry,status:c.status,am:c.am,goal:c.goal});setEditItem({type:"client",data:c});setShowAdd(true);};
  const blankE={name:"",role:"Editor",status:"active"};
  const[ef,setEf]=useState(blankE);
  const setE=(k,v)=>setEf(p=>({...p,[k]:v}));
  const saveEmp=()=>{
    if(!ef.name.trim())return;
    if(editItem?.type==="emp")setEmployees(prev=>prev.map(e=>e.id===editItem.data.id?{...e,...ef}:e));
    else setEmployees(prev=>[...prev,{...ef,id:uid()}]);
    setEf(blankE);setEditItem(null);setShowAdd(false);
  };
  const startEditE=e=>{setEf({name:e.name,role:e.role,status:e.status});setEditItem({type:"emp",data:e});setShowAdd(true);};
  const cancel=()=>{setCf(blankC);setEf(blankE);setEditItem(null);setShowAdd(false);};
  const sBadge=s=>({active:{bg:"#DCFCE7",color:"#15803D",label:"Activo"},pending:{bg:"#FEF9C3",color:"#92400E",label:"Pendiente"},archived:{bg:C.light,color:C.muted,label:"Archivado"}}[s]||{bg:C.light,color:C.muted,label:s});
  const tabS=active=>({padding:"8px 20px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:active?C.surface:"transparent",color:active?C.text:C.muted,borderBottom:active?`2px solid ${C.text}`:"2px solid transparent"});
  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>⚙️ Configuración</div></div>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:24}}>
        <button style={tabS(tab==="clients")} onClick={()=>{setTab("clients");cancel();}}>🏢 Clientes</button>
        <button style={tabS(tab==="team")}    onClick={()=>{setTab("team");cancel();}}>👥 Equipo</button>
      </div>
      {tab==="clients"&&(
        <div>
          {!showAdd&&<div style={{marginBottom:16}}><Btn primary onClick={()=>setShowAdd(true)}>+ Agregar cliente</Btn></div>}
          {showAdd&&(
            <Card style={{marginBottom:20,borderLeft:`4px solid ${C.accent}`}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>{editItem?"✏️ Editar":"➕ Nuevo cliente"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[["Nombre","name"],["Account Manager","am"]].map(([l,k])=>(
                  <div key={k}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>{l}</div><input value={cf[k]} onChange={x=>setC(k,x.target.value)} style={inp}/></div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Industria</div>
                  <select value={cf.industry} onChange={x=>setC("industry",x.target.value)} style={inp}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select>
                </div>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Estado</div>
                  <select value={cf.status} onChange={x=>setC("status",x.target.value)} style={inp}><option value="active">Activo</option><option value="pending">Pendiente</option></select>
                </div>
              </div>
              <div style={{marginTop:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Objetivo</div><input value={cf.goal} onChange={x=>setC("goal",x.target.value)} style={inp}/></div>
              <div style={{display:"flex",gap:10,marginTop:16}}><Btn primary onClick={saveClient}>Guardar ✓</Btn><Btn onClick={cancel}>Cancelar</Btn></div>
            </Card>
          )}
          <Card pad={0}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr>{["Cliente","Industria","AM","Estado","Acciones"].map(h=><th key={h} style={{textAlign:"left",padding:"12px 16px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
              <tbody>{clients.map(c=>{
                const s=sBadge(c.status);const isCf=confirmDelete===c.id;
                return(<tr key={c.id}>
                  <td style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.goal}</div></td>
                  <td style={{padding:"13px 16px",fontSize:12,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{c.industry}</td>
                  <td style={{padding:"13px 16px",fontSize:12,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{c.am||"—"}</td>
                  <td style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}><span style={{background:s.bg,color:s.color,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20}}>{s.label}</span></td>
                  <td style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
                    {isCf
                      ?<div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:C.red,fontWeight:600}}>⚠️ ¿Eliminar?</span><Btn danger small onClick={()=>{setClients(prev=>prev.filter(x=>x.id!==c.id));setConfirmDelete(null);}}>Sí</Btn><Btn small onClick={()=>setConfirmDelete(null)}>No</Btn></div>
                      :<div style={{display:"flex",gap:6}}>
                        {c.status!=="archived"&&<Btn small onClick={()=>startEditC(c)}>✏️</Btn>}
                        {c.status==="active"&&<Btn small onClick={()=>setClients(prev=>prev.map(x=>x.id===c.id?{...x,status:"archived"}:x))}>📦</Btn>}
                        <Btn small danger onClick={()=>setConfirmDelete(c.id)}>🗑️</Btn>
                      </div>
                    }
                  </td>
                </tr>);
              })}</tbody>
            </table>
          </Card>
          <div style={{marginTop:12,fontSize:12,color:C.muted}}>💡 Archivar conserva el historial. Eliminar es permanente.</div>
        </div>
      )}
      {tab==="team"&&(
        <div>
          {!showAdd&&<div style={{marginBottom:16}}><Btn primary onClick={()=>setShowAdd(true)}>+ Agregar miembro</Btn></div>}
          {showAdd&&(
            <Card style={{marginBottom:20,borderLeft:`4px solid ${C.accent}`}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>{editItem?"✏️ Editar":"➕ Nuevo miembro"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Nombre</div><input value={ef.name} onChange={x=>setE("name",x.target.value)} style={inp}/></div>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>Rol</div><select value={ef.role} onChange={x=>setE("role",x.target.value)} style={inp}>{EMP_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:16}}><Btn primary onClick={saveEmp}>Guardar ✓</Btn><Btn onClick={cancel}>Cancelar</Btn></div>
            </Card>
          )}
          {EMP_ROLES.filter(r=>employees.some(e=>e.role===r)).map(role=>(
            <div key={role} style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10,textTransform:"uppercase"}}>
                {role==="Editor"?"✂️":role==="Community Manager"?"📱":role==="Productor"?"🎥":"👤"} {role}
              </div>
              <Card pad={0}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr>{["Nombre","Estado","Acciones"].map(h=><th key={h} style={{textAlign:"left",padding:"10px 16px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
                  <tbody>{employees.filter(e=>e.role===role).map(e=>{
                    const isCf=confirmDelete===e.id;
                    return(<tr key={e.id}>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:600,color:e.status==="archived"?C.muted:C.text}}>{e.name}</td>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`}}><span style={{background:e.status==="active"?"#DCFCE7":C.light,color:e.status==="active"?"#15803D":C.muted,fontSize:11,fontWeight:600,padding:"3px 8px",borderRadius:20}}>{e.status==="active"?"Activo":"Archivado"}</span></td>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`}}>
                        {isCf
                          ?<div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:12,color:C.red,fontWeight:600}}>⚠️ ¿Eliminar?</span><Btn danger small onClick={()=>{setEmployees(prev=>prev.filter(x=>x.id!==e.id));setConfirmDelete(null);}}>Sí</Btn><Btn small onClick={()=>setConfirmDelete(null)}>No</Btn></div>
                          :<div style={{display:"flex",gap:6}}>
                            <Btn small onClick={()=>startEditE(e)}>✏️</Btn>
                            {e.status==="active"&&<Btn small onClick={()=>setEmployees(prev=>prev.map(x=>x.id===e.id?{...x,status:"archived"}:x))}>📦</Btn>}
                            <Btn small danger onClick={()=>setConfirmDelete(e.id)}>🗑️</Btn>
                          </div>
                        }
                      </td>
                    </tr>);
                  })}</tbody>
                </table>
              </Card>
            </div>
          ))}
          {employees.some(e=>e.status==="archived")&&(
            <div style={{marginTop:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10}}>📦 ARCHIVADOS</div>
              <Card pad={0}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <tbody>{employees.filter(e=>e.status==="archived").map(e=>(
                    <tr key={e.id}>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.muted}}>{e.name}</td>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`,fontSize:12,color:C.muted}}>{e.role}</td>
                      <td style={{padding:"11px 16px",borderBottom:`1px solid ${C.border}`}}><Btn small onClick={()=>setEmployees(prev=>prev.map(x=>x.id===e.id?{...x,status:"active"}:x))}>↩️ Reactivar</Btn></td>
                    </tr>
                  ))}</tbody>
                </table>
              </Card>
            </div>
          )}
          <div style={{marginTop:12,fontSize:12,color:C.muted}}>💡 🎭 El campo Creador/Talent en los videos es texto libre — el talent es externo y cambia constantemente.</div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({clients,videos,onClient}){
  const top=[...videos].sort((a,b)=>b.views-a.views)[0];
  const hd=groupBy(videos,"hook");
  const clName=id=>clients.find(c=>c.id===id)?.name||"";
  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>📊 Agency Dashboard</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>{videos.length} videos en el período seleccionado</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
        <Kpi emoji="👁" v={fmt(totV(videos))}  l="Vistas totales"/>
        <Kpi emoji="🎬" v={videos.length}       l="Videos publicados"/>
        <Kpi emoji="💹" v={avgE(videos)}         l="Engagement promedio" color={C.accent}/>
        <Kpi emoji="📡" v={avgParaTi(videos)}    l="% Para Ti promedio"  color={C.green}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16}}>
        <Card>
          <SecTitle>🏢 Clientes</SecTitle>
          {clients.filter(c=>c.status!=="archived").map(c=>{
            const vs=cVids(videos,c.id);const has=vs.length>0;
            return(<div key={c.id} onClick={()=>onClient(c.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:16}}>{has?"🟢":"⚪"}</span>
                <div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.industry}</div></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:15,fontWeight:800,color:has?C.gold:C.muted}}>{has?fmt(totV(vs)):"Sin datos"}</div>
                <div style={{fontSize:11,color:C.muted}}>{vs.length} videos</div>
              </div>
            </div>);
          })}
        </Card>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {top&&(<Card>
            <SecTitle>🏆 Video del período</SecTitle>
            <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:4,lineHeight:1.3}}>{top.title}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{clName(top.clientId)} · {top.publishDate}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[[fmt(top.views),"👁 Vistas"],[eng(top),"💹 Eng."],[`${top.paraTi??'—'}%`,"📡 Para Ti"]].map(([v,l])=>(
                <div key={l} style={{background:C.light,borderRadius:8,padding:10,textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.text}}>{v}</div>
                  <div style={{fontSize:9,color:C.muted,marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
            <Tag>{top.hook}</Tag><Tag color={C.accent}>{top.format}</Tag>
          </Card>)}
          <Card style={{flex:1}}>
            <SecTitle>🪝 Top Hooks</SecTitle>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hd.slice(0,5)} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
                <XAxis type="number" hide/><YAxis type="category" dataKey="name" width={88} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg"]}/>
                <Bar dataKey="avg" radius={4}>{hd.slice(0,5).map((_,i)=><Cell key={i} fill={i===0?C.gold:i===1?C.amber:"#CBD5E1"}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── INTELIGENCIA CREATIVA ─────────────────────────────────────────────────────
function CreativePage({videos}){
  const hd=groupBy(videos,"hook");const fd=groupBy(videos,"format");const cd=groupBy(videos,"cta");
  const w=videos.filter(v=>v.paraTi!=null);
  const avgP=w.length?Math.round(w.reduce((s,v)=>s+v.paraTi,0)/w.length):0;
  const avgS=w.length?Math.round(w.reduce((s,v)=>s+(v.siguiendo||0),0)/w.length):0;
  const avgB=w.length?Math.round(w.reduce((s,v)=>s+(v.busqueda||0),0)/w.length):0;
  const organic=videos.filter(v=>v.pauta===0);const pautado=videos.filter(v=>v.pauta>0);
  const avgOrg=organic.length?Math.round(totV(organic)/organic.length):0;
  const avgPau=pautado.length?Math.round(totV(pautado)/pautado.length):0;
  const topAlgo=[...w].sort((a,b)=>b.paraTi-a.paraTi).slice(0,5);
  const chart=(data,title,color)=>(
    <Card><SecTitle>{title}</SecTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.slice(0,7)} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
          <XAxis type="number" hide/><YAxis type="category" dataKey="name" width={100} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg vistas"]}/>
          <Bar dataKey="avg" radius={4}>{data.slice(0,7).map((_,i)=><Cell key={i} fill={i===0?color:i===1?color+"BB":"#CBD5E1"}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>🧠 Inteligencia Creativa</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>{videos.length} videos analizados</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:24}}>
        <Card style={{borderLeft:`4px solid ${C.gold}`}}><div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>🪝 MEJOR HOOK</div><div style={{fontSize:20,fontWeight:800,color:C.text}}>{hd[0]?.name||"—"}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{hd[0]?.n} videos · avg {fmt(hd[0]?.avg||0)} vistas</div></Card>
        <Card style={{borderLeft:`4px solid ${C.accent}`}}><div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>🎬 MEJOR FORMATO</div><div style={{fontSize:20,fontWeight:800,color:C.text}}>{fd[0]?.name||"—"}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{fd[0]?.n} videos · avg {fmt(fd[0]?.avg||0)} vistas</div></Card>
        <Card style={{borderLeft:`4px solid ${C.green}`}}><div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>📡 PARA TI PROMEDIO</div><div style={{fontSize:20,fontWeight:800,color:C.green}}>{avgP}%</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{avgP>=70?"🔥 El algoritmo te impulsa":"Mejorable — fortalecer el hook"}</div></Card>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {chart(hd,"🪝 Vistas promedio por Hook",C.gold)}
        {chart(fd,"🎬 Vistas promedio por Formato",C.accent)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <SecTitle>📡 Fuentes de tráfico (promedio)</SecTitle>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[["📱 Para Ti",avgP,C.green],["👥 Siguiendo",avgS,C.accent],["🔍 Búsqueda",avgB,C.gold]].map(([l,v,color])=>(
              <div key={l} style={{textAlign:"center",background:C.light,borderRadius:10,padding:14}}>
                <div style={{fontSize:26,fontWeight:800,color}}>{v}%</div>
                <div style={{fontSize:10,color:C.muted,marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>
          <SecTitle>🔥 Videos más algorítmicos</SecTitle>
          {topAlgo.map(v=>(
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:12,color:C.text,maxWidth:200}}>{v.title}</div>
              <div style={{display:"flex",gap:8}}><span style={{fontSize:11,color:C.muted}}>{fmt(v.views)} vistas</span><span style={{background:C.green+"18",color:C.green,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{v.paraTi}%</span></div>
            </div>
          ))}
        </Card>
        <Card>
          <SecTitle>💰 ¿La pauta decide el éxito?</SecTitle>
          <div style={{padding:14,background:C.light,borderRadius:10,marginBottom:16}}>
            <div style={{fontSize:12,color:C.muted,marginBottom:10}}>Vistas promedio: orgánico vs pautado</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["🌱 Sin pauta",avgOrg,organic.length],["💸 Con pauta",avgPau,pautado.length]].map(([l,v,n])=>(
                <div key={l} style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>{fmt(v)}</div><div style={{fontSize:10,color:C.muted}}>{l} ({n} videos)</div></div>
              ))}
            </div>
          </div>
          <div style={{padding:12,background:"#FFF7ED",borderRadius:8,border:"1px solid #FED7AA",marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:700,color:"#9A3412",marginBottom:4}}>💡 El hallazgo clave</div>
            <div style={{fontSize:12,color:"#7C2D12",lineHeight:1.5}}>La pauta amplifica, no crea. El hook decide el techo. Optimiza el contenido primero, amplifica después.</div>
          </div>
          <SecTitle>🎯 CTAs por avg vistas</SecTitle>
          {cd.slice(0,5).map(c=>(
            <div key={c.name} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.text}}>{c.name}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.gold}}>{fmt(c.avg)} avg</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── EQUIPO ─────────────────────────────────────────────────────────────────────
function TeamPage({videos}){
  const{creators,editors,cms,producers}=useMemo(()=>teamStats(videos),[videos]);
  const HeroCard=({emoji,role,person})=>person?(
    <Card style={{borderTop:`4px solid ${C.gold}`}}>
      <div style={{fontSize:10,color:C.muted,letterSpacing:1,marginBottom:8}}>{emoji} MEJOR {role.toUpperCase()}</div>
      <div style={{fontSize:22,fontWeight:800,color:C.text,marginBottom:4}}>{person.name}</div>
      <div style={{fontSize:13,color:C.gold,fontWeight:600,marginBottom:10}}>🏆 {person.topVideo.title}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[[fmt(person.topVideo.views),"Top vistas"],[person.count+" videos","Participaciones"],[fmt(person.avgViews),"Avg vistas"],[eng(person.topVideo),"Eng. top"]].map(([v,l])=>(
          <div key={l} style={{background:C.light,borderRadius:8,padding:10}}><div style={{fontSize:16,fontWeight:800,color:C.text}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>
        ))}
      </div>
    </Card>
  ):(<Card><div style={{textAlign:"center",padding:20,color:C.muted,fontSize:12}}>Sin datos en este período</div></Card>);
  const RankTable=({title,emoji,people})=>(
    <Card>
      <SecTitle>{emoji} {title}</SecTitle>
      {people.length===0?<div style={{color:C.muted,fontSize:12,textAlign:"center",padding:20}}>Sin datos</div>
      :<table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["#","Nombre","Videos","Avg Vistas","Mejor Video","Top Vistas"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
        <tbody>{people.map((p,i)=>(
          <tr key={p.name}>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.muted}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:600,color:C.text}}>{p.name}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,color:C.muted}}>{p.count}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.gold}}>{fmt(p.avgViews)}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:12,color:C.muted,maxWidth:180}}>{p.topVideo.title}</td>
            <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.accent}}>{fmt(p.topVideo.views)}</td>
          </tr>
        ))}</tbody>
      </table>}
    </Card>
  );
  return(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:22,fontWeight:800,color:C.text}}>👥 Equipo</div><div style={{fontSize:13,color:C.muted,marginTop:4}}>Rendimiento basado en el mejor video del período — calidad sobre cantidad</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
        <HeroCard emoji="✂️" role="Editor"            person={editors[0]}/>
        <HeroCard emoji="📱" role="Community Manager" person={cms[0]}/>
        <HeroCard emoji="🎥" role="Productor"         person={producers[0]}/>
        <HeroCard emoji="🎭" role="Creador"           person={creators[0]}/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <RankTable title="Editores"             emoji="✂️" people={editors}/>
        <RankTable title="Community Managers"   emoji="📱" people={cms}/>
        <RankTable title="Productores"          emoji="🎥" people={producers}/>
        {creators.length>0&&<RankTable title="Talent (externo)" emoji="🎭" people={creators}/>}
      </div>
    </div>
  );
}

// ── CLIENT PAGE ───────────────────────────────────────────────────────────────
function ClientPage({client,videos,onAdd}){
  const vs=cVids(videos,client.id);const top=[...vs].sort((a,b)=>b.views-a.views)[0];const bot=[...vs].sort((a,b)=>a.views-b.views)[0];
  const[q,sq]=useState("");
  const filtered=vs.filter(v=>[v.title,v.creator,v.hook,v.format].some(x=>x?.toLowerCase().includes(q.toLowerCase())));
  const hd=groupBy(vs,"hook");
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div><div style={{fontSize:22,fontWeight:800,color:C.text}}>{client.name}</div><div style={{fontSize:12,color:C.muted,marginTop:4}}>{client.industry} · AM: {client.am} · {client.goal}</div></div>
        <Btn onClick={onAdd} primary>+ Agregar video</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <Kpi emoji="🎬" v={vs.length}          l="Videos"/>
        <Kpi emoji="👁" v={fmt(totV(vs))}       l="Vistas"/>
        <Kpi emoji="💹" v={avgE(vs)}            l="Engagement" color={C.accent}/>
        <Kpi emoji="📡" v={avgParaTi(vs)}       l="% Para Ti"  color={C.green}/>
      </div>
      {vs.length===0?<Card style={{textAlign:"center",padding:48}}><div style={{fontSize:40,marginBottom:12}}>📹</div><div style={{fontSize:15,fontWeight:700,color:C.text}}>Sin videos aún</div></Card>
      :<>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          {hd.length>0&&(<Card><SecTitle>🪝 Hook Performance</SecTitle>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hd} layout="vertical" margin={{left:0,right:20,top:0,bottom:0}}>
                <XAxis type="number" hide/><YAxis type="category" dataKey="name" width={95} tick={{fill:C.muted,fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:11}} formatter={v=>[fmt(v),"Avg vistas"]}/>
                <Bar dataKey="avg" radius={4}>{hd.map((_,i)=><Cell key={i} fill={i===0?C.gold:i===1?C.amber:"#CBD5E1"}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>)}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {top&&(<Card style={{borderLeft:`4px solid ${C.green}`}}>
              <SecTitle>🏆 Mejor video</SecTitle>
              <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:8,lineHeight:1.3}}>{top.title}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                {[[fmt(top.views),"Vistas"],[eng(top),"Engagement"],[`${top.paraTi??'—'}%`,"Para Ti"],[roiStr(top),"ROI"]].map(([v,l])=>(
                  <div key={l} style={{background:C.light,borderRadius:8,padding:8,textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:C.text}}>{v}</div><div style={{fontSize:9,color:C.muted}}>{l}</div></div>
                ))}
              </div>
              <Tag>{top.hook}</Tag><Tag color={C.accent}>{top.format}</Tag>
            </Card>)}
            {bot&&bot.id!==top?.id&&(<Card style={{borderLeft:`4px solid ${C.red}`}}>
              <SecTitle>⚠️ Peor video</SecTitle>
              <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>{bot.title}</div>
              <div style={{fontSize:13,color:C.gold,fontWeight:700}}>{fmt(bot.views)} vistas</div>
              <div style={{marginTop:6}}><Tag color={C.red}>{bot.hook}</Tag></div>
            </Card>)}
          </div>
        </div>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <SecTitle>🎬 Videos ({vs.length})</SecTitle>
            <input value={q} onChange={x=>sq(x.target.value)} placeholder="🔍 Buscar..." style={{...inp,width:220,fontSize:12,padding:"7px 10px"}}/>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
              <thead><tr>{["Título","Fecha","Hook","Vistas","Eng.","Para Ti","Pauta","ROI"].map(h=><th key={h} style={{textAlign:"left",padding:"8px 10px",fontSize:10,color:C.muted,letterSpacing:1,fontWeight:600,borderBottom:`1px solid ${C.border}`}}>{h}</th>)}</tr></thead>
              <tbody>{filtered.sort((a,b)=>b.views-a.views).map(v=>(
                <tr key={v.id} onMouseEnter={e=>e.currentTarget.style.background=C.light} onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`}}><div style={{fontSize:13,fontWeight:600,color:C.text,maxWidth:220}}>{v.title}</div><div style={{fontSize:10,color:C.muted,marginTop:2}}>{v.creator}</div></td>
                  <td style={{padding:"11px 10px",fontSize:11,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{v.publishDate}</td>
                  <td style={{padding:"11px 10px",borderBottom:`1px solid ${C.border}`}}><Tag>{v.hook}</Tag></td>
                  <td style={{padding:"11px 10px",fontSize:14,fontWeight:800,color:C.gold,borderBottom:`1px solid ${C.border}`}}>{fmt(v.views)}</td>
                  <td style={{padding:"11px 10px",fontSize:12,borderBottom:`1px solid ${C.border}`}}>{eng(v)}</td>
                  <td style={{padding:"11px 10px",fontSize:12,fontWeight:700,color:v.paraTi>=70?C.green:C.muted,borderBottom:`1px solid ${C.border}`}}>{pct(v.paraTi)}</td>
                  <td style={{padding:"11px 10px",fontSize:12,color:C.muted,borderBottom:`1px solid ${C.border}`}}>${v.pauta}</td>
                  <td style={{padding:"11px 10px",fontSize:11,color:C.muted,borderBottom:`1px solid ${C.border}`}}>{roiStr(v)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      </>}
    </div>
  );
}

// ── ADD VIDEO MODAL (admin direct entry) ──────────────────────────────────────
function AddModal({clients,employees,defaultClientId,onSave,onClose}){
  const activeClients=clients.filter(c=>c.status!=="archived");
  const activeEmps=employees.filter(e=>e.status==="active");
  const blank={clientId:defaultClientId||"",title:"",platform:"TikTok",publishDate:new Date().toISOString().slice(0,10),creator:"",editor:"",cm:"",producer:"",hook:"",format:"",cta:"",trigger:"",pillar:"",pauta:"0",views:"0",likes:"0",comments:"0",shares:"0",saves:"0",duration:"0",watchTimeAvg:"0",followers:"0",paraTi:"",siguiendo:"",busqueda:""};
  const[f,sf]=useState(blank);const set=(k,v)=>sf(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.clientId||!f.title)return;
    const nums=["pauta","views","likes","comments","shares","saves","duration","watchTimeAvg","followers","paraTi","siguiendo","busqueda"];
    onSave({...f,id:"v"+Date.now(),...nums.reduce((o,k)=>({...o,[k]:f[k]!==""?+f[k]:null}),{})});onClose();
  };
  const g2={display:"grid",gridTemplateColumns:"1fr 1fr",gap:12};
  const fld=(l,k,t="text",opts)=>(
    <div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
      {opts?<select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Seleccionar...</option>{opts.map(o=><option key={o}>{o}</option>)}</select>
           :<input type={t} value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}/>}
    </div>
  );
  const empSel=(l,k)=>(<div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{l}</div>
    <select value={f[k]} onChange={x=>set(k,x.target.value)} style={inp}><option value="">Sin asignar</option>{activeEmps.map(e=><option key={e.id} value={e.name}>{e.name} ({e.role})</option>)}</select></div>);
  const sec=(e,l)=><div style={{fontSize:11,fontWeight:700,color:C.accent,letterSpacing:1,margin:"14px 0 10px"}}>{e} {l}</div>;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:999,paddingTop:24,paddingBottom:24,overflowY:"auto"}}>
      <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:shadowMd,width:"min(680px,95vw)",fontFamily:"system-ui,sans-serif"}}>
        <div style={{padding:"22px 26px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>📹 Agregar video</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{padding:"14px 26px 26px"}}>
          {sec("📌","INFO GENERAL")}
          <div style={g2}>
            <div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>Cliente</div>
              <select value={f.clientId} onChange={x=>set("clientId",x.target.value)} style={inp}><option value="">Seleccionar...</option>{activeClients.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </div>
            {fld("Plataforma","platform","text",PLATFORMS)}
          </div>
          {fld("Título del video","title")}
          <div style={g2}>{fld("Fecha","publishDate","date")}{fld("Duración (seg)","duration","number")}</div>
          <div style={g2}>{fld("🎭 Creador / Talent","creator")}{empSel("✂️ Editor","editor")}</div>
          <div style={g2}>{empSel("📱 Community Manager","cm")}{empSel("🎥 Productor","producer")}</div>
          {fld("💰 Pauta ($)","pauta","number")}
          {sec("🎨","ATRIBUTOS CREATIVOS")}
          <div style={g2}>{fld("🪝 Hook","hook","text",HOOKS)}{fld("🎬 Formato","format","text",FORMATS)}</div>
          <div style={g2}>{fld("CTA","cta","text",CTAS)}{fld("Disparador emocional","trigger","text",TRIGGERS)}</div>
          {fld("Pilar de contenido","pillar","text",PILLARS)}
          {sec("📊","MÉTRICAS")}
          <div style={g2}>{fld("👁 Vistas","views","number")}{fld("❤️ Me gusta","likes","number")}</div>
          <div style={g2}>{fld("💬 Comentarios","comments","number")}{fld("🔁 Compartidos","shares","number")}</div>
          <div style={g2}>{fld("🔖 Guardados","saves","number")}{fld("👤 Seguidores ganados","followers","number")}</div>
          {fld("⏱ Tiempo viz. promedio (seg)","watchTimeAvg","number")}
          {sec("📡","FUENTES DE TRÁFICO")}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
            {fld("📱 % Para Ti","paraTi","number")}{fld("👥 % Siguiendo","siguiendo","number")}{fld("🔍 % Búsqueda","busqueda","number")}
          </div>
          <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:16}}><Btn onClick={onClose}>Cancelar</Btn><Btn onClick={save} primary>Guardar ✓</Btn></div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function App(){
  const[role,     setRole]    =useState(()=>store.get("tch_role")||null);
  const[clients,  setClients] =useState(()=>store.get("tch_clients_v3")||SEED_CLIENTS);
  const[employees,setEmps]    =useState(()=>store.get("tch_emps_v1")||SEED_EMPLOYEES);
  const[videos,   setVideos]  =useState(()=>store.get("tch_videos_v3")||SEED_VIDEOS);
  const[cards,    setCards]   =useState(()=>store.get("tch_cards_v1")||[]);
  const[targets,  setTargets] =useState(()=>store.get("tch_targets_v1")||{});
  const[page,     setPage]    =useState("dashboard");
  const[modal,    setModal]   =useState(null);
  const[range,    setRange]   =useState("all");
  const[comClient,setComClient]=useState(null);

  useEffect(()=>{store.set("tch_clients_v3",clients);},[clients]);
  useEffect(()=>{store.set("tch_emps_v1",employees);},[employees]);
  useEffect(()=>{store.set("tch_videos_v3",videos);},[videos]);
  useEffect(()=>{store.set("tch_cards_v1",cards);},[cards]);
  useEffect(()=>{store.set("tch_targets_v1",targets);},[targets]);
  useEffect(()=>{store.set("tch_role",role);},[role]);
  // Cross-tab sync via storage event (same browser, different tabs)
  useEffect(()=>{
    const h=(e)=>{
      if(e.key==="tch_cards_v1"   &&e.newValue)setCards(JSON.parse(e.newValue));
      if(e.key==="tch_videos_v3"  &&e.newValue)setVideos(JSON.parse(e.newValue));
      if(e.key==="tch_clients_v3" &&e.newValue)setClients(JSON.parse(e.newValue));
      if(e.key==="tch_emps_v1"    &&e.newValue)setEmps(JSON.parse(e.newValue));
    };
    window.addEventListener("storage",h);
    return()=>window.removeEventListener("storage",h);
  },[]);

  // Polling fallback — re-reads localStorage every 4 seconds to catch any missed updates
  useEffect(()=>{
    const poll=setInterval(()=>{
      const c=store.get("tch_cards_v1");   if(c)setCards(p=>JSON.stringify(p)!==JSON.stringify(c)?c:p);
      const v=store.get("tch_videos_v3");  if(v)setVideos(p=>JSON.stringify(p)!==JSON.stringify(v)?v:p);
      const cl=store.get("tch_clients_v3");if(cl)setClients(p=>JSON.stringify(p)!==JSON.stringify(cl)?cl:p);
      const e=store.get("tch_emps_v1");    if(e)setEmps(p=>JSON.stringify(p)!==JSON.stringify(e)?e:p);
    },4000);
    return()=>clearInterval(poll);
  },[]);

  const addVideo=useCallback(v=>setVideos(p=>[...p,v]),[]);
  const logout=()=>{setRole(null);store.set("tch_role",null);setComClient(null);};

  // Pipeline actions
  const addCard=useCallback(card=>setCards(p=>[...p,card]),[]);
  const moveCard=useCallback((cardId,stageId,isPublish=false)=>{
    setCards(prev=>prev.map(c=>{
      if(c.id!==cardId)return c;
      const updated={...c,stage:stageId};
      if(isPublish||stageId==="publicado")updated.publishDate=NOW.toISOString().slice(0,10);
      if(stageId==="publicado")updated.stage="metricas";
      if(stageId==="revision")updated.revisionCount=(c.revisionCount||0)+1;
      return updated;
    }));
  },[]);
  const deleteCard=useCallback(id=>setCards(prev=>prev.filter(c=>c.id!==id)),[]);
  const submitMetrics=useCallback((card,metrics)=>{
    // Create video entry from pipeline card + metrics
    const nums=["views","likes","comments","shares","saves","followers","watchTimeAvg","pauta","paraTi","siguiendo","busqueda","duration"];
    const newVideo={
      id:"v"+Date.now(),clientId:card.clientId,title:card.title,
      platform:card.platform||"TikTok",publishDate:card.publishDate,
      editor:card.editor||"",cm:"",producer:"",creator:metrics.creator||"",
      hook:metrics.hook||"",format:metrics.format||"",cta:metrics.cta||"",
      trigger:metrics.trigger||"",pillar:metrics.pillar||"",
      ...nums.reduce((o,k)=>({...o,[k]:metrics[k]!=null?metrics[k]:null}),{}),
    };
    setVideos(prev=>[...prev,newVideo]);
    setCards(prev=>prev.filter(c=>c.id!==card.id));
  },[]);

  const filtered=useMemo(()=>filterByDate(videos,range),[videos,range]);
  const logout2=logout;

  if(!role)return<Login onLogin={r=>setRole(r)}/>;

  // ── COMMUNITY VIEW ──
  if(role==="community"){
    const activeClients=clients.filter(c=>c.status!=="archived");
    if(!comClient){
      return(
        <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif"}}>
          <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:shadow}}>
            <div style={{fontSize:18,fontWeight:900,color:C.text}}>TheContentHub <span style={{background:C.accent+"18",color:C.accent,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>Community</span></div>
            <button onClick={logout2} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>Cerrar sesión</button>
          </div>
          <div style={{maxWidth:480,margin:"60px auto",padding:"0 16px"}}>
            <Card>
              <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6}}>👋 Bienvenido</div>
              <div style={{fontSize:13,color:C.muted,marginBottom:24}}>¿Para cuál cliente vas a trabajar hoy?</div>
              {activeClients.map(c=>(
                <div key={c.id} onClick={()=>setComClient(c.id)}
                  style={{padding:"14px 16px",borderRadius:10,border:`1px solid ${C.border}`,marginBottom:10,cursor:"pointer",background:C.light,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:14,fontWeight:700,color:C.text}}>{c.name}</div><div style={{fontSize:11,color:C.muted}}>{c.industry}</div></div>
                  <span style={{fontSize:18}}>→</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      );
    }
    const selClient=clients.find(c=>c.id===comClient);
    return(
      <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif"}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:shadow}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:16,fontWeight:900,color:C.text}}>TheContentHub</span>
            <span style={{background:C.accent+"18",color:C.accent,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>Community</span>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>· {selClient?.name}</span>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button onClick={()=>setComClient(null)} style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontSize:12,fontWeight:600}}>← Cambiar cliente</button>
            <button onClick={logout2} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:12}}>Cerrar sesión</button>
          </div>
        </div>
        <div style={{padding:24}}>
          <PipelinePage
            clients={clients} employees={employees} cards={cards} videos={videos}
            targets={targets} role="community" communityClientId={comClient}
            onAddCard={addCard} onMoveCard={moveCard} onApproveCard={()=>{}}
            onMetrics={submitMetrics} onDeleteCard={deleteCard} onSetTargets={()=>{}}
          />
        </div>
      </div>
    );
  }

  // ── ADMIN VIEW ──
  const activeClient=clients.find(c=>c.id===page);
  const withData=clients.filter(c=>c.status!=="archived"&&cVids(filtered,c.id).length>0);
  const noData=clients.filter(c=>c.status!=="archived"&&cVids(filtered,c.id).length===0);
  const mainPages=[
    {id:"dashboard",label:"📊 Dashboard"},
    {id:"pipeline", label:"🗂 Pipeline"},
    {id:"creative", label:"🧠 Inteligencia Creativa"},
    {id:"team",     label:"👥 Equipo"},
    {id:"settings", label:"⚙️ Configuración"},
  ];
  const navItem=(id,label,dot)=>(
    <div key={id} onClick={()=>setPage(id)} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:page===id?600:400,color:page===id?C.sideGold:C.sideText,borderLeft:page===id?`2px solid ${C.sideGold}`:"2px solid transparent",background:page===id?"rgba(245,158,11,.1)":"transparent"}}>
      <span style={{fontSize:7,color:dot,flexShrink:0}}>●</span>{label}
    </div>
  );
  return(
    <div style={{display:"flex",height:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",color:C.text,overflow:"hidden"}}>
      <div style={{width:220,background:C.sidebar,flexShrink:0,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"20px 16px 14px",borderBottom:"1px solid #1E293B"}}>
          <div style={{fontSize:16,fontWeight:900,color:C.sideGold,letterSpacing:-0.5}}>TheContentHub</div>
          <div style={{fontSize:9,color:C.sideMuted,letterSpacing:3,marginTop:3}}>🚀 REVO LABS · ADMIN</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
          {mainPages.map(p=>(
            <div key={p.id} onClick={()=>setPage(p.id)} style={{padding:"9px 16px",cursor:"pointer",fontSize:13,fontWeight:page===p.id?600:400,color:page===p.id?C.sideGold:C.sideText,borderLeft:page===p.id?`2px solid ${C.sideGold}`:"2px solid transparent",background:page===p.id?"rgba(245,158,11,.1)":"transparent"}}>{p.label}</div>
          ))}
          {withData.length>0&&<><div style={{padding:"14px 16px 4px",fontSize:9,color:C.sideMuted,letterSpacing:3,fontWeight:700}}>ACTIVOS</div>{withData.map(c=>navItem(c.id,c.name,"#22C55E"))}</>}
          {noData.length>0&&<><div style={{padding:"14px 16px 4px",fontSize:9,color:C.sideMuted,letterSpacing:3,fontWeight:700}}>SIN DATOS</div>{noData.map(c=>navItem(c.id,c.name,"#334155"))}</>}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid #1E293B"}}>
          <div style={{fontSize:11,color:C.sideMuted,wordBreak:"break-all"}}>humberto@revolabsmedia.com</div>
          <div style={{fontSize:9,color:"#334155",marginTop:2}}>CSO · REVO Labs</div>
          <button onClick={logout} style={{marginTop:8,background:"none",border:"none",color:"#EF4444",fontSize:11,cursor:"pointer",padding:0}}>Cerrar sesión →</button>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:shadow}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>
            {page==="dashboard"?"📊 Dashboard":page==="pipeline"?"🗂 Pipeline":page==="creative"?"🧠 Inteligencia Creativa":page==="team"?"👥 Equipo":page==="settings"?"⚙️ Configuración":activeClient?.name||""}
          </div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            {page!=="settings"&&page!=="pipeline"&&<DateRangePicker value={range} onChange={setRange}/>}
            {page!=="pipeline"&&page!=="settings"&&<Btn onClick={()=>setModal(activeClient?.id||"")} primary>+ Video</Btn>}
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:24}}>
          {page==="dashboard"&&<Dashboard   clients={clients}   videos={filtered} onClient={setPage}/>}
          {page==="pipeline" &&<PipelinePage clients={clients} employees={employees} cards={cards} videos={videos} targets={targets} role="admin" communityClientId={null} onAddCard={addCard} onMoveCard={moveCard} onApproveCard={moveCard} onMetrics={submitMetrics} onDeleteCard={deleteCard} onSetTargets={setTargets}/>}
          {page==="creative" &&<CreativePage videos={filtered}/>}
          {page==="team"     &&<TeamPage     videos={filtered}/>}
          {page==="settings" &&<SettingsPage clients={clients} employees={employees} setClients={setClients} setEmployees={setEmps}/>}
          {activeClient      &&<ClientPage   client={activeClient} videos={filtered} onAdd={()=>setModal(activeClient.id)}/>}
        </div>
      </div>
      {modal!==null&&<AddModal clients={clients} employees={employees} defaultClientId={modal} onSave={addVideo} onClose={()=>setModal(null)}/>}
    </div>
  );
}
