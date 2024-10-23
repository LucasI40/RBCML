let selectedConnection = "";
window.usersInConnection = {};

const setupConnections = (data) => {
  setupUsersInConnection(data);
  const connectionsElem = document.getElementById("connections");
  connectionsElem.style.display = "block";

  data.forEach(connectionName => {
    const elem = document.createElement("span");
    elem.classList.add("connection");
    elem.id = "connection-" + connectionName;
    elem.textContent = connectionName;
    elem.onclick = () => { 
        changeConnection("connection-" + connectionName);
    }

    connectionsElem.appendChild(elem);
  });

  if (data.length > 0) {
    const firstConnection = document.getElementById("connection-" + data[0]);
    firstConnection.classList.add("selected");
    selectedConnection = "connection-" + data[0];
  }
};

const changeConnection = newSelectedConnection => {
  if (selectedConnection === newSelectedConnection) {
    return;
  }

  document.getElementById(selectedConnection).classList.toggle("selected");
  selectedConnection = newSelectedConnection;
  document.getElementById(selectedConnection).classList.toggle("selected");

  window.updateUsersUI();
}

const setupUsersInConnection = data => {
  data.forEach(connectionName => {
    usersInConnection["connection-" + connectionName] = [];
  })
}

window.updateUsersUI = () => {
  const usersElem = document.getElementById("users-list");
  usersElem.replaceChildren();

  window.usersInConnection[selectedConnection].forEach(user => {
    const nameElem = document.createElement("span");
    nameElem.classList.add("user-name");
    nameElem.textContent = user["userName"]

    const roleElem = document.createElement("span");
    roleElem.classList.add("user-role");
    roleElem.textContent = user["userRole"]

    usersElem.appendChild(nameElem);
    usersElem.appendChild(roleElem);
  });
}