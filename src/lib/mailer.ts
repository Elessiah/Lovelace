import nodemailer from "nodemailer"

export async function sendConfirmationEmail(to: string, token: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const url = `${process.env.NEXT_PUBLIC_URL}/confirm?token=${token}`

  await transporter.sendMail({
    from: `"Lovelace" <${process.env.SMTP_USER}>`,
    to,
    subject: "Confirme ton inscription",
    html: `<p>Bienvenue sur Lovelace ! Clique <a href="${url}">ici</a> pour confirmer ton email.</p>`,
  })
}
