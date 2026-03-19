import { Authorization } from "../authorization.js";
import { Database } from "../database.js";

export function initialize(app) {
  app.post("/edit_settings", async (req, res) => {
    if (!Authorization.request_has_user_authorization(req)) {
      res.send({ success: false, error: "unauthorized" });
      return;
    }

    // get the device id from the request
    let device_id = req.body.device_id;
    if (!device_id) {
      res.send({ success: false, error: "missing device_id" });
      return;
    }

    // check if the device is registered
    let registered_devices = DeviceManager.get_registered_devices();
    let device = registered_devices.find(
      (device) => device.device_id == device_id,
    );
    if (!device) {
      res.send({ success: false, error: "device not found" });
      return;
    }

    // check if the settings are valid
    var settings = req.body.settings;
    if (!settings) {
      res.send({ success: false, error: "missing settings" });
      return;
    }

    // TODO: sanitize settings

    // update the device settings in the database
    let path = "devices/" + device_id + "/settings.json";
    let success = await Database.upload_text(path, JSON.stringify(settings));
    if (!success) {
      res.send({ success: false, error: "failed to update device settings" });
      return;
    }
    res.send({ success: true });
  });
}
