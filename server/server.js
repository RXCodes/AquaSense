import express from 'express';
import path from 'path';
import fs from 'fs';
import cookie_parser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { Authorization } from "./authorization.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = 5000;
app.use(express.json());
app.use(cookie_parser());

// serve the home page
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'home.html'));
});

// serve the dashboard page
app.get("/dashboard/", (req, res) => {
  let authorized = Authorization.request_has_user_authorization(req);
  if (!authorized) {
    res.redirect("/unauthorized");
    return;
  }
  res.sendFile(path.join(__dirname, 'pages', 'dashboard.html'));
});

// serve the settings page
app.get("/settings/", (req, res) => {
  let authorized = Authorization.request_has_user_authorization(req);
  if (!authorized) {
    res.redirect("/unauthorized");
    return;
  }
  res.sendFile(path.join(__dirname, 'pages', 'settings.html'));
});

// when logging out, clear the cookie and redirect to the home page
app.get("/logout/", (req, res) => {
  Authorization.log_out_user(req, res);
});

// serve the unauthorized page
app.get("/unauthorized/", (_, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'unauthorized.html'));
});

// serve images and scripts
app.use("/client_scripts", express.static(path.join(__dirname, 'client_scripts')));
app.use("/images", express.static(path.join(__dirname, 'images')));

// setup the api endpoints
// loop through all files in the api_endpoints folder and import them
const apiDir = path.join(__dirname, 'api_endpoints');
if (fs.existsSync(apiDir)) {
  const api_endpoints = fs.readdirSync(apiDir);
  for (const file of api_endpoints) {
    const filePath = "./api_endpoints/" + file;
    const endpoint = await import(filePath);
    endpoint.initialize(app);
    console.log(`Initialized API endpoint: ${file}`);
  }
}

// unknown page is served when the user requests a page that doesn't exist
app.use((req, res) => {
  console.log("Path not found: " + req.path);
  res.sendFile(path.join(__dirname, 'pages', 'unknown.html'));
});

// start the server
app.listen(PORT, () => {
  console.log(`Server running on port:${PORT}`);
});
