// API call to delete a device
function delete_device(device_id, username, password) {
  return fetch("/remove_device", {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
      device_id: device_id
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// API call when user requests to update device settings
function fetch_data(settings) {
  return fetch("/edit_settings", {
    method: "POST",
    body: JSON.stringify({
      settings: settings,
      device_id: DEVICE_ID
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// API call to clear data for a device
function clear_device_data(device_id, username, password) {
  return fetch("/clear_device_data", {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
      device_id: device_id
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// API call to clear local data for a device
function clear_local_storage(device_id, username, password) {
  return fetch("/clear_device_local_storage", {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
      device_id: device_id
    }),
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    }
  });
}

// modal view for when the user wants to perform a dangerous action
// requires username and password for authorization
var overlay = document.getElementById('confirmModal');
var modal_title = document.getElementById('modalTitle');
var modal_description = document.getElementById('modalDescription');
var username_input = document.getElementById('modalUsername');
var password_input = document.getElementById('modalPassword');
var cancel_button = document.getElementById('modalCancel');
var confirm_button = document.getElementById('modalConfirm');
var pending_action = null;
var submitting = false;

var modal_actions = {
  'button-clear-local-storage': {
    title: 'Clear Local Storage',
    description: 'This will permanently clear the local storage of the device. Enter your username and password to confirm.'
  },
  'button-clear-site-analytics': {
    title: 'Clear Site Analytics',
    description: 'This will permanently wipe all data recorded for the device. Enter your username and password to confirm.'
  },
  'button-remove-device': {
    title: 'Remove Device',
    description: 'This will permanently remove the device and all associated data. Enter your username and password to confirm.'
  }
};

function open_modal(actionId) {
  var config = modal_actions[actionId];
  if (!config) return;
  pending_action = actionId;
  modal_title.textContent = config.title;
  modal_description.textContent = config.description;
  username_input.value = '';
  password_input.value = '';
  overlay.classList.add('active');
}

function close_modal() {
  if (submitting) {
    return;
  }
  overlay.classList.remove('active');
  pending_action = null;
}

async function confirm() {
  if (submitting) {
    return;
  }
  var username = username_input.value.trim();
  var password = password_input.value;
  if (!username || !password) {
    show_alert("Please enter both username and password", "error");
    return;
  }
  confirm_button.style.opacity = 0.75;
  submitting = true;

  // user wants to remove the device
  if (pending_action == "button-remove-device") {
    var response = await delete_device(DEVICE_ID, username, password);
    response = await response.json();
    if (response.success) {
      show_alert("Device removed successfully", "success");

      // when the alert is closed, redirect to the devices page
      close_function = function() {
        window.location.href = "/devices";
      };
    } else {
      show_alert(response.error || "Failed to remove device", "error");
    }
  }

  // user wants to clear data for the device
  if (pending_action == "button-clear-site-analytics") {
    var response = await clear_device_data(DEVICE_ID, username, password);
    response = await response.json();
    if (response.success) {
      show_alert("Device data cleared successfully", "success");
    } else {
      show_alert(response.error || "Failed to clear device data", "error");
    }
    submitting = false;
    confirm_button.style.opacity = 1.0;
    close_modal();
  }

  // user wants to clear local storage for the device
  if (pending_action == "button-clear-local-storage") {
    var response = await clear_local_storage(DEVICE_ID, username, password);
    response = await response.json();
    if (response.success) {
      show_alert("Requested local storage to be cleared", "success");
    } else {
      show_alert(response.error || "Failed to clear local storage", "error");
    }
    submitting = false;
    confirm_button.style.opacity = 1.0;
    close_modal();
  }
}

var danger_buttons = document.querySelectorAll('[id="button-clear-local-storage"], [id="button-clear-site-analytics"], [id="button-remove-device"]');
danger_buttons.forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    open_modal(btn.getAttribute('id'));
  });
});

cancel_button.addEventListener('click', close_modal);

overlay.addEventListener('click', function(e) {
  if (e.target === overlay) close_modal();
});

confirm_button.addEventListener('click', confirm);