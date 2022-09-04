if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const OAuth2 = google.auth.OAuth2;

const OAuth2Client = new OAuth2({
  clientId: process.env.OAUTH2_CLIENT_ID,
  clientSecret: process.env.OAUTH2_CLIENT_SECRET,
  redirectUri: "https://developers.google.com/oauthplayground",
});

OAuth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const accessToken = OAuth2Client.getAccessToken();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "waynetech010@gmail.com",
    clientId: process.env.OAUTH2_CLIENT_ID,
    clientSecret: process.env.OAUTH2_CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken,
  },
});

module.exports = transporter;
