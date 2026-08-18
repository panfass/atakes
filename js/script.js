$(document).ready(function(){
	// Remove no-javascript class if js is enabled
	$("body.no-javascript").removeClass("no-javascript")

	$("audio").removeAttr("controls").each(function(i, audioElement) {
	    var audio = $(this);
	    var that = this;
	    $("#doc").append($('<li><a class="'+audio.attr("class")+'" href="#" title="'+audio.attr("title")+    '"> <span id="descr" style="display:block;"> "'  + audio.attr("title") +       '" </span> <img src="img/' + audio.attr("class") + '.png"/></a></li>' ).click(function() {that.play();return false;}));
	});

});