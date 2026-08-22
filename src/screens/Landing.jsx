import { useState } from "react";
import { t } from "../lib/i18n";
import { sbGetOne, sbInsertX, sbSignIn, sbUpdate } from "../lib/supabase";
import { BRAND, C, Logo, inp, shMd } from "../ui/theme";

// REVO's build is agency-only, so there's no portal to choose — just sign in.
function AuthScreen({onLogin}){
  const[email,setEmail]=useState("");
  const[pass,setPass]=useState("");
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);

  const go=async()=>{
    if(!email||!pass){setErr(t("Please fill in all fields"));return;}
    setLoading(true);setErr("");
    const{user,error}=await sbSignIn(email,pass);
    if(error||!user){setErr(t("Wrong email or password."));setLoading(false);return;}
    const prof=await sbGetOne("profiles","id",user.id);
    try{localStorage.setItem(`sk_acct_${user.id}`,"agency");}catch(e){}
    if(!prof)sbInsertX("profiles",{id:user.id,name:user.email,email:user.email,account_type:"agency"});
    else if(prof.account_type!=="agency")sbUpdate("profiles","id",user.id,{account_type:"agency"});
    onLogin(user,{...(prof||{}),account_type:"agency",name:prof?.name||user.email});
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"system-ui,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"min(360px,100%)",background:C.surface,borderRadius:18,border:`1px solid ${C.border}`,boxShadow:shMd,overflow:"hidden"}}>
        <div style={{display:"flex",height:3}}>
          {[BRAND.red,BRAND.yellow,BRAND.blue,BRAND.green].map((c,i)=><div key={i} style={{flex:1,background:c}}/>)}
        </div>
        <div style={{padding:"30px 30px 32px"}}>
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:22}}>
            <Logo/>
            <div style={{fontSize:15,fontWeight:600,color:C.text,letterSpacing:-0.2}}>ContentHubs</div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>{t("Email")}</div>
            <input type="email" value={email} onChange={x=>setEmail(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={inp}/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:5,fontWeight:500}}>{t("Password")}</div>
            <input type="password" value={pass} onChange={x=>setPass(x.target.value)} onKeyDown={x=>x.key==="Enter"&&go()} style={inp}/>
          </div>
          {err&&<div style={{color:C.red,fontSize:12,marginBottom:10}}>{err}</div>}
          <button onClick={go} disabled={loading}
            style={{width:"100%",padding:12,background:C.text,color:"#FFF",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>
            {loading?t("Signing in…"):t("Sign in →")}
          </button>
        </div>
      </div>
    </div>
  );
}

export { AuthScreen };
