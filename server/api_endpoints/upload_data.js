import { Authorization } from "../authorization.js";
import { Database } from "../database.js";
import { PathLock } from "../path_lock.js";
import { DeviceManager } from "../device_manager.js";

export function initialize(app) {
  app.post("/upload_data", async (req, res) => {
    if (!Authorization.request_has_sensor_device_authorization(req)) {
      res.send({ success: false, error: "unauthorized" });
      return;
    }

    // check if data is provided
    var new_data = req.body.data;
    if (!new_data) {
      res.send({ success: false, error: "missing data" });
      return;
    }

    // get the device id from the request
    let device_id = Authorization.get_device_id_from_request(req);

    // get device creation time
    let device = DeviceManager.get_device(device_id);
    let creation_time = device.creation_date;

    // lock the path to prevent concurrent writes
    await PathLock.lock_paths(["devices/" + device_id + "/data.json"]);
    function send_response(response) {
      PathLock.unlock_paths(["devices/" + device_id + "/data.json"]);
      res.send(response);
    }

    // get database path
    let path = "devices/" + device_id + "/data.json";
    var current_data = await Database.read_text(path, "{}");
    if (!current_data.success) {
      send_response({ success: false, error: "failed to read current data" });
      return;
    }

    // update the data
    try {
      current_data = JSON.parse(current_data.text);
      current_data.last_updated = Date.now() / 1000;
      if (!current_data.points) {
        current_data.points = [];
      }
      for (var i = 0; i < new_data.length; i++) {
        var new_point = new_data[i];

        // check if the data point is valid
        if (new_point.type == undefined) {
          send_response({
            success: false,
            error: "missing type from data point: " + JSON.stringify(new_point),
          });
          return;
        }
        if (new_point.value == undefined) {
          send_response({
            success: false,
            error:
              "missing value from data point: " + JSON.stringify(new_point),
          });
          return;
        }
        if (new_point.time == undefined) {
          send_response({
            success: false,
            error: "missing time from data point: " + JSON.stringify(new_point),
          });
          return;
        }

        // check if the data point is within the device's creation time
        if (new_point.time < creation_time) {
          send_response({
            success: false,
            error: "data point time is before device creation time",
          });
          return;
        }

        // add the data point to the database
        let data = {
          type: new_point.type,
          value: new_point.value,
          time: new_point.time,
          meta: new_point.meta || {},
          upload_time: Date.now() / 1000,
        };
        current_data.points.push(data);
      }
      let success = await Database.upload_text(
        path,
        JSON.stringify(current_data),
      );
      if (!success) {
        send_response({ success: false, error: "failed to update data" });
        return;
      }
      send_response({ success: true });
    } catch (e) {
      send_response({ success: false, error: "interal error: " + e });
      return;
    }
  });
}
