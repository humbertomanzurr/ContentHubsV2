import { useEffect, useState } from "react";
import { getLang, setLang, t } from "../lib/i18n";
import { sbDelete, sbGet, sbInsertX, sbSignUp, sbUpdate, sbUpsert } from "../lib/supabase";
import { BRAND, Btn, C, Card, inp } from "../ui/theme";

const EMOJIS=["🏪","👗","💪","💳","🚗","🏢","🍺","🍽️","❤️","💻","🏠","🎬","⭐","🔥","💡","🎯","🚀","💎","🌟","🌿","🎪","📱"];

// Role carries a colour so a team list is scannable without reading every row.
const ROLE_COLOR={admin:"#7F77DD",editor:"#378ADD",member:"#1D9E75"};

const ROLES=[
  {id:"admin",  label:"Admin",   desc:"Sees every client, can publish and approve."},
  {id:"editor", label:"Editor",  desc:"Works in Editing, attaches finished videos."},
  {id:"member", label:"Community Manager", desc:"Schedules, writes scripts and moves cards."},
];

// Inline styles cannot hold a media query, so the viewport is tracked in state.
function useNarrow(px=760){
  const[narrow,setNarrow]=useState(()=>typeof window!=="undefined"&&window.innerWidth<px);
  useEffect(()=>{
    const onResize=()=>setNarrow(window.innerWidth<px);
    window.addEventListener("resize",onResize); onResize();
    return()=>window.removeEventListener("resize",onResize);
  },[px]);
  return narrow;
}

function SettingsPage({workspaceId,wsName,user,profile,tab,onTab,clients,onReload}){
  const narrow=useNarrow();
  const[members,setMembers]=useState([]);
  const[wsEdit,setWsEdit]=useState(wsName||"");
  const[nameEdit,setNameEdit]=useState(profile?.name||"");
  const[clientEdits,setClientEdits]=useState({});
  const[note,setNote]=useState(null);
  const[emojiFor,setEmojiFor]=useState(null);
  const[delFor,setDelFor]=useState(null);
  const[menuId,setMenuId]=useState(null);
  const[editId,setEditId]=useState(null);
  const[editForm,setEditForm]=useState({name:"",role:"member"});
  useEffect(()=>{setWsEdit(wsName||"");},[wsName]);
  const[form,setForm]=useState({name:"",email:"",password:"",role:"member"});
  const[msg,setMsg]=useState(null);
  const[busy,setBusy]=useState(false);

  const load=async()=>{
    if(!workspaceId)return;
    const rows=await sbGet("workspace_members",`&workspace_id=eq.${workspaceId}`)||[];
    // Names live in profiles, so join them here — a list of uuids is unusable.
    const profs=await sbGet("profiles","")||[];
    const byId={};
    profs.forEach(p2=>{byId[p2.id]=p2;});
    setMembers(rows.map(r=>({...r,profile:byId[r.user_id]||null})));
  };
  useEffect(()=>{load();},[workspaceId]);

  const createUser=async()=>{
    if(busy)return;
    if(!form.name.trim()||!form.email.trim()||!form.password.trim()){
      setMsg({ok:false,text:t("Fill in every field")});return;
    }
    if(form.password.length<6){
      setMsg({ok:false,text:t("Password must be at least 6 characters")});return;
    }
    setBusy(true);setMsg(null);
    const{user:nu,error}=await sbSignUp(form.email.trim(),form.password);
    if(error||!nu){
      setBusy(false);
      setMsg({ok:false,text:(error?.message||error?.msg||t("Could not create the account"))});
      return;
    }
    const id=nu.id||nu.user?.id;
    if(id){
      // upsert, because a signup trigger may already have made a placeholder row
      await sbUpsert("profiles",{id,name:form.name.trim(),email:form.email.trim(),account_type:"agency"},"id");
      const r=await sbInsertX("workspace_members",{workspace_id:workspaceId,user_id:id,role:form.role,created_at:new Date().toISOString()});
      if(!r.ok){setBusy(false);setMsg({ok:false,text:r.error||t("Account made, but not added to the workspace")});return;}
    }
    setMsg({ok:true,text:`${t("Account created for")} ${form.email.trim()}`});
    setForm({name:"",email:"",password:"",role:"member"});
    setBusy(false);
    load();
  };

  const field=(label,key,type="text")=>(
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{label}</div>
      <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} style={inp}/>
    </div>
  );

  return(
    <div style={{display:"grid",gridTemplateColumns:narrow?"1fr":"178px 1fr",gap:narrow?14:24,alignItems:"start"}}>
      {/* Settings is a list of places, not a sequence — a sidebar says that,
          a row of tabs implies an order that does not exist. */}
      <nav className="ch-nav">
        <div className="ch-nav__group">{t("Workspace")}</div>
        {[["users",t("Users")],["clients",t("Clients")],["workspace",t("Workspace")]].map(([id,label])=>(
          <button key={id} onClick={()=>onTab&&onTab(id)}
            className={"ch-nav__item"+(tab===id?" ch-nav__item--on":"")}>
            <span className="ch-nav__key"/>{label}
          </button>
        ))}
        <div className="ch-nav__group">{t("You")}</div>
        {[["account",t("My account")],["language",t("Language")]].map(([id,label])=>(
          <button key={id} onClick={()=>onTab&&onTab(id)}
            className={"ch-nav__item"+(tab===id?" ch-nav__item--on":"")}>
            <span className="ch-nav__key"/>{label}
          </button>
        ))}
      </nav>

      <div style={{minWidth:0}}>

      {tab==="users"&&(
        <>
          <Card style={{marginBottom:14}}>
            <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{t("Add someone to the team")}</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:14}}>
              {t("They sign in with this email and password from any device.")}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}>{field(t("Full name"),"name")}</div>
              {field(t("Email"),"email","email")}
              {field(t("Temporary password"),"password","password")}
            </div>
            <div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:500}}>{t("Role")}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:14}}>
              {ROLES.map(r=>{
                const on=form.role===r.id;
                return(
                  <button key={r.id} onClick={()=>setForm(p=>({...p,role:r.id}))} title={t(r.desc)}
                    style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:on?600:400,
                      color:on?C.text:C.muted,background:C.surface,border:`1px solid ${on?C.text:C.border}`}}>
                    {t(r.label)}
                  </button>
                );
              })}
            </div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:14,paddingLeft:9,borderLeft:`2px solid ${C.border}`}}>
              {t((ROLES.find(r=>r.id===form.role)||{}).desc||"")}
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <Btn primary onClick={createUser} disabled={busy}>{busy?t("Creating…"):t("Create account ✓")}</Btn>
              {msg&&<span style={{fontSize:12,color:msg.ok?BRAND.green:C.red,lineHeight:1.5}}>{msg.text}</span>}
            </div>
            <div style={{fontSize:10,color:C.muted,lineHeight:1.55,marginTop:12,background:C.light,borderRadius:8,padding:"9px 11px"}}>
              {t("If Supabase has email confirmation switched on, they'll need to confirm before signing in.")}
            </div>
          </Card>

          <Card pad={0} style={{overflow:"hidden"}}>
            <div style={{padding:"14px 16px 12px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>{t("Team")}</div>
                <div style={{fontSize:15,fontWeight:600,color:C.text}}>{members.length} {members.length===1?t("person"):t("people")}</div>
              </div>
              {msg&&<span style={{fontSize:11,color:msg.ok?BRAND.green:C.red}}>{msg.text}</span>}
            </div>

            {members.length===0?(
              <div style={{padding:"20px 16px",fontSize:12,color:C.muted}}>{t("Nobody else yet.")}</div>
            ):(
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 150px 44px",gap:10,padding:"8px 16px",background:C.light,borderTop:`0.5px solid ${C.border}`,borderBottom:`0.5px solid ${C.border}`}}>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase"}}>{t("User")}</div>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase"}}>{t("Access")}</div>
                  <div style={{fontSize:10,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase",textAlign:"right"}}>{t("Actions")}</div>
                </div>
                {members.map(m=>{
                  const me=m.user_id===user.id;
                  const nm=m.profile?.name||(me?(profile?.name||user.email):"—");
                  const em=m.profile?.email||(me?user.email:"");
                  const editing=editId===m.user_id;
                  return(
                    <div key={m.user_id} style={{borderBottom:`0.5px solid ${C.border}`}}>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 150px 44px",gap:10,padding:"11px 16px",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
                          <div className="ch-avatar" style={{background:ROLE_COLOR[m.role||"member"]||C.muted}}>
                            {(nm||"?").slice(0,1).toUpperCase()}
                          </div>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:500,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              {nm}{me&&<span style={{color:C.muted,fontWeight:400}}> ({t("you")})</span>}
                            </div>
                            {em&&<div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{em}</div>}
                          </div>
                        </div>
                        <div>
                          <span style={{fontSize:10,fontWeight:600,color:m.role==="admin"?BRAND.blue:C.muted,background:m.role==="admin"?BRAND.blue+"14":C.light,border:`0.5px solid ${m.role==="admin"?BRAND.blue+"40":C.border}`,borderRadius:20,padding:"3px 9px",whiteSpace:"nowrap"}}>
                            {t((ROLES.find(r=>r.id===(m.role||"member"))||{}).label||"Member")}
                          </span>
                        </div>
                        <div style={{textAlign:"right",position:"relative"}}>
                          <button onClick={()=>setMenuId(menuId===m.user_id?null:m.user_id)}
                            style={{background:"none",border:"none",cursor:"pointer",fontSize:15,color:C.muted,padding:"2px 6px",lineHeight:1}}>⋯</button>
                          {menuId===m.user_id&&(
                            <>
                              <div onClick={()=>setMenuId(null)} style={{position:"fixed",inset:0,zIndex:900}}/>
                              <div style={{position:"absolute",right:0,top:"100%",zIndex:901,width:170,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 10px 28px rgba(0,0,0,.14)",padding:"5px 0",textAlign:"left"}}>
                                <button onClick={()=>{setEditId(m.user_id);setEditForm({name:nm,role:m.role||"member"});setMenuId(null);}}
                                  style={{display:"block",width:"100%",textAlign:"left",padding:"8px 12px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,color:C.text}}
                                  onMouseEnter={e=>e.currentTarget.style.background=C.light}
                                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{t("Edit")}</button>
                                {!me&&(
                                  <button onClick={async()=>{
                                      setMenuId(null);
                                      await sbDelete("workspace_members","user_id",m.user_id);
                                      setMsg({ok:true,text:t("Access removed")});load();
                                    }}
                                    style={{display:"block",width:"100%",textAlign:"left",padding:"8px 12px",border:"none",background:"transparent",cursor:"pointer",fontSize:12,color:C.red}}
                                    onMouseEnter={e=>e.currentTarget.style.background=C.light}
                                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{t("Remove access")}</button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {editing&&(
                        <div style={{padding:"0 16px 14px 54px",background:C.light}}>
                          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end",paddingTop:11}}>
                            <div style={{flex:"1 1 180px"}}>
                              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:500}}>{t("Display name")}</div>
                              <input value={editForm.name} onChange={e=>setEditForm(p2=>({...p2,name:e.target.value}))}
                                style={{...inp,fontSize:12,padding:"7px 10px",background:C.surface}}/>
                            </div>
                            <div style={{flex:"0 0 150px"}}>
                              <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:500}}>{t("Access")}</div>
                              <select value={editForm.role} disabled={me}
                                onChange={e=>setEditForm(p2=>({...p2,role:e.target.value}))}
                                style={{...inp,fontSize:12,padding:"7px 10px",background:C.surface,cursor:me?"not-allowed":"pointer"}}>
                                {ROLES.map(r=><option key={r.id} value={r.id}>{t(r.label)}</option>)}
                              </select>
                            </div>
                            <Btn onClick={()=>setEditId(null)}>{t("Cancel")}</Btn>
                            <Btn primary onClick={async()=>{
                                if(editForm.name.trim())await sbUpdate("profiles","id",m.user_id,{name:editForm.name.trim()});
                                if(!me&&editForm.role!==m.role)
                                  await sbUpsert("workspace_members",[{workspace_id:workspaceId,user_id:m.user_id,role:editForm.role}],"workspace_id,user_id");
                                setEditId(null);setMsg({ok:true,text:t("Saved ✓")});load();
                              }}>{t("Save")}</Btn>
                          </div>
                          {me&&<div style={{fontSize:10,color:C.muted,marginTop:7}}>{t("You can't change your own access.")}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </Card>
        </>
      )}


      {tab==="clients"&&(
        <Card>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{t("Clients")} · {(clients||[]).length}</div>
          {(clients||[]).length===0&&<div style={{fontSize:12,color:C.muted}}>{t("No clients to manage yet.")}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {(clients||[]).map(c=>{
              const val=clientEdits[c.id]!==undefined?clientEdits[c.id]:c.name;
              const dirty=val.trim()&&val.trim()!==c.name;
              return(
                <div key={c.id} style={{background:C.light,borderRadius:8,padding:"9px 11px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <button onClick={()=>setEmojiFor(emojiFor===c.id?null:c.id)} title={t("Change emoji")}
                      style={{fontSize:16,background:C.surface,border:`1px solid ${emojiFor===c.id?C.text:C.border}`,borderRadius:7,cursor:"pointer",padding:"3px 7px",flexShrink:0}}>
                      {c.emoji||"🏢"}
                    </button>
                    <input value={val} onChange={e=>setClientEdits(p2=>({...p2,[c.id]:e.target.value}))}
                      style={{...inp,flex:1,fontSize:12,padding:"6px 9px",background:C.surface}}/>
                    <button disabled={!dirty}
                      onClick={async()=>{await sbUpdate("agency_clients","id",c.id,{name:val.trim()});setNote({ok:true,text:t("Saved ✓")});onReload&&onReload();}}
                      style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${dirty?C.text:C.border}`,background:dirty?C.text:C.surface,color:dirty?"#FFF":C.muted,cursor:dirty?"pointer":"not-allowed",fontSize:11,fontWeight:600,flexShrink:0}}>
                      {t("Save")}
                    </button>
                    <button onClick={()=>setDelFor(c.id)}
                      style={{padding:"6px 9px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.muted,cursor:"pointer",fontSize:11,flexShrink:0}}>
                      {t("Delete")}
                    </button>
                  </div>
                  {emojiFor===c.id&&(
                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:9}}>
                      {EMOJIS.map(e=>(
                        <button key={e} onClick={async()=>{await sbUpdate("agency_clients","id",c.id,{emoji:e});setEmojiFor(null);setNote({ok:true,text:t("Saved ✓")});onReload&&onReload();}}
                          style={{fontSize:17,padding:"3px 6px",border:`1px solid ${c.emoji===e?C.text:C.border}`,borderRadius:7,cursor:"pointer",background:C.surface}}>{e}</button>
                      ))}
                    </div>
                  )}
                  {delFor===c.id&&(
                    <div style={{marginTop:9,background:"#FEF2F2",border:`1px solid ${C.red}30`,borderRadius:7,padding:"9px 11px"}}>
                      <div style={{fontSize:12,color:C.red,fontWeight:600,marginBottom:3}}>{t("Delete this client?")}</div>
                      <div style={{fontSize:11,color:C.muted,lineHeight:1.5,marginBottom:9}}>{t("This removes the client and everything in their pipeline.")}</div>
                      <div style={{display:"flex",gap:7}}>
                        <button onClick={()=>setDelFor(null)} style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",fontSize:11,color:C.text}}>{t("Cancel")}</button>
                        <button onClick={async()=>{await sbDelete("agency_clients","id",c.id);setDelFor(null);setNote({ok:true,text:t("Saved ✓")});onReload&&onReload();}}
                          style={{padding:"6px 12px",borderRadius:7,border:"none",background:C.red,color:"#FFF",cursor:"pointer",fontSize:11,fontWeight:600}}>{t("Yes, delete")}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {note&&<div style={{fontSize:12,color:note.ok?BRAND.green:C.red,marginTop:10}}>{note.text}</div>}
        </Card>
      )}

      {tab==="workspace"&&(
        <Card>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{t("Workspace")}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{t("Workspace name")}</div>
          <input value={wsEdit} onChange={e=>setWsEdit(e.target.value)} style={{...inp,marginBottom:12}}/>
          <Btn primary disabled={!wsEdit.trim()||wsEdit.trim()===wsName}
            onClick={async()=>{await sbUpdate("workspaces","id",workspaceId,{name:wsEdit.trim()});setNote({ok:true,text:t("Saved ✓")});onReload&&onReload();}}>
            {t("Save")}
          </Btn>
          {note&&<span style={{fontSize:12,color:note.ok?BRAND.green:C.red,marginLeft:10}}>{note.text}</span>}
        </Card>
      )}

      {tab==="account"&&(
        <Card>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{t("My account")}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{t("Email")}</div>
          <div style={{fontSize:13,color:C.text,background:C.light,borderRadius:8,padding:"9px 12px",marginBottom:14}}>{user.email}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:4,fontWeight:500}}>{t("Display name")}</div>
          <input value={nameEdit} onChange={e=>setNameEdit(e.target.value)} style={{...inp,marginBottom:12}}/>
          <Btn primary disabled={!nameEdit.trim()||nameEdit.trim()===(profile?.name||"")}
            onClick={async()=>{await sbUpdate("profiles","id",user.id,{name:nameEdit.trim()});setNote({ok:true,text:t("Saved ✓")});}}>
            {t("Save")}
          </Btn>
          {note&&<span style={{fontSize:12,color:note.ok?BRAND.green:C.red,marginLeft:10}}>{note.text}</span>}
        </Card>
      )}

      {tab==="language"&&(
        <Card>
          <div style={{fontSize:9,fontWeight:600,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>{t("Language")}</div>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:14}}>
            {t("This is saved on this device, so each person can pick their own.")}
          </div>
          <div style={{display:"flex",gap:9}}>
            {[["es","Español"],["en","English"]].map(([code,label])=>{
              const on=getLang()===code;
              return(
                <button key={code} onClick={()=>setLang(code)}
                  style={{flex:1,padding:"14px 12px",borderRadius:10,cursor:"pointer",textAlign:"left",
                    border:`1px solid ${on?C.text:C.border}`,background:on?C.light:C.surface}}>
                  <div style={{fontSize:13,fontWeight:on?600:400,color:C.text}}>{label}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{on?t("In use"):t("Switch to this")}</div>
                </button>
              );
            })}
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}

export { SettingsPage };
