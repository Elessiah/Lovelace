"use client";

import { useParams } from "next/navigation";
import DashboardUser from "@/components/DashboardUser";
import Header from "@/components/Header";
import "./dashboard.css";

interface Project {
  projet_id: number;
  projet_titre: string;
  projet: string;
  projet_photo_path: string;
}

export default function Dashboard() {
  const { user_id } = useParams();

  return (
      <div className={"dashboard"}>
        <Header />
        <div className={"dashboards-container"}>
          <DashboardUser endpoint={`/api/dashboard/user/${user_id}`}/>
        </div>
      </div>
  )
}
