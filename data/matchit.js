//based on http://bartaz.github.io/sandbox.js/jquery.highlight.html

self.port.on('bo_selecta', function(words){
//alert("bo! "+words);
//str = words;
$('body').highlight(words);
$(".highlight").css({ backgroundColor: "#FFFF88" });	
});
//"window.find('"+shortword+"')"