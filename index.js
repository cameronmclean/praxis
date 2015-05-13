
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var { Toolbar } = require("sdk/ui/toolbar");
var { Frame } = require("sdk/ui/frame");
var self = require("sdk/self");
var windows = require("sdk/windows").browserWindows;
var panel = require("sdk/panel").Panel({
  contentURL: require("sdk/self").data.url("panel.html"),
  contentScriptFile: [self.data.url("jquery-1.11.3.min.js"), self.data.url("panel.js")],
  width: 600,
  height: 600
});

var plist = {"list":[{"name":"Biophotonic Imaging","id":1},{"name":"Pigment Extraction","id":2}]};
//get the list of pattern names and id from labpatterns.org, seve them to later send to the toolbarframe.
var Request = require("sdk/request").Request;
var listofpatterns = {};
var poptions = Request({
  url: "http://labpatterns.org/patternlist",
  onComplete: function (response) {
    console.log(response.json);
    plist = response.json;//send pattern list to toolbar frame
  //  console.log("plist "+plist['list']);
  }
});
poptions.get();


var selectedPattern = "No pattern selected";

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
    panel.show();
    console.log(selectionText["where"]);
    console.log(selectionText["anno"]);
    console.log(selectionText["title"]);
    panel.port.emit("payload", selectionText);
    panel.port.emit("pselected", selectedPattern);
  }
});

var button = buttons.ActionButton({
  id: "Labpatterns-link",
  label: "Visit Labpatterns.org",
  icon: {
   // "16": "./desktop-icon-16.png",
   // "32": "./home-icon32.png",
    "48": "./home-icon48.png"
  },
  onClick: handleClick
});

var frame = new Frame({
  url: "./toolbar.html",
  onMessage: (e) => {
    selectedPattern = e.data;
    console.log("pattern changed to "+e.data);
  }
});

var toolbar = Toolbar({
  title: "Praxis",
  items: [button, frame]
});

frame.on('load', function(){
  console.log('yo');
  console.log(frame.url);
  frame.postMessage(plist, frame.url);
});
//console.log(frame.url);

function handleClick(state) {
  tabs.open("http://labpatterns.org/");
}




