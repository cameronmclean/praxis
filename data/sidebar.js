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

addon.port.on("data", function(exList) {
	//this function is getting called - next to do something with exList
	$("#container").html("<p>Hey there</p>");
});