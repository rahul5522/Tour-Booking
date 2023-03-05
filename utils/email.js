const nodemailer = require("nodemailer");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

//Created class To generaliase the email sending with different html template to mailtrap sevice not to actual email
module.exports = class Email {
  constructor(user, url) {
    this.firstName = user.name.split(" ")[0];
    this.to = user.email;
    this.url = url;
    this.from = `Rahul Waghmare <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === "production") {
      //send proper email to end user

      const transporter = nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
      return transporter;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    return transporter;
  }

  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: "rajendrawaghmare242@gmail.com",
      to: this.to,
      subject: subject,
      html,
      text: htmlToText(html),
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcone() {
    await this.send("welcome", "Welcome to natours family");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Reset Password Link! Valid for 10 mins");
  }
};

//Sending Mail using node-mailer

// const sendMail = async (options) => {
//   var transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const mail = {
//     from: "rahul@ok.com",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//   };

//   await transporter.sendMail(mail);
// };

// module.exports = sendMail;
