import Link from 'next/link';

export default function Footer() {
    return (
    <div className="footer">
        <p>&copy; 2025 Lovelace. Tous droits réservés.</p>
        <Link href="/legal">Mentions légales</Link>
    </div>
    )
}
