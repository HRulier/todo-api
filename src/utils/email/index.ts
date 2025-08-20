import { Resend } from "resend";
import dotenv from "dotenv";

import dotEnvConfig from "~/config/dot-env";
dotenv.config(dotEnvConfig);

const sendEmail = async (
  email: string,
  subject: string,
  reactComponent: any
) => {
  const resend = new Resend(process.env.RESEND_APIKEY);
  const {
    // data,
    error,
  } = await resend.emails.send({
    from: `${process.env.PROJECT_NAME} <${process.env.NOREPLY}>`,
    to: email,
    subject,
    react: reactComponent,
  });

  // console.log(data);

  if (error) {
    throw error;
  }
};

export default sendEmail;
