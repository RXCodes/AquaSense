import { Authorization } from "../authorization.js"

/*
Endpoint: /get_status

fetch relevant status information from the device such as last update time, battery level, etc.
*/

export function initialize(app) {
  app.post("/get_status", (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }
    // ...
  });
}