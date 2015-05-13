
//monitor for changes in pattern dropdown
var patternSelector = window.document.getElementById("pattern-selector");
patternSelector.addEventListener("change", patternChanged);

//send changed pattern selection to add-on.js
function patternChanged() {
  window.parent.postMessage(patternSelector.value, "*");
}

//monitor changes in orcid text input - if = 19 char, send string to update addon (and panel) vars
$('#orcid').keyup(function () {
	var val = $.trim(this.value);
    	if(val.length === 19){
       		window.parent.postMessage(val, "*");
       	} 
});

//listen for messages from add-on.js (we only expect a json of pattern list)
window.addEventListener("message", loadplist, false);

//populate toolbar frame dropdown/selection with pattern options
function loadplist(message) {
	var items = message.data;
 	for (var i = 0; i < items['list'].length; i++){
		$("#pattern-selector").append('<option value="'+items["list"][i]["id"]+'">'+items["list"][i]["name"]+'</option>');					
	}
}
