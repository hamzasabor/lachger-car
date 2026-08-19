import {clearAdminSession,setAdminSession,verifyAdminPassword} from "../../admin-auth";
export async function POST(req:Request){const {password}=await req.json();if(!await verifyAdminPassword(String(password||"")))return Response.json({error:"Mot de passe incorrect"},{status:401});await setAdminSession();return Response.json({ok:true})}
export async function DELETE(){await clearAdminSession();return Response.json({ok:true})}
