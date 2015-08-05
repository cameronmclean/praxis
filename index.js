
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
    "48": "./highlighter.png"
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
var urlToView = "";
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
  onDetach: detachWorker,
  onReady: function (worker) {
    //urlToView = window.location.href;
    urlToView = tabs.activeTab.url;
    worker.port.emit("page", urlToView);
    var query = "SELECT DISTINCT ?ex ?pattern ?patternTitle ?patternPic ?forceTitle ?forcePic ?eXdetail ?eXcomment ?orcid WHERE { ?ex <http://purl.org/NET/exemplr#hasTargetURL> <"+urlToView+"> . ?ex <http://purl.org/NET/exemplr#concernsPattern> ?pattern . ?pattern <http://schema.org/name> ?patternTitle . ?pattern <http://xmlns.com/foaf/0.1/depiction> ?patternPic . ?ex <http://purl.org/NET/exemplr#concernsForce> ?force . ?force <http://xmlns.com/foaf/0.1/depiction> ?forcePic . ?force <http://schema.org/name> ?forceTitle . ?ex <http://purl.org/NET/exemplr#hasTargetDetail> ?eXdetail . ?ex <http://purl.org/NET/exemplr#hasComment> ?eXcomment . ?ex <http://purl.org/NET/exemplr#creatorORCID> ?orcid . }";
    //var query = "SELECT ?ex WHERE { ?ex <http://purl.org/NET/exemplr#creatorORCID> <http://orcid.org/0000-0002-9836-3824> . }";
    var sparql = encodeURIComponent(query);

    worker.port.on('highlight', function(words){
     var shortword = "" 
     if (words.length >20 ) { shortword = words.slice(0,20); } else { shortword = words; }
     // var newworker = tabs.activeTab.attach({
     // require("sdk/tabs").activeTab.attach({
      tabs.activeTab.attach({     
      //THE below kinda works, but doesnt navigate to any found text. The window.find() is less good due to direction, but focuses on the relevant text...
     // contentScriptFile: [self.data.url('jquery-1.11.3.min.js'), self.data.url('highlight.js'), self.data.url('matchit.js')]
     // });
     // contentScriptFile: [self.data.url('jquery-1.11.3.min.js'), self.data.url('matchit.js')]
     // });
     // newworker.port.emit('bo_selecta', words);
      //contentScript: "var goTop = function(callback) { scroll(0, 0); callback(); }; var goFetch = function() { window.find('"+shortword+"'); }; goTop(goFetch);"
        contentScript: "if (!window.find('"+shortword+"')) { window.find('"+shortword+"',0,1); }" 
      });
    });

    //form the request
    var getEx = Request({
      url: 'http://labpatterns.org/sparql/?query='+sparql,
      headers: { Accept: "application/sparql-results+json" },
   // content: sparql,
      onComplete: function(res) {
        //console.log("QUERY = "+sparql+"   ");
        console.log(res.text);
        var exList = res.json;
        var results = exList.results;
        worker.port.emit('data', results);
      }
    });
    //do the request

    getEx.get();
    }
});



function handleClickViewer(state) {
  //get current window URL - save in global var
//  urlToView = window.content.location.href;
//  alert(urlToView);
  //send to sidebar
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



