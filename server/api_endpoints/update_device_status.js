import { PathLock } from "../path_lock.js";
import { Database } from "../database.js";

export function initialize(app) {
  app.post("/update_device_status", async (req, res) => {
    // check if the request has a valid device token
    if (!Authorization.request_has_sensor_device_authorization(req)) {
      res.send({ success: false, error: "unauthorized" });
    }

    // get the device id from the request
    let device_id = Authorization.get_device_id_from_request(req);
    var device_status = req.body.info;
    if (!device_status) {
      res.send({ success: false, error: "missing info" });
      return;
    }

    // lock the path to prevent concurrent writes
    await PathLock.lock_paths(["devices/" + device_id + "/data.json"]);

    // update the device status in the database
    if (device_status.constructor != Object) {
      device_status = {};
    }
    device_status.last_updated = Date.now() / 1000;
    let path = "devices/" + device_id + "/device_status.json";
    await Database.upload_text(path, JSON.stringify(device_status));
    PathLock.unlock_paths(["devices/" + device_id + "/data.json"]);
    res.send({ success: true });
  });
}
