import { Authorization } from "../authorization.js"

export function initialize(app) {
  app.post("/authorize", (req, res) => {
    Authorization.authorize_request(req, res);
  });
}