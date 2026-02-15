import { Authorization } from "../authorization.js"
import { DeviceManager } from "../device_manager.js"

export function initialize(app) {
  app.post("/request_new_device_id", (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }
    if (DeviceManager.get_registered_devices() == null) {
      res.send({"success": false, "error": "devices not loaded"});
      return;
    }

    // get the device name from the request
    let device_name = req.body.name;
    if (!device_name) {
      res.send({"success": false, "error": "missing device name"});
      return;
    }
    if (device_name.length < 3 || device_name.length > 20) {
      res.send({"success": false, "error": "device name must be between 3 and 20 characters"});
      return;
    }

    // generate a new device id - make sure it's unique
    var new_device_id = generate_device_id();
    let registered_devices = DeviceManager.get_registered_devices();
    while (registered_devices.some(device => device.device_id == new_device_id)) {
      new_device_id = generate_device_id();
    }

    // track the new device id and name
    DeviceManager.add_pairing_device(new_device_id, device_name);
    res.send({"success": true, "device_id": new_device_id});
  });
}

// generate a random id for a new device
function generate_device_id() {
  let token = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 6; i++) {
    token += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return token;
}