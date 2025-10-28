"use client";

import { useParams } from "next/navigation";
import DashboardUser from "@/components/DashboardUser";
import Header from "@/components/Header";
import "./dashboard.css";
import DashboardModel from "@/components/DashboardModel";

export default function Dashboard() {
  const { user_id } = useParams();

  return (
    <div className={"dashboards-container"}>
      <DashboardUser endpoint={`/api/user/${user_id}`}/>
      <DashboardModel endpoint={`/api/model/user_id/${user_id}`}/>
    </div>
  )
}
