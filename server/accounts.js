export const Accounts = {
  validate_credentials,
  get_account
}

// manage account credentials here
// each account has a username, password, and permissions
// "read" permission allows the user to view data - must be included
// "write" permission allows the user to edit settings - optional
const registered_credentials = [
  {
    username: "admin",
    password: "example",
    permissions: ["read", "write"]
  },
  {
    username: "guest",
    password: "example",
    permissions: ["read"]
  }
];

// validate the credentials in the registered_credentials array
function validate_credentials() {
  let accepted_permissions = ["read", "write"];
  for (let account of registered_credentials) {
    if (!account.username) {
      throw new Error("Username missing from account: " + JSON.stringify(account));
    }
    if (!account.password) {
      throw new Error("Password missing from account: " + JSON.stringify(account));
    }
    if (!account.permissions) {
      throw new Error("Permissions missing from account: " + JSON.stringify(account));
    }
    if (!account.permissions.includes("read")) {
      throw new Error("Account must at least require 'read' permissions: " + JSON.stringify(account));
    }
    for (let permission of account.permissions) {
      if (!accepted_permissions.includes(permission)) {
        throw new Error("Invalid permission: " + permission + " in account: " + JSON.stringify(account));
      }
    }
  }
  console.log("Validated " + registered_credentials.length + " accounts.");
}

// check if the username and password are valid, and returns the account if they are
function get_account(username, password) {
  for (let account of registered_credentials) {
    if (account.username == username && account.password == password) {
      return account;
    }
  }
  return null;
}
