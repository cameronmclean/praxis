self.port.on('payload', function(payload){
  //alert(payload['anno'])
  $('#text').html(payload["anno"]); 
});

self.port.on('pselected', function(pattern){
	$('#pattern').html(pattern['id']+"  -  "+pattern['name']);  
});

self.port.on('orcid', function(orcid){
	$('#or').html(orcid);  
});