
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var { Toolbar } = require("sdk/ui/toolbar");
var { Frame } = require("sdk/ui/frame");
var self = require("sdk/self");
var windows = require("sdk/windows").browserWindows;

//construct our panel to be spawned after context click
var panel = require("sdk/panel").Panel({
  contentURL: require("sdk/self").data.url("panel.html"),
  contentScriptFile: [self.data.url("jquery-1.11.3.min.js"), self.data.url("panel.js")],
  width: 600,
  height: 600
});

var plist = {};
//get the list of pattern names and id from labpatterns.org, seve them to later send to the toolbarframe.
var Request = require("sdk/request").Request;
var listofpatterns = {};
var poptions = Request({
  url: "http://labpatterns.org/patternlist",
  onComplete: function (response) {
    //console.log(response.json);
    var toolbar = Toolbar({
  title: "Praxis",
  items: [button, frame]
  });
    plist = response.json;//save to plist, later to send to toolbar frame.on('load')
    // console.log(plist);
    // frame.postMessage(plist, frame.url);
    frame.on('load', function(){
      console.log(plist);
      frame.postMessage(plist, frame.url);
    });
  }
});

poptions.get();


var selectedPattern = {"id":0, "name": "No pattern selected"}; //set inital pattern to blank 

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
    // console.log(selectionText["where"]);
    // console.log(selectionText["anno"]);
    // console.log(selectionText["title"]);
    panel.port.emit("payload", selectionText);
    panel.port.emit("pselected", selectedPattern);
    panel.port.emit("orcid", userOrcid);
    var finfo = {};
    var foptions = Request({
      url: "http://labpatterns.org/doc/pattern/"+selectedPattern["id"],
      onComplete: function(response, callback){
        finfo = response.json['force'];
        panel.port.emit("forces", finfo);
       // console.log(finfo);
        }
    });

    foptions.get();

    // get the currently selected pattern force info

  }
});

var button = buttons.ActionButton({
  id: "Labpatterns-link",
  label: "Visit Labpatterns.org",
  icon: {
    "48": "./noun_13680.png"
  },
  onClick: handleClick
});

var userOrcid = "Invalid ORCID";

var frame = new Frame({
  url: "./toolbar.html",
  // we can get a message from orcid text input or pattern selector
  onMessage: function(e){
    if (e.data.length === 19){ //i,e if orcid
    //  console.log("19 detected setting orcid "+e.data);
      userOrcid = e.data;
    } else {
    //  console.log("null detected");
    if (e.data === "null"){
      selectedPattern['name'] = "No pattern selected";
    } else {
    selectedPattern['id'] = e.data;
    for (var i = 0; i < plist['list'].length; i++){
     // console.log("looping");
      if (String(plist['list'][i]["id"]) === e.data){
     //   console.log('match');
        selectedPattern['name'] = plist['list'][i]['name'];
        break;
      }
    }
    }
  }
  //  console.log("pattern changed to "+selectedPattern['id']+" "+selectedPattern['name']);
  } 
});

// var toolbar = Toolbar({
//   title: "Praxis",
//   items: [button, frame]
// });

// frame.on('load', function(){
//   console.log(plist);
//   frame.postMessage(plist, frame.url);
// });

function handleClick(state) {
  tabs.open("http://labpatterns.org/");
}




