//addon.port.emit("ping");

addon.port.on("page", function(urlToView) {
  $('#url').html(urlToView);
  //query the sparql endpoint
 //   var endpoint = "http://labpatterns.org/sparql";
 //   var sparql = "prefix exemplr: <http://purl.org/NET/exemplr#> prefix schema: <http://schema.org/> prefix lp: <http://purl.org/NET/labpatterns#> SELECT ?ex WHERE { ?ex a exemplr:Exemplar . }" ;
 //   var sparql2 ="SELECT * WHERE { ?a ?b ?c .} LIMIT 10";
 // //$("#container").html(endpoint+"   "+sparql);
 //   d3sparql.query(endpoint, sparql2, render);
   
 //     function render(jsonp) {
 //      $('#container').html("hi mum!");
 //     }

});

addon.port.on("data", function(results) {
	 for (var i in results.bindings){
	 	$("#container").append("<div class='anno' id="+i+"><img class='pPic' height='25' src="+results.bindings[i]['patternPic']['value']+"><span>"+results.bindings[i]['patternTitle']['value']+"</span> \
	 		<p>Forces:</p> <img class='fPic' height='40' src="+results.bindings[i]['forcePic']['value']+"> <span>"+results.bindings[i]['forceTitle']['value']+"</span> \
	 		<p>Text:</p><div class='fragText'>"+results.bindings[i]['eXdetail']['value']+"</div><p>Comment:</p><div class='comText'>"+results.bindings[i]['eXcomment']['value']+"</div>Contributor: <a href="+results.bindings[i]['orcid']['value']+">"+results.bindings[i]['orcid']['value']+"</a></div>");
	 }
	
	$('.fragText').click(function(){
		//if clicked get words and send them back to the index.js to manipulate the main page.
		var words = $(this).text();
		addon.port.emit("highlight", words);
		// alert(words);
		// window.find(words, false, false);
	});

});