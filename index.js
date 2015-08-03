
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
    //we only load the toolbar after getting a list of patterns to populate the menu
    var toolbar = Toolbar({
      title: "Praxis",
      items: [button, buttonView, frame]
    });
    
    plist = response.json;//save to plist, later to send to toolbar frame.on('load')
    
    //once the toobar frame has loaded, populate the pattern options dropdown
    frame.on('load', function(){
      frame.postMessage(plist, frame.url);
    });
  }
});

poptions.get();


var selectedPattern = {"id":0, "name": "No pattern selected"}; //set inital pattern to blank 

var contextMenu = require("sdk/context-menu");

//var payload = {};

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
    // get the currently selected pattern force info
    if (selectedPattern['id'] != 0) foptions.get();

 
    

  }
});






var button = buttons.ActionButton({
  id: "Labpatterns-link",
  label: "Visit Labpatterns.org",
  icon: {
    "48": "./Science-icon.png"
  },
  onClick: handleClick
});

var buttonView = buttons.ActionButton({
  id: "buttonView",
  label: "View exemplars for this page",
  icon: {
    "48": "./tag.png"
  },
  onClick: handleClickViewer
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


//create the sidebar for viewing annotations
var workerArray = [];

function attachWorker(worker) {
  workerArray.push(worker);
}

function detachWorker(worker) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}
var sidebar = require('sdk/ui/sidebar').Sidebar({
  id: 'exemplar-viewer',
  title: 'Exemplars',
  url: require("sdk/self").data.url("sidebar.html"),
  onAttach: attachWorker,
  onDetach: detachWorker
});



function handleClickViewer(state) {
  // for now open tab - then figure out how to create sidebar
  sidebar.show();
}









//rando placement of listen
//listen for submitting annotation form data back
  panel.port.on("data-entered", function(fdata){
   // console.log("data sent back from panel");
   // console.log(fdata.length);
    // for (var i in fdata) {
    // console.log(fdata[i]);   
    // }

     //wrangle all the data into a json for posting to /labpatterns/update
    var annoData = {};
    //move fdata from list into object
    for (var i = 0; i < fdata.length; i++) {
      annoData[fdata[i]['name']] = fdata[i]['value']
    }

    if (userOrcid === "Invalid ORCID" || selectedPattern['id'] === 0){ //check the user has entered an ORCID and selected a pattern
    //  console.log("sending alert");
      panel.port.emit('incomplete', null);
    } else { // if all good, wrangle and post the data. 

    annoData['creatorORCID'] = "http://orcid.org/"+userOrcid;
    annoData['concernsPattern'] = "http://labpatterns.org/id/pattern/"+selectedPattern["id"]; 
    
   // console.log(payload['where']);
    // console.log(annoData);
    // var whatever = JSON.parse(annoData);
    // console.log(wahtever)
    // var sendTheData = Request({
    //   url: "http://127.0.0.1:8080/annotate",
    //   content: annoData
    //   // onComplete: function(){
    //   //   var message = "Hi Mum!"
    //   //   panel.port.emit('post', message);
    //   //   //console.log(response);
      
    // });
    Request({
       url: "http://labpatterns.org/annotate",
       contentType: "application/json",
       content: JSON.stringify(annoData),
        onComplete: function(response){
       //   var message = "Hi Mum!"
       //   panel.port.emit('post', message);
         // console.log(response.text);
        }
     }).post();

    // sendTheData.post();

    panel.hide();

  }

  });



