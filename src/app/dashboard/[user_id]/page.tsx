"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Project {
  projet_id: number;
  projet_titre: string;
  projet: string;
  projet_photo_path: string;
}

export default function DashboardPage() {
  const params = useParams();
  const userId = params.user_id;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ppFile, setPpFile] = useState<File | null>(null);
  const [ppPreview, setPpPreview] = useState<string>("");

  const [bio, setBio] = useState("");
  const [parcours, setParcours] = useState("");
  const [domaine, setDomaine] = useState("");
  const [metier, setMetier] = useState("");
  const [pitch, setPitch] = useState("");
  const [entreprise, setEntreprise] = useState("");

  const [projectsFiles, setProjectsFiles] = useState<{ file: File; titre: string; description: string }[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [addingProject, setAddingProject] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        if (!data.success) { setMessage(data.message); setLoading(false); return; }
        if (data.data.id_user.toString() !== userId) { setMessage("Accès refusé"); setLoading(false); return; }

        setUser(data.data);
        setEmail(data.data.email);
        setPpPreview(data.data.pp_path || "");

        if (data.data.role === "Ambassadrice" && data.data.ambassadorInfo) {
          const info = data.data.ambassadorInfo;
          setBio(info.biographie || "");
          setParcours(info.parcours || "");
          setDomaine(info.domaine || "");
          setMetier(info.metier || "");
          setPitch(info.pitch || "");
          setEntreprise(info.entreprise || "");
          setProjects(info.projects || []);
        }
        setLoading(false);
      } catch {
        setMessage("Erreur serveur");
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [userId]);

  const handlePpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPpFile(file);
    if (file) setPpPreview(URL.createObjectURL(file));
  };

  const handleAddProject = () => {
    setAddingProject(true);
    setProjectsFiles([...projectsFiles, { file: null as any, titre: "", description: "" }]);
  };

  const handleProjectChange = (index: number, field: "titre" | "description" | "file", value: any) => {
    setProjectsFiles(prev => {
      const copy = [...prev];
      (copy[index] as any)[field] = value;
      return copy;
    });
  };

  const handleDeleteProject = async (proj_id: number) => {
    try {
      await fetch(`/api/dashboard?deleteProject=${proj_id}`, { method: "DELETE" });
      setProjects(prev => prev.filter(p => p.projet_id !== proj_id));
    } catch {
      setMessage("Erreur suppression projet");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append("email", email);
    if (password) formData.append("password", password);
    if (ppFile) formData.append("pp_path", ppFile);

    if (user.role === "Ambassadrice") {
      formData.append("role", "Ambassadrice");
      formData.append("bio", bio);
      formData.append("parcours", parcours);
      formData.append("domaine", domaine);
      formData.append("metier", metier);
      formData.append("pitch", pitch);
      formData.append("entreprise", entreprise);

      projectsFiles.forEach((p, i) => {
        if (p.file) formData.append("projets", p.file);
        formData.append(`projet_titre_${i}`, p.titre);
        formData.append(`projet_description_${i}`, p.description);
      });
    }

    try {
      const res = await fetch("/api/dashboard", { method: "POST", body: formData });
      const data = await res.json();
      setMessage(data.message);

      if (data.pp_path) setPpPreview(data.pp_path);

      setProjects(prev => [
        ...prev,
        ...projectsFiles.map((p, i) => ({
          projet_id: Date.now() + i,
          projet_titre: p.titre,
          projet: p.description,
          projet_photo_path: p.file ? URL.createObjectURL(p.file) : ""
        }))
      ]);
      setProjectsFiles([]);
      setAddingProject(false);
    } catch {
      setMessage("Erreur lors de la mise à jour");
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>{message || "Utilisateur non trouvé"}</p>;

  return (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {/* Formulaire */}
      <form onSubmit={handleUpdate} style={{ flex: 1 }}>
        <h2>Modifier infos</h2>
        <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /><br />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" /><br />
        <span>Photo de profil </span><input type="file" onChange={handlePpChange} /><br />

        {user.role === "Ambassadrice" && <>
          <textarea placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} /><br />
          <textarea placeholder="Parcours" value={parcours} onChange={e => setParcours(e.target.value)} /><br />
          <input placeholder="Domaine" value={domaine} onChange={e => setDomaine(e.target.value)} /><br />
          <input placeholder="Métier" value={metier} onChange={e => setMetier(e.target.value)} /><br />
          <textarea placeholder="Pitch" value={pitch} onChange={e => setPitch(e.target.value)} /><br />
          <input placeholder="Entreprise" value={entreprise} onChange={e => setEntreprise(e.target.value)} /><br />

          <h4>Projets</h4>
          {!addingProject && <button type="button" onClick={handleAddProject}>Ajouter un projet</button>}
          {projectsFiles.map((p, i) => (
            <div key={i}>
              <input type="file" onChange={e => handleProjectChange(i, "file", e.target.files?.[0])} /><br />
              <input placeholder="Titre" value={p.titre} onChange={e => handleProjectChange(i, "titre", e.target.value)} /><br />
              <textarea placeholder="Description" value={p.description} onChange={e => handleProjectChange(i, "description", e.target.value)} /><br />
              {p.file && <span>{p.file.name}</span>}
            </div>
          ))}

          <h4>Projets existants</h4>
          {projects.map(p => (
            <div key={p.projet_id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <img src={p.projet_photo_path} alt={p.projet} style={{ width: 80 }} />
              <div>
                <strong>{p.projet_titre}</strong><br />
                <span>{p.projet}</span>
              </div>
              <button type="button" onClick={() => handleDeleteProject(p.projet_id)}>❌</button>
            </div>
          ))}
        </>}
        <button type="submit">Mettre à jour</button>
        {message && <p>{message}</p>}
      </form>

      {/* Aperçu profil */}
      <div style={{ flex: 1 }}>
        <h2>Profil</h2>
        {ppPreview && <img src={ppPreview} alt="PP" style={{ width: 100 }} />}
        <p>Nom complet: {user.first_name} {user.last_name}</p>
        <p>Email : {email}</p>
        {user.role === "Ambassadrice" && <>
          <p>Bio : {bio}</p>
          <p>Parcours : {parcours}</p>
          <p>Domaine : {domaine}</p>
          <p>Métier : {metier}</p>
          <p>Pitch : {pitch}</p>
          <p>Entreprise : {entreprise}</p>
          <h4>Projets :</h4>
          {projects.map(p => (
            <div key={p.projet_id}>
              <strong>{p.projet_titre}</strong>
              <p>{p.projet}</p>
              <img src={p.projet_photo_path} alt={p.projet} style={{ width: 100 }} />
            </div>
          ))}
        </>}
      </div>

    </div>
  );
}
