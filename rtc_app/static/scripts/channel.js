socket.on("setup_channel", data => {
  console.log(data);

  // Update the userInConnections object
  connection = "connection-" + data["connection"];
  window.usersInConnection[connection].push({
    "userName": data["other_name"],
    "userRole": data["other_role"],
    "userId": data["other_id"]
  });

  window.updateUsersUI();
});

socket.on("release_channel", data => {
  // console.log(data);

  // Update the userInConnections object
  [].filter
  connection = "connection-" + data["connection"];
  window.usersInConnection[connection] = window.usersInConnection[connection].filter(user => {
    return user["userId"] !== data["other_id"];
  })

  window.updateUsersUI();
});