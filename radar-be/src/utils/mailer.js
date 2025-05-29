const nodemailer = require("nodemailer");
const { getConfig } = require("../services/config.service");

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_PASS,
    },
});

module.exports = async function sendAlertMail(data) {
  const { radarId, angle, distance, timestamp } = data;
  const config = await getConfig();
  const toEmail = config.ALERT_EMAIL || process.env.ALERT_EMAIL;
  const mailOptions = {
    from: process.env.ALERT_EMAIL,
    to: toEmail,
    subject: "🚨 Phát hiện xâm nhập!",
    html: `
      <h3>Radar ID: ${radarId}</h3>
      <p><strong>Góc quét:</strong> ${angle}°</p>
      <p><strong>Khoảng cách:</strong> ${distance} cm</p>
      <p><strong>Thời gian:</strong> ${timestamp}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
