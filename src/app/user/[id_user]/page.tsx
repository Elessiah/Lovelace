type Props = {
    params: {
        id_user: string
    }
}

export default function userDetails({
    params: {id_user}}: Props) {
    return <p>Details: {id_user}</p>;
}