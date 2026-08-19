import {redirect} from "next/navigation";import {isAdminAuthenticated} from "../admin-auth";import AdminPanel from "./panel";export const dynamic="force-dynamic";
export default async function Admin(){if(!await isAdminAuthenticated())redirect("/admin/login");return <AdminPanel displayName="Administrateur Lachger Car"/>}
