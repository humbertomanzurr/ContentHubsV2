import { useEffect, useState } from "react";
import { sbGetOne, sbGetSession, sbSessionSync, sbSignOut } from "./lib/supabase";
import { AgencyApp } from "./screens/Agency";
import { AuthScreen } from "./screens/Landing";
import { C } from "./ui/theme";

export default function App(){
  // Read the session synchronously so a refresh can never hang on a request.
  const[user,setUser]=useState(()=>sbSessionSync()?.user||null);
  const[profile,setProfile]=useState(()=>{
    const s=sbSessionSync();
    return s?.user?{account_type:"agency",name:s.user.email}:null;
  });
  const[ready,setReady]=useState(()=>!!sbSessionSync()?.user);

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const s=await sbGetSession();
        if(cancelled)return;
        if(!s?.user){setUser(null);setProfile(null);setReady(true);return;}
        setUser(s.user);
        const p=await sbGetOne("profiles","id",s.user.id);
        if(cancelled)return;
        setProfile({...(p||{}),account_type:"agency",name:p?.name||s.user.email});
        setReady(true);
      }catch(e){
        console.warn("[contenthubs] session check failed, keeping cached view",e);
        setReady(true);
      }
    })();
    return()=>{cancelled=true;};
  },[]);

  const logout=()=>{sbSignOut();setUser(null);setProfile(null);};

  if(user)return<AgencyApp user={user} profile={profile} onLogout={logout}/>;
  if(!ready)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",color:C.muted,fontSize:13}}>
      Cargando…
    </div>
  );
  return<AuthScreen onLogin={(u,p)=>{setUser(u);setProfile(p);}}/>;
}
