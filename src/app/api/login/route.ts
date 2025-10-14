//      const match = await bcrypt.compare(inputPassword, user.hash);





// On importe les outils fournis par Next.js pour gérer les requêtes/réponses HTTP
import { NextRequest, NextResponse } from "next/server"

// =========================================
// === Fonction qui s’exécute côté serveur ===
// =========================================
// Elle sera appelée automatiquement à chaque requête POST sur /api/connexion
export async function POST(req: NextRequest) {
  // 🔹 On lit le corps (body) de la requête (format JSON)
  const { pseudo } = await req.json()

  // 🔹 On prépare une réponse JSON à renvoyer
  // Ici, on renvoie juste un message, mais en vrai tu pourrais :
  //    - vérifier un mot de passe
  //    - accéder à une base de données
  //    - renvoyer des infos utilisateur
  const response = { message: `Salut ${pseudo}, bienvenue sur le site !` }

  // 🔹 On renvoie cette réponse au client
  return NextResponse.json(response)
}

// 🔹 Hack TypeScript : certains compilateurs veulent au moins un export par fichier
// Si tu n’écris pas ce "export {}", TypeScript peut râler
export {}


