// var self = require('sdk/self');

// // a dummy function, to show how tests work.
// // to see how to test this function, look at test/test-index.js
// function dummy(text, callback) {
//   callback(text);
// }

// exports.dummy = dummy;


//testing - trying to make the button load a toolbar - this will hold the pattern things..

var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var { Toolbar } = require("sdk/ui/toolbar");
//var { ToggleButton } = require("sdk/ui/button/toggle");
//var { Toolbar } = require("sdk/ui/toolbar");
var { Frame } = require("sdk/ui/frame");
var self = require("sdk/self");
var windows = require("sdk/windows").browserWindows;
var panel = require("sdk/panel").Panel({
  contentURL: require("sdk/self").data.url("myFile.html"),
  contentScript: "self.port.on('payload', function(payload){"+
     " alert(payload['anno'])});"
});

var annotationpayload = {};

var contextMenu = require("sdk/context-menu");

 var menuItem = contextMenu.Item({
  label: "Annotate this",
  image: self.data.url("Annotation_icon.png"),
  context: contextMenu.SelectionContext(), 
  contentScript: 'self.on("click", function () {' +
                '  var text = window.getSelection().toString();' +
                '  var whereami = window.location.href;'+
                '  var payload = {};'+
                '  payload["anno"] = text;'+
                '  payload["where"] = whereami;'+
                '  self.postMessage(payload)'+
                '});',
  onMessage: function (selectionText) {
    var activeWindowTitle = windows.activeWindow.title;
    selectionText["title"] = activeWindowTitle;
    //console.log(activeWindowTitle + selectionText);
    panel.show();
    console.log(selectionText["where"]);
    console.log(selectionText["anno"]);
    console.log(selectionText["title"]);
    panel.port.emit("payload", selectionText);
  }
});

var button = buttons.ActionButton({
  id: "Labpatterns-link",
  label: "Visit Labpatterns.org",
  icon: {
    "16": "./desktop-icon-16.png",
    "32": "./desktop-icon-32.png",
    "64": "./desktop-icon-48.png"
  },
  onClick: handleClick
});

var frame = new Frame({
  url: "./frame-praxis.html"
});

var toolbar = Toolbar({
  title: "Praxis",
  items: [button, frame]
});

function handleClick(state) {
  tabs.open("http://labpatterns.org/");
}


