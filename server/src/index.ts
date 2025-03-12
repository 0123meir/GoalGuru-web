import dotenv from "dotenv";
import myApp from "./app";
import https from 'https'
import fs from 'fs'

dotenv.config();

const privateKey = fs.readFileSync('./certs/private-key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/certificate.pem', 'utf8');
const ca = fs.readFileSync('./certs/ca.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate, ca: ca };

const port = process.env.PORT;

https.createServer(credentials, myApp).listen(port, () => {
  console.log(`HTTPS server running on port ${port}`);
});


