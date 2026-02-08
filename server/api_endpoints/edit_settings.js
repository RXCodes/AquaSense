import { Authorization } from "../authorization.js"

/*
Endpoint: /edit_settings
Body: {...}
- ...: JSON of new settings

used to make changes to the settings of the device
*/

export function initialize(app) {
  app.post("/edit_settings", (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }
    // ...
  });
}