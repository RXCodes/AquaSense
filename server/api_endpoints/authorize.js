import { Authorization } from "../authorization.js"

/*
Endpoint: /authorize
Body: {"username": "...", "password": "..."}
- username: string
- password: string

used to authenticate a user when signing in
*/

export function initialize(app) {
  app.post("/authorize", (req, res) => {
    Authorization.authorize_request(req, res);
  });
}