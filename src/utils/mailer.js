import nodemailer from 'nodemailer';

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const mailer = (body) => {
  const mailOptions = body;

  return new Promise((resolve, reject) => {
    smtpTransport.sendMail(mailOptions, (err, info) => (err ? reject(err) : resolve(info)));
  });
};

export default mailer;
