import { Authorization } from "../authorization.js"

export function initialize(app) {
  app.post("/fetch_data", async (req, res) => {
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

    // get start_date and end_date from the request
    let start_date = req.body.start_date;
    let end_date = req.body.end_date;
    if (!start_date || !end_date) {
      res.send({"success": false, "error": "missing start date or end date"});
      return;
    }

    // fetch the data from the database
    let path = "devices/" + device_id + "/data.json";
    var data = await Database.read_text(path, "{}");
    if (!data.success) {
      res.send({"success": false, "error": "failed to fetch data"});
      return;
    }

    // TODO: filter the data by date
    data = JSON.parse(data.text);
    var filtered_data = [];
    
    
    res.send({"success": true, "last_updated": data.last_updated, "data": filtered_data});
  });
}