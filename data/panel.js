self.port.on('payload', function(payload){
  $('#text').html(payload["anno"]); 
});

self.port.on('pselected', function(pattern){
	$('#pattern').html(pattern['id']+"  -  "+pattern['name']);  
});

self.port.on('orcid', function(orcid){
	$('#or').html(orcid);  
});

self.port.on('forces', function(forces){
	$('#force-container').html("");
	for (var i =0; i < forces.length; i++){		
		$('#force-container').append("<div class='force-container'><img width=40 height=40 src='"+forces[i]['pic']+"'/><input type='checkbox' class='checkbox' value='"+forces[i]['@id']+"'/><p>"+forces[i]['forceName']+"</p></div>");
	}
});