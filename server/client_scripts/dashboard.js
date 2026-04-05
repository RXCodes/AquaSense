// called when user requests analytical data for the dashboard
function fetch_data() {
  return fetch("/fetch_data", {
    method: "POST",
    body: JSON.stringify({
      device_id: DEVICE_ID,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
}

// called when user requests to see device status
function fetch_status() {
  return fetch("/get_device_status", {
    method: "POST",
    body: JSON.stringify({
      device_id: DEVICE_ID,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
}

// API call when user requests device settings
function fetch_settings(device_id) {
  return fetch("/get_settings", {
    method: "POST",
    body: JSON.stringify({
      device_id: device_id,
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
}

var data_canvas = document.getElementById("records-chart");
var data_last_updated = document.getElementById("data-last-updated");
var data_status_indicator = document.getElementById("data-status-indicator");
var date_start_input = document.getElementById("date-start");
var time_start_input = document.getElementById("time-start");
var date_end_input = document.getElementById("date-end");
var time_end_input = document.getElementById("time-end");
var refresh_btn = document.getElementById("refresh-btn");
var data_chart = null;
var SELECTED_START_TIME = 0;
var SELECTED_END_TIME = Date.now() / 1000;
var cached_datapoints = [];
var last_updated_time;

// format a Date object as YYYY-MM-DD for date inputs
function format_date_for_input(date) {
  let y = date.getFullYear();
  let m = String(date.getMonth() + 1).padStart(2, "0");
  let d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// initialize date pickers: end = today 23:59, start = 14 days ago 00:00
function init_date_pickers() {
  let now = new Date();
  let thirty_days_ago = new Date(now);
  thirty_days_ago.setDate(now.getDate() - 14);

  date_start_input.value = format_date_for_input(thirty_days_ago);
  time_start_input.value = "00:00";
  date_end_input.value = format_date_for_input(now);
  time_end_input.value = "23:59";

  thirty_days_ago.setHours(0, 0, 0, 0);
  SELECTED_START_TIME = thirty_days_ago.getTime() / 1000;

  now.setHours(23, 59, 59, 999);
  SELECTED_END_TIME = now.getTime() / 1000;
}

// called when the user clicks Apply on the date range
function apply_date_range() {
  let start_date_val = date_start_input.value;
  let end_date_val = date_end_input.value;

  if (!start_date_val || !end_date_val) {
    show_alert("Please select both a start and end date.", "error");
    return;
  }

  let start_time_val = time_start_input.value || "00:00";
  let end_time_val = time_end_input.value || "23:59";

  let start_date = new Date(`${start_date_val}T${start_time_val}:00`);
  let end_date = new Date(`${end_date_val}T${end_time_val}:00`);

  if (isNaN(start_date.getTime()) || isNaN(end_date.getTime())) {
    show_alert("Invalid date or time value.", "error");
    return;
  }

  if (start_date >= end_date) {
    show_alert("Start time must be before end time.", "error");
    return;
  }

  SELECTED_START_TIME = start_date.getTime() / 1000;
  SELECTED_END_TIME = end_date.getTime() / 1000;

  render_chart(cached_datapoints);
}

function get_time_ago_string(last_updated) {
  let time_ago = Date.now() / 1000 - last_updated;
  let time_ago_string = "";
  if (time_ago < 60) {
    let seconds = Math.floor(time_ago);
    if (seconds == 1) {
      time_ago_string = "1 second ago";
    } else {
      time_ago_string = seconds + " seconds ago";
    }
  } else if (time_ago < 3600) {
    let minutes = Math.floor(time_ago / 60);
    if (minutes == 1) {
      time_ago_string = "1 minute ago";
    } else {
      time_ago_string = minutes + " minutes ago";
    }
  } else if (time_ago < 86400) {
    let hours = Math.floor(time_ago / 3600);
    if (hours == 1) {
      time_ago_string = "1 hour ago";
    } else {
      time_ago_string = hours + " hours ago";
    }
  } else {
    let days = Math.floor(time_ago / 86400);
    if (days == 1) {
      time_ago_string = "1 day ago";
    } else {
      time_ago_string = days + " days ago";
    }
  }
  return time_ago_string;
}

function render_chart(datapoints) {
  // destroy any existing chart before creating a new one
  if (data_chart) {
    data_chart.destroy();
    data_chart = null;
  }

  // get all keys from the datapoints
  let keys = new Set();
  for (let i = 0; i < datapoints.length; i++) {
    keys.add(datapoints[i].type);
  }

  var start_time = SELECTED_START_TIME;
  var end_time = SELECTED_END_TIME;
  let filtered_data = get_data(datapoints, start_time, end_time);
  var no_data_message = document.getElementById("no-data-message");
  if (filtered_data.length == 0) {
    no_data_message.style.display = "block";
    return;
  } else {
    no_data_message.style.display = "none";
  }

  let prepared_data = prepare_data(filtered_data);

  // create a dataset for each key
  var datasets = [];
  for (let key of keys) {
    if (!prepared_data[key]) continue;
    let dataset = {
      label: key,
      fill: false,
      data: prepared_data[key],
    };
    datasets.push(dataset);
  }

  // create the labels for the graph
  var dates = [];
  for (let i = 0; i < 10; i++) {
    let time = start_time + ((end_time - start_time) * i) / 10;
    dates.push(new Date(time * 1000));
  }

  // prepare the graph
  const config = {
    type: "line",
    data: {
      labels: dates,
      datasets: datasets,
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          text: "Recorded Data",
          display: true,
        },
      },
      scales: {
        x: {
          type: "time",
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "value",
          },
        },
      },
      elements: {
        point: {
          hitRadius: 10,
        },
      },
    },
  };

  data_chart = new Chart(data_canvas, config);
}

function add_data_to_chart(datapoints) {
  // add the new datapoints to the chart
  for (let i = 0; i < datapoints.length; i++) {
    let datapoint = datapoints[i];
    let dataset = data_chart.data.datasets.find(
      (dataset) => dataset.label === datapoint.type,
    );
    if (dataset) {
      dataset.data.push({
        x: new Date(datapoint.time * 1000),
        y: datapoint.value,
      });
    }
  }
  data_chart.update();
}

function refresh_button_clicked() {
  refresh_btn.style.opacity = 0.5;
  refresh_btn.innerHTML = "Refreshing...";
  refresh_data();
}

async function refresh_data() {
  // fetch data from the server
  refresh_btn.disabled = true;
  let response = await fetch_data();
  response = await response.json();
  if (!response.success) {
    refresh_btn.disabled = false;
    refresh_btn.innerHTML = "Refresh";
    show_alert(response.error || "Failed to fetch data", "error");
    return;
  }
  cached_datapoints = response.data.points;

  // update the last updated time
  data_last_updated.innerHTML =
    "Last updated " + get_time_ago_string(response.last_updated);
  let delta_time = Date.now() / 1000 - response.last_updated;

  // if the device was inactive for more than an hour, set the indicator to red
  if (delta_time > 60 * 60) {
    data_status_indicator.style.fill = "#ff5050ff";
  } else {
    data_status_indicator.style.fill = "#00bb78ff";
  }

  // update the datapoint count
  document.getElementById("datapoint-count").innerHTML = response.data.points.length + " Total Datapoints";

  // calculate uptime in last 24 hours using 30 minute intervals
  let times = {};
  for (let i = 0; i < response.data.points.length; i++) {
    let datapoint = response.data.points[i];
    if (datapoint.time > Date.now() / 1000 - (24 * 60 * 60)) {
      let time = Math.floor(datapoint.time / (30 * 60));
      times[time] = true;
    }
  }
  let uptime = Math.min((Object.keys(times).length / (24 * 2)) * 100, 100);
  let uptime_element = document.getElementById("data-24hr-uptime");
  uptime_element.innerHTML = uptime.toFixed(2) + "% Uptime in Last 24hr";

  // change color of the uptime indicator based on the uptime
  var color = "#00bb78";
  if (uptime < 50) {
    color = "#ff5050";
  } else if (uptime < 80) {
    color = "#ffaa00";
  }
  uptime_element.style.outline = "1.5px solid " + color;
  uptime_element.style.background = color + "30";
  uptime_element.style.color = color + "ff";
  
  // render the chart and enable the refresh button
  refresh_btn.style.opacity = 1.0;
  refresh_btn.disabled = false;
  refresh_btn.innerHTML = "Refresh";

  if (data_chart) {
    // if chart already exists, add the new data to it
    // only include points that are newer than the last updated time
    let new_datapoints = cached_datapoints.filter(
      (datapoint) => datapoint.time > last_updated_time,
    );
    add_data_to_chart(new_datapoints);
  } else {
    render_chart(cached_datapoints);
  }
  last_updated_time = response.last_updated;
}

function download(filename, textInput) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8, " + encodeURIComponent(textInput),
  );
  element.setAttribute("download", filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function export_data() {
  // get file type and time representation
  let file_type = document.getElementById("export-type").value;
  let time_representation = document.getElementById(
    "export-time-representation",
  ).value;

  // check if there is any data to export
  if (cached_datapoints.length == 0) {
    show_alert("No data to export.", "error");
    return;
  }

  // deep copy cached datapoints so it doesn't get mutated in this method
  let cached_datapoints_copy = JSON.parse(JSON.stringify(cached_datapoints));

  // filter out data points based on selected time
  let filtered_data = get_data(
    cached_datapoints_copy,
    SELECTED_START_TIME,
    SELECTED_END_TIME,
  );

  // check if there is any data to export based on the selected time range
  if (filtered_data.length == 0) {
    show_alert("No data points to export.", "error");
    return;
  }

  // sort the data by time
  filtered_data.sort((a, b) => a.time - b.time);

  // if time representation is relative, convert the time to relative to the first point's time
  if (time_representation == "relative") {
    let first_time = filtered_data[0].time;
    for (let i = 0; i < filtered_data.length; i++) {
      filtered_data[i].time = filtered_data[i].time - first_time;
    }
  }

  // refer to the chart to see which datasets are hidden
  const visible = [];
  data_chart.data.datasets.forEach((dataset, index) => {
    if (data_chart.isDatasetVisible(index)) {
      visible.push(dataset.label);
    }
  });

  // filter out data points that are not in the visible datasets
  filtered_data = filtered_data.filter((point) => visible.includes(point.type));

  // export the data as a CSV file
  if (file_type == "csv") {
    let csv = "time,value,type\n";
    for (let i = 0; i < filtered_data.length; i++) {
      let point = filtered_data[i];
      csv += point.time + "," + point.value + "," + point.type + "\n";
    }
    download("data.csv", csv);
  }

  // export the data as a JSON file
  if (file_type == "json") {
    let json = JSON.stringify(filtered_data);
    download("data.json", json);
  }
}

async function start() {
  // initialize date pickers with defaults
  init_date_pickers();

  // check if a device is selected
  if (!DEVICE_ID) {
    close_function = function () {
      window.location.href = "/devices";
    };
    show_alert("Please select a device first.", "error");
    return;
  }

  // fetch settings for the device
  var device_settings = await fetch_settings(DEVICE_ID);
  device_settings = await device_settings.json();
  if (!device_settings.success) {
    show_alert(
      device_settings.error || "Failed to fetch device settings",
      "error",
    );
    close_function = function () {
      window.location.href = "/devices";
    };
    return;
  }
  device_settings = device_settings.settings;

  // set device name
  document.getElementById("device-display-name").innerHTML =
    device_settings.name +
    " <span class='label' id='device-id' style='opacity:0.7'>(" +
    DEVICE_ID +
    ")</span>";

  // check device status
  var device_status = await fetch_status();
  device_status = await device_status.json();
  if (!device_status.success) {
    close_function = function () {
      window.location.href = "/devices";
    };
    show_alert("Failed to fetch device status: " + device_status.error, "error");
    return;
  }
  if (device_status.success && !device_status.registered) {
    close_function = function () {
      window.location.href = "/devices";
    };
    show_alert("Device not found. Please select a device.", "error");
    return;
  }

  // fetch data for the dashboard
  refresh_data();

  // set refresh interval based on settings
  let refresh_interval_minutes = device_settings.refresh_interval || 5;
  setInterval(refresh_data, refresh_interval_minutes * 60 * 1000);
}
start();
