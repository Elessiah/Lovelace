
// "Lancer un chat privé avec l'ambassadrice quand on clique sur le bouton chat:"

// <Link href="/chat">Chat Privé</Link>

type Props = {
    params: {
        id_user: string
    }
}

export default function userDetails({
    params: {id_user}}: Props) {
    return <p>Details: {id_user}</p>;
}

// if not user id, cet user n'existe pas, else show info