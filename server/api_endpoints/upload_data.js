import { Authorization } from "../authorization.js"

export function initialize(app) {
  app.post("/upload_data", (req, res) => {
    if (!Authorization.request_has_sensor_device_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }

    // get the device id from the request
    let device_id = Authorization.get_device_id_from_request(req);
    
  });
}