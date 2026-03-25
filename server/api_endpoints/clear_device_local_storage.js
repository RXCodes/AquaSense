import { DeviceManager } from "../device_manager.js";
import { PathLock } from "../path_lock.js";
import { Database } from "../database.js";

export function initialize(app) {
  app.post("/clear_device_local_storage", async (req, res) => {
    // get parameters from the request
    let device_id = req.body.device_id;
    let username = req.body.username;
    let password = req.body.password;
    if (!device_id) {
      res.send({ success: false, error: "missing device_id" });
      return;
    }
    if (!username || !password) {
      res.send({ success: false, error: "missing credentials" });
      return;
    }

    // check if the device exists
    let registered_devices = DeviceManager.get_registered_devices();
    let device = registered_devices.find(
      (device) => device.device_id == device_id,
    );
    if (!device) {
      res.send({ success: false, error: "device not found" });
      return;
    }

    // check if the credentials are correct
    if (username != process.env.username || password != process.env.password) {
      res.send({ success: false, error: "invalid credentials" });
      return;
    }

    // lock the path to prevent concurrent access
    let settings_path = "devices/" + device_id + "/settings.json";
    await PathLock.lock_paths([settings_path]);
    function send_response(response) {
      PathLock.unlock_paths([settings_path]);
      res.send(response);
    }

    // read the device settings from the database
    let device_settings = await Database.read_text(settings_path, "{}");
    if (!device_settings.success) {
      send_response({
        success: false,
        error: "failed to read device settings",
      });
      return;
    }

    // update device settings
    try {
      let settings = JSON.parse(device_settings.text);
      settings.remove_local_storage_request_time = Date.now() / 1000;
      let upload_success = await Database.upload_text(
        settings_path,
        JSON.stringify(settings),
      );
      if (!upload_success) {
        send_response({
          success: false,
          error: "failed to update device status",
        });
        return;
      }
      send_response({
        success: true,
      });
    } catch (e) {
      send_response({
        success: false,
        error: "internal error: " + e,
      });
    }
  });
}
