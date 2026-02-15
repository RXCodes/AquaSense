import { Authorization } from "../authorization.js"
import { DeviceManager } from "../device_manager.js"

export async function initialize(app) {
  app.get("/get_devices", (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }
    let registered_devices = DeviceManager.get_registered_devices();
    if (registered_devices == null) {
      res.send({"success": false, "error": "devices not loaded"});
      return;
    }

    // only send the device id, name, and creation date details to the client
    var devices = [];
    for (var i = 0; i < registered_devices.length; i++) {
      let device = registered_devices[i];
      devices.push({
        "id": device.device_id,
        "name": device.name,
        "creation_date": device.creation_date
      });
    }
    res.send({"success": true, "devices": devices});
  });
}