self.port.on('payload', function(payload){
  $('#text').html(payload["anno"]); 
  $('#page').html(payload["where"]);
  $('#name').html(payload["title"]);
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
		$('#force-container').append("<div style='display: inline-block; padding: 10px;' class='force-pics'><img width=40 height=40 src='"+forces[i]['pic']+"'/><input type='checkbox' name='force"+[i]+"' class='checkbox' value='"+forces[i]['@id']+"'/><p>"+forces[i]['forceName']+"</p></div>");
	}
});


$('#fire-button').click(function(){
	var fdata = [];
	var fdata = $('#annotation').serializeArray();
	var target = {};
	target['name'] = "hasTaget";
	target['value'] = $('#page').html();
	fdata.push(target)
	var title = {};
	title['name'] = "pageName";
	title['value'] = $('#name').html();
	fdata.push(title);
	var annot = {};
	annot['name'] = "exemplifiedBy";
	annot['value'] = $('#text').html();
	fdata.push(annot);

	self.port.emit('data-entered', fdata); 

	$('#comment').val(''); //clear the comment field after sending
});

self.port.on('post', function(response){
	alert("Annotation POSTed with response "+response);
});