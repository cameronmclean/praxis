self.port.on('payload', function(payload){
  //alert(payload['anno'])
  $('#text').html(payload["anno"]); //note dont append - replace
});

self.port.on('pselected', function(pattern){
	$('#pattern').html(pattern);  //<--------------dont append - replace.
});