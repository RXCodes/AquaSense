import { Authorization } from "../authorization.js"

export function initialize(app) {
  app.post("/get_settings", async (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({"success": false, "error": "unauthorized"});
      return;
    }

    // get the device id from the request
    let device_id = req.body.device_id;
    if (!device_id) {
      res.send({"success": false, "error": "missing device id"});
      return;
    }

    // check if the device is registered
    let registered_devices = DeviceManager.get_registered_devices();
    let device = registered_devices.find(device => device.device_id == device_id);
    if (!device) {
      res.send({"success": false, "error": "device not found"});
    }
    
    // read the device settings from the database
    let path = "devices/" + device_id + "/settings.json";
    let device_settings = await Database.read_text(path, "{}");
    if (!device_settings.success) {
      res.send({"success": false, "error": "failed to read device settings"});
      return;
    }

    // return the device settings
    var settings = JSON.parse(device_settings.text);
    settings.name = device.name;
    res.send({"success": true, "settings": settings});
  });
}