import { DeviceManager } from "../device_manager.js"

export function initialize(app) {
  app.post("/create_device", (req, res) => {
    // get the device id from the request
    let device_id = req.body.device_id;
    if (!device_id) {
      res.send({"success": false, "error": "missing device_id"});
      return;
    }

    // get the device from the list of devices to prepare using the id
    let pairing_devices = DeviceManager.get_pairing_devices();
    let requested_device = pairing_devices.find(device => device.device_id == device_id);
    if (!requested_device) {
      res.send({"success": false, "error": "invalid device_id"});
      return;
    }

    // at this point, the device id is valid and can be created
    // generate a new device token that the sensor device can use to authenticate its requests
    let new_device_token = generate_device_token();

    // remove the device from the list of devices to prepare
    DeviceManager.remove_pairing_device(requested_device.device_id);

    // add the device to the list of registered devices
    DeviceManager.add_device(requested_device.name, device_id, new_device_token);

    // send the device token to the client (sensor device)
    res.send({"success": true, "device_id": new_device_token});
  });
}

// generate a random id for a new device
function generate_device_token() {
  let token = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    token += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return token;
}