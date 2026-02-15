import { DeviceManager } from "../device_manager.js"

export function initialize(app) {
  app.post("/remove_device", (req, res) => {
    // get parameters from the request
    let device_id = req.body.device_id;
    let username = req.body.username;
    let password = req.body.password;
    if (!device_id) {
      res.send({"success": false, "error": "missing device_id"});
      return;
    }
    if (!username || !password) {
      res.send({"success": false, "error": "missing credentials"});
      return;
    }

    // check if the device exists
    let registered_devices = DeviceManager.get_registered_devices();
    let device = registered_devices.find(device => device.device_id == device_id);
    if (!device) {
      res.send({"success": false, "error": "device not found"});
      return;
    }

    // check if the credentials are correct
    if (username != process.env.username || password != process.env.password) {
      res.send({"success": false, "error": "invalid credentials"});
      return;
    }

    // remove the device
    DeviceManager.remove_device(device_id);
    res.send({"success": true});
  })
}