praxis notebook
===============

#####20150504
First stab at firefox add-on. The idea being to create a simple extension that can grab highlighted elements from the window DOM, and via the context menu match to pattern forces, and send the links made as small JSON-LD/RDF to a pattern exemplification store. This can then be offered as a SPARQL endpoint for querying over all the captured pattern examples.

First step was to install jpm
https://www.npmjs.com/package/jpm
`sudo npm install jpm -g`

Then to install the v38 beta version of firefox (currenty in Desktop/beta/).

Created new git repo to house the add-on development. Decided to call it praxis. cute.
then cd to praxis/ and `jpm init`

followed basix tut https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting\_Started_%28jpm%29 just to see if things are working ..
and... yes! after a bit of fiddling. for it to work, must specify the binary location with -b like so...
`jpm -b /Users/cameronmclean/Desktop/beta/Firefox.app run`
Sweeeeet.
Now to mess with context menus and see if I can pull in a list of patterns from the labpatterns.org/patternlist resource...
Not sure yet, but I think I can use any npm package just as for node.js/hyperPatterns by `npm install xyx --save` and this will get packaged with the add on (and presumably browserified type thing?)

So anyway, before I get too carried aways, next to define the minimal/simple requirements that this add-on should provide.. Then think of the best way to implement it.

Also, for this project, perhaps try https://github.com/SublimeLinter/SublimeLinter-for-ST2 and think about writing tests as I go for important things...
https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Unit_testing
https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level\_APIs/test_assert

####20150512
Rigggght. So had a bit of a play with annotatorJS http://annotatorjs.org/ and the MDN annoate tutorial https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Annotator.
Both are kinda clunky and dont work out of the box for what I want to do.
Will attempt to build a lightweight annotator from scratch using firefox addon SDK, jQuery, CSS, HTML.
The annotator can probably work by creating an "annotate this" option when hihglightable DOM elements are selected.

OK - tricky, but I think I can move data between the context click and a panel via postMessage
https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts#The_postMessage_API
ports are better, but not supported with context-menu
so the gist - we listen for on click/selection, grab the highlighted text, URL etc, and send it back to our app code via onMessage (json).

Once back in the app (well, onMessage callback for the context event), we can fire up a panel and communicate via the port API - using named port.on, port.emit. 
https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts/using_port
NOTE - as always these functions are asynchronous, so we need to use promisies etc to sync it all up and talk to a third party server.

we can also send data to and from the frame/toolbar with window.postMessage 
https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/ui_frame

Perhaps one workflow, would be for the user to add ORCID, and select a pattern from the toolbar.
Then on context click, grab that, and send the toobar options and selction to the panel for further wrangling/exemplyifing.
Then send it all back to the app, and then POST it off to a service that accepts the graph.
This service could exist as another endpoint in the labpatterns.org domain, 

sooooo also need to get the app.js vs the content.js scripts worked out and talking properly, find a reliable way to sync them all. and then find a way to POST the wrangeled payload to an arbitary endpoint.
Also, define clearly what an exemplification graph should contain.
Write all the logic, boot up an example endpoint, show how it could be wrestled to a SPARQL endpoint, or capture the data in a badge, and show a page with badges and URLs that have earnt them.

also - do I need to add labels to my JSON-LD to make them SPARQL friendly?

current status with the addon anyhoo is that we grab the context, pass it async style to a panel wich for now is just an alert. need to package a proper contentScriptFile for the panel with HTML/CSS/jQuery to make it look pretty, allow the user to add details and send it back as JSON to the app.
The app can then presumably do the final wrangling and POSTing to abritary endpoints. 

#####201050513

Got message from context click passed to panel via the following

```
onMessage: function (selectionText) {
    var activeWindowTitle = windows.activeWindow.title;
    selectionText["title"] = activeWindowTitle;
    panel.show();
    console.log(selectionText["where"]);
    console.log(selectionText["anno"]);
    console.log(selectionText["title"]);
    panel.port.emit("payload", selectionText);
  }
```

we grab the selection and a few other page details, call panel.show() where our panel is previously described thusly
```
var panel = require("sdk/panel").Panel({
  contentURL: require("sdk/self").data.url("panel.html"),
  contentScriptFile: [self.data.url("jquery-1.11.3.min.js"), self.data.url("panel.js")]
});
```
(we have the html for the panel, and load jQuery and content scripts in that order to intereact with the panel)
the panel.js listens for an event called 'payload'

panel.js
```
self.port.on('payload', function(payload){
  //alert(payload['anno'])
  $('#text').append(payload["anno"]);
});
```
and when it sees the event it appends the text to a <h1 id='text'>

back in the onMessage from the context click, we then message the panel.js as shown
`panel.port.emit("payload", selectionText);`

OK - also got the add-on talking to the frame. Bit of a PITA, but ended up doing this.
Asynchronously, we grab the patternlist from labpatterns.org/patternlist at add-on load and store JSON.
We define the frame that is to be added to the toolbar, and specificy in
1) in frame (plain web toolbar.js) to listen for messages via window.addEventListener
```
window.addEventListener("message", loadplist, false);

function loadplist(message) {
	var items = message.data;
 	for (var i = 0; i < items['list'].length; i++){
		$("#pattern-selector").append('<option value="'+items["list"][i]["id"]+'">'+items["list"][i]["name"]+'</option>');					
	}
}
```
then 
(2) we specify later in the add-on that on event frame.on('load') (i.e frame is completely loaded),send the json of current design patterns to popoulate the dropdown
```
frame.on('load', function(){
  frame.postMessage(plist, frame.url);
}); 
```
we send messages (json) back from the frame 
1) specify in the frame.js 
```
var patternSelector = window.document.getElementById("pattern-selector");
patternSelector.addEventListener("change", patternChanged);

function patternChanged() {
  window.parent.postMessage(patternSelector.value, "*");
}
```

and in the add-on.js to listen for messages
2)
```
var frame = new Frame({
  url: "./toolbar.html",
  
  // onMessage: (e) => {
  //   selectedPattern["id"] = e.data; 
  onMessage: function(e){
    if (e.data === "null"){
      selectedPattern['name'] = "No pattern selected";
    }
    selectedPattern['id'] = e.data;
    for (var i = 0; i < plist['list'].length; i++){
     // console.log("looping");
      if (String(plist['list'][i]["id"]) === e.data){
     //   console.log('match');
        selectedPattern['name'] = plist['list'][i]['name'];
        break;
      }
    }
    console.log("pattern changed to "+selectedPattern['id']+" "+selectedPattern['name']);
  } 
});
```

Used some jQuery to detect keyup in toolbar frame orcid text input. if length of input = 19, we send the value back to add-on(index).js to send through to panel, keep track etc.
http://stackoverflow.com/questions/11184309/any-listener-for-input-type-text
http://stackoverflow.com/questions/6153047/detect-changed-input-text-box
were very helpful

#####20150514
Figured a way send currently selected pattern info to the panel window. Inside the onMessage section of the context click
```
  var finfo = {};
    var foptions = Request({
      url: "http://labpatterns.org/doc/pattern/"+selectedPattern["id"],
      onComplete: function(response, callback){
        finfo = response.json['force'];
        panel.port.emit("forces", finfo);
        console.log(finfo);
        }
    });

    foptions.get();
```
then we just have to listen for 'forces' in the panel content script
```
self.port.on('forces', function(forces){
  $('#forces').html(forces[1]['forceName']);  
});
```
NEXT - to actually grab all the forces and show them nicely.
and in a way that can be selected for inclusion in the annotation graph.

fortunately, because of my awesomness, the pattern info we get when populating the panel after an annotate context click is great.
I can use the force info directly to fetch <img> etc.
Used jQuery to dynamically populate the panel, placing images and checkboxes for each force.
note : need to clear the container div with and empty .html("") before iterating through forces, as forces are appened, and otherwise never removed from the force container 
<div>

ah. so now I cant get the pattern selection to populate the toolbar dropdown. I'm guessing because the get request is async, and not finishing in time before the frame.on('load')... FIXED for now by placing the frame.postMessage in the callback (onComplete) of the get pattern request. 

Hit by more crazy async gotchas.
Moved the declaration of the toolbar frame to after the get pattern list from labpatterns.org has completed. 
then once frame has loaded, postMessage with the pattern list.
Seems to work everytime now.... but we'll see.....
