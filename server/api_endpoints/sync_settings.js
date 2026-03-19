import { Authorization } from "../authorization.js";
import { PathLock } from "../path_lock.js";
import { Database } from "../database.js";

export function initialize(app) {
  app.post("/sync_settings", async (req, res) => {
    if (!Authorization.request_has_sensor_device_authorization(req)) {
      res.send({ success: false, error: "unauthorized" });
      return;
    }

    // get the device id from the request
    let device_id = Authorization.get_device_id_from_request(req);

    // lock the path to prevent concurrent access
    let paths = [
      "devices/" + device_id + "/settings.json",
      "devices/" + device_id + "/device_status.json",
    ];
    await PathLock.lock(paths);
    function send_response(response) {
      PathLock.unlock(paths);
      res.send(response);
    }

    // read the device settings from the database
    let settings_path = "devices/" + device_id + "/settings.json";
    let device_settings = await Database.read_text(settings_path, "{}");
    if (!device_settings.success) {
      send_response({
        success: false,
        error: "failed to read device settings",
      });
      return;
    }

    // update device status
    let status_path = "devices/" + device_id + "/device_status.json";
    let device_status = await Database.read_text(status_path, "{}");
    if (!device_status.success) {
      send_response({
        success: false,
        error: "failed to update device status",
      });
      return;
    }
    let status = JSON.parse(device_status.text);
    status.last_settings_sync = Date.now() / 1000;
    let upload_success = Database.upload_text(
      status_path,
      JSON.stringify(status),
    );
    if (!upload_success) {
      send_response({
        success: false,
        error: "failed to update device status",
      });
      return;
    }

    // return the device settings
    send_response({
      success: true,
      settings: JSON.parse(device_settings.text),
    });
  });
}
