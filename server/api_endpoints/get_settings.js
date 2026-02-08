import { Authorization } from "../authorization.js"

/*
Endpoint: /get_settings

fetch the current settings from the server
device and user use this to sync their settings with the server
*/

export function initialize(app) {
  app.post("/get_settings", (req, res) => {
    if (!Authorization.request_has_user_authorization(req) && 
        !Authorization.request_has_sensor_device_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }
    // ...
  });
}