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
and when it sees the event it appends the text to a `<h1 id='text'>`

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
I can use the force info directly to fetch `<img>` etc.
Used jQuery to dynamically populate the panel, placing images and checkboxes for each force.
note : need to clear the container div with and empty .html("") before iterating through forces, as forces are appened, and otherwise never removed from the force container 
`<div>`

ah. so now I cant get the pattern selection to populate the toolbar dropdown. I'm guessing because the get request is async, and not finishing in time before the frame.on('load')... FIXED for now by placing the frame.postMessage in the callback (onComplete) of the get pattern request. 

Hit by more crazy async gotchas.
Moved the declaration of the toolbar frame to after the get pattern list from labpatterns.org has completed. 
then once frame has loaded, postMessage with the pattern list.
Seems to work everytime now.... but we'll see.....

also, we cant seem to style any content in the add-on panel after context click except by writing inline in the html.
uh. Oh well. or it might be that just html to be inserted with jQuery in the content script needs to be specified inline....

#####20150515
OK thiking ahead.

I'll need to POST the annotation graph somewhere.
One idea - 
1)set up 4store on the labpatterns server - running as localhost
http://4store.org/
2) create a labpatterns.org/annotate POST route that can accept the annotaion, wrangle it, and POST it again to the localhost 4Store http SPARQL update.
3) create a reverse proxy at labpatterns.org/sparql that ferries requests to and from the 4store localhost/SPARQL
see http://stackoverflow.com/questions/10435407/proxy-with-express-js
``` eg
var request = require('request');
app.get('/', function(req,res) {
  //modify the url in any way you want
  var newurl = 'http://google.com/';
  request(newurl).pipe(res);
});
```
or 
```
app.use('/api', function(req, res) {
  var url = 'YOUR\_API\_BASE_URL'+ req.url;
  var r = null;
  if(req.method === 'POST') {
     r = request.post({uri: url, json: req.body});
  } else {
     r = request(url);
  }

  req.pipe(r).pipe(res);
});
```


4) serve a static web page from labpatterns.org/explore that uses the d3sparql to allow friendly/pretty exploration of pattern annotations
5) NOTE that this depends on having a clear and explict annotation model+vocab, and pattern model+vocab, plus clear example use cases of SPARQL queries that demo the utility of connecting info in this way (i.e epsitemological adequacy and pragmatic questions)

quick play with 4store on local machine suggests it's simple to install, create a db, add a graph from file in n3 format, spin up the SPARQL and it all works.

note will need to make sure 4Store retuns SPARQL results in a format that d3sparql can parse. I think this is doable by specifying output=JSON in the SPARQL query or as accept type in the http header.
http://4store.org/trac/ticket/5 
NOTE: YES - use accecpt: application/sparql-results+json

also I need/want some basic text indexing too
http://4store.org/trac/wiki/TextIndexing
by specifying which objects should be indexed and how - eg dc:name, lp:descritpion, orcid:author blah blah.

#####20150525

OK so got panel sending SOME data back to index.js /add-on
need to think carefully about what variables are in scope and when the post/data is being called.
fix this first....

THEN - to find out why the POST request from the node.js end is not seeign the req.body (assuming it is being sent)...

OK - so Request().post() - needed to do to two more things
1) set `contentType: 'application/json'`
2) use `content: JSON.stringify(annoData)`

Now it gets posted and parsed correctly at hyperPatterns/annotate

Yusss!
Now just to
  - create error handing and success messages to pass back
  - wrangle the hyperPatterns site to do useful things with the POSTed annotations/exemplars


OK - so it seems I cant get alerts to play nicely with the panel firefox add-on.
This is a bug or limitation of working with panels.
I could probably implement a jQery style div + error plus button handler to add/remove but will leave this for later. 

#####20150803
Final push - basic method to have exisiting exemplars displayed on web pages that have been annotated.
main.js adds button to toolbar, which on click show() the sidebar we create. Sidebar is specified in data/sidebar.html and data/sidebar.js
Hopefully the sidebar.js can query the sparql endpoint for annos with the page URL (i'll need to pass this to the sidebar...) and Jquery style populate the sidebar with pretty cards that represent annotations (and .pngs!) for the forces and comments...
Some trouble getting the current url piped into the sidebar - window.location.href not working, but tabs.activeTab.url; was no trouble.
Upon clicking the tag button, we grab the current tab url, and message the sidebar.html/js - next is to use the data passed in to query the SPARQL, parse the results, and dynamically display nice exemplar cards on the side.

OK spent _ages_ trying to get the plugin to query and return something from the labpatterns/sparql endpoint.
Turns out - _must specify the trailing `/` if we want it to work_
I.e. a curl request to the endpoint looks like this
```
curl http://labpattterns.org/sparql/?query=[urlencoded query]
```

DUMB! I should try and fix this trailing slash business - but for now I will focus on getting the appropriate sparql query made  to bind all the data we want to display on the side panel for each page with annotations. Then we need to wade through the JSON to populate the sidebar html...

OK - sidebar index.js now does a new SPARQL whenever the sidebar is closed and button is clicked again.
Note - this is a bit annoying, having to close, and reload everytime - but whatever. 
Also - dealing with hash URIs is a pain - I should strip them from 1)being saved in the exemplars, and 2) being requested in the sidebar SPARQL.
but later...

OK - sidebar nnow displays all the basic info.
still need to 
0) remove uneeded D3/sparql .js
1) prettify
2) make <a hrefs to pattern info?> or hover and display?
2.5) deal with multiple forces.
3) have text frag <divs> clickable and search/highlight the corresponsing elements on the page. (jQuery)
Then, I posit that we pretty much done for now...

--later
 OK - 
 removed uneeded D3
 added now uneeded hightlight.js and matchit.js
 got window.find() to work - matching only words.slice(0,20) (first 20 chars)
 NEED to wrap windows.find in a callback after scroll(0,0) - which is my hack to ensure we start at the top every time.
 BUT this will _always_ only find the first instance of the match on the page...! Ugh.

 -- later still.
 OK back to plain old window.find() - the user just needs to know that this automates ctr-F - we need to manually scroll to top if we want to find the matches...
 The only other solution is to roll our own Jquery - get the string, then traverse the dom and get all matches, for each match, store the div, then on each click cycle through the matched div, using css to highlight the components - but this rarely works well because of the wild differences in html and css across different web sites. We have to load in Jquery againg and loop through the page many times to get all the instances. window.find() is lightweight and "good enough"..

 NEW feature request. On.click of <img> or <p>name</p> we should bring up another lightweight panel or alert with HTML formatted pattern info?

#####20150805
modified window.find() on annotation text <div> click to search for the first 20 chars (or less if words < 20 chars ).