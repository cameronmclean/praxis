addon.port.emit("ping");

addon.port.on("pong", function() {
  console.log("sidebar script got the reply");
});