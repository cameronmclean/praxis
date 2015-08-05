//addon.port.emit("ping");

addon.port.on("page", function(urlToView) {
  $('#url').html(urlToView);
});

addon.port.on("data", function(results) {
	 for (var i in results.bindings){
	 	
	 	//get pattern number for each annotation so we can put it in a clickable otab div
	 	var patternURL = results.bindings[i]['pattern']['value'];
	 	var patternNumArray = patternURL.split('/');
	 	var patternNum = patternNumArray[patternNumArray.length - 1];
	 	//console.log(patternNum);

	 	//fill each annotation 
	 	$("#container").append("<div class='anno' id='ex"+i+"'><div class='otab' id='?id="+patternNum+"'><img class='pPic' height='25' src="+results.bindings[i]['patternPic']['value']+"><span>"+results.bindings[i]['patternTitle']['value']+"</span> \
	 		<br><img class='fPic' height='35' src="+results.bindings[i]['forcePic']['value']+"><br><span class>"+results.bindings[i]['forceTitle']['value']+"</span></div> \
	 		<p>Text:</p> <div class='fragText'>"+results.bindings[i]['eXdetail']['value']+"</div><p>Comment:</p><div class='comText'>"+results.bindings[i]['eXcomment']['value']+"</div>Contributor: <span class='orcidlink'><a href="+results.bindings[i]['orcid']['value']+">"+results.bindings[i]['orcid']['value']+"</a></span></div>");
	 }
	
	$('.fragText').click(function(){
		//if clicked get words and send them back to the index.js to manipulate the main page for searching.
		var words = $(this).text();
		addon.port.emit("highlight", words);
		// alert(words);
		// window.find(words, false, false);
	});

	//if pattern/force names or pics are clicked, open new window with entire pattern to show context for the meaning/description/pattern
	$('.otab').click(function(){
		var pnum = $(this).attr('id');
		//alert(pnum);
		window.open('http://labpatterns.org/html/patternview.html'+pnum, '_blank');
	});

});