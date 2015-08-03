//addon.port.emit("ping");

addon.port.on("page", function(urlToView) {
  $('#url').html(urlToView);
});