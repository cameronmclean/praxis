var patternSelector = window.document.getElementById("pattern-selector");
patternSelector.addEventListener("change", patternChanged);

function patternChanged() {
  window.parent.postMessage(patternSelector.value, "*");
}

window.addEventListener("message", loadplist, false);


function loadplist(message) {
	var items = message.data;
	console.log("hi there from loadplist "+items);
 for (var i = 0; i < items['list'].length; i++){
					$("#pattern-selector").append('<option value="'+items["list"][i]["id"]+'">'+items["list"][i]["name"]+'</option>');
					console.log(items["list"][i]["id"]);
				}
}

// $(document).ready(function(){
//     		 	console.log("ready!");
//     		   $.getJSON("http://labpatterns.org/patternlist", function(data){
//     		   		console.log("hi there from loadplist "+data['list']);
//  					for (var i = 0; i < data['list'].length; i++){
// 						$("#pattern-selector").append('<option value="'+data["list"][i]["id"]+'">'+data["list"][i]["ORCID"]+'</option>');
// 						console.log(data["list"][i]["id"]);
// 					}
// 				});  		 
//     	});