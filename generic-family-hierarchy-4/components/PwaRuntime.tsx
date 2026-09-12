"use client";
import {useEffect} from "react";
export default function PwaRuntime(){
 useEffect(()=>{if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{})},[]);
 return null;
}
