// called when user requests a new device id after entering a device name
function request_new_device_id(device_name) {
  return fetch("/request_new_device_id", {
    method: "POST",
    body: JSON.stringify({
      name: device_name
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// called when user requests a device status update
function get_device_status(device_id) {
  return fetch("/get_device_status", {
    method: "POST",
    body: JSON.stringify({
      device_id: device_id
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// called when user clicks the start pairing button
var pairing_started = false;
async function start_pairing() {
  if (pairing_started) {
    return;
  }

  // validate the device name
  var nameInput = document.getElementById("device-name");
  var name = nameInput.value.trim();
  if (name.length < 3 || name.length > 20) {
    show_alert("Device name must be between 3 and 20 characters.", "error");
    nameInput.style.outline = "2px solid red"
    return;
  }

  // start the pairing process
  pairing_started = true;
  nameInput.style.outline = "";
  let pair_button = document.getElementById("start-pairing-btn");
  pair_button.style.opacity = 0.75;
  pair_button.innerHTML = "Requesting...";
  
  // ask the server to generate a new device id
  nameInput.style.outline = "2px solid #00bb78"
  var response = await request_new_device_id(name);
  response = await response.json();
  if (!response.success) {
    nameInput.style.outline = "";
    show_alert("Server Error: " + response.error, "error");
    pair_button.innerHTML = "Pair Device";
    pair_button.style.opacity = 1.0;
    pairing_started = false;
    return;
  }

  // go to the next section and show the device id
  let device_id = response.device_id;
  set_device_id(device_id);
  set_device_status("Waiting for device...", "white");
  document.getElementById("name-section").classList.add("hidden");
  document.getElementById("pairing-section").classList.remove("hidden");

  // start polling for the device to be registered - checks every 5 seconds
  let poll_timer = setInterval(async () => {
    let status = await get_device_status(device_id);
    status = await status.json();
    if (!status.success) {
      set_device_status("Connection error. Check internet connection.", "red");
      return;
    }
    if (status.registered) {
      clearInterval(poll_timer);
      set_device_status("Device registered successfully!", "#00bb78");
      document.getElementById("go-dashboard-btn").classList.remove("hidden");
    } else {
      set_device_status("Waiting for device...", "white");
    }
  }, 5000);
}

function set_device_id(id) {
  document.getElementById("device-id-display").textContent = id;
}

function set_device_status(status, color) {
  document.getElementById("device-status").textContent = status;
  document.getElementById("device-status").style.color = color;
}

function go_to_dashboard() {
  set_cookie("device_id", document.getElementById("device-id-display").textContent);
  window.location.href = "/dashboard";
}