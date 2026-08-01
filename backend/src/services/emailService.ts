import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
});

export async function sendRecordatorio(to: string, nombrePaciente: string, estudios: string[]) {
  await transporter.sendMail({
    from: `"Laboratorio Clínico" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Es momento de su próximo estudio de laboratorio',
    html: `
      <h2>Hola, ${nombrePaciente}</h2>
      <p>Le recordamos que es tiempo de realizarse los siguientes estudios:</p>
      <ul>${estudios.map(e => `<li>${e}</li>`).join('')}</ul>
      <p>Visítenos en cualquiera de nuestras sucursales.</p>
      <p>Atentamente,<br>Laboratorio Clínico</p>
    `,
  });
}
