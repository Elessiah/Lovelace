import Link from "next/link"

export default function Home() {
  return (
    <div>
      <Link href="/signup">Inscription</Link>
      <br />
      <br />
      <Link href="/login">Connexion</Link>
      <br />
      <br />
      <Link href="/page_amba">Page Ambassadrices</Link>
    </div>
  )
}
