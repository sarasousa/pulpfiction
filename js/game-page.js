	//housekeeping
	function initialize_game(is_dance){
		$('.containeer').addClass('hidee').hide();
		$('.intro-wrapper').removeClass('hidee').show();
		$('.play_btnn').show();
		$('#result-css, #result-txt, #result-txt-final').remove();
		$('img.gif').css("opacity", "initial");
		$('.question.txt').css("opacity", "initial");
		$('.result-txt.win').css("opacity", "initial");

		if(is_dance)
		{
			$('.question-containeer').removeClass('hidee').show();
		}

	}



$( document ).ready(function(){ 

	//event handlers

	    $('.answers button').click(function(){ 
    		var data = $(this).attr('data-key');
    		var this_wrapper = $(this).parents('.modal-content');
    		if(data == 'y')
    		{
    			$(this).append('<style id="result-css">.btnn-1e:before{background:#5BC840;}</style>');
    			this_wrapper.find('.question.gif').css("background", "#000");
    			this_wrapper.find('img.gif').css("opacity", "0.2");
    			this_wrapper.find('.question.txt').css("opacity", "0.9");
    			this_wrapper.find('.question.gif').append('<div id="result-txt">Correct!</div> ')

    			//display bonus
    			this_wrapper.find('.answers').slideUp(200);
    			this_wrapper.find('.question-containeer').delay(800).slideUp(200);
    			this_wrapper.find('.question.txt').delay(800).slideUp(1);

    			this_wrapper.find('.bonus-wrapper').delay(1000).removeClass('hidee').hide().slideDown(100);
    			this_wrapper.find('.bonus-wrapper video.video').delay(1500).get(0).play();
    		}
    		else
    		{
    			$(this).append('<style id="result-css">.btnn-1e:before{background:#FA6A56;}</style>');
    			this_wrapper.find('.question.gif').css("background", "#000");
    			this_wrapper.find('img.gif').css("opacity", "0.2");
    			this_wrapper.find('.question.txt').css("opacity", "0.9");
    			this_wrapper.find('.question.gif').append('<div id="result-txt">Wrong!</div> ')

    			//do whatever
    			this_wrapper.find('.answers').slideUp(200);
    			this_wrapper.find('.question-containeer').delay(800).slideUp(200);
    			this_wrapper.find('.question.txt').delay(800).slideUp(1);

    			this_wrapper.find('.fail-wrapper').delay(1000).removeClass('hidee').hide().slideDown(200);
    		}
    	});



	$('.play_btnn').click(function(){
		$(this).siblings('video').get(0).play();
		$(this).fadeOut(500);
	});

	var i_vid=document.querySelectorAll( '.intro-wrapper video.video');
	for(var i=0;i<i_vid.length;i++){ i_vid[i].addEventListener('ended', videoHandler ,false); }
    function videoHandler(e) {
        if(!e) { e = window.event; }
				$('.containeer').addClass('hidee');
				$('.answers').slideUp(1);
				$('.question-containeer').removeClass('hidee').slideDown(200);
				$('.answers').slideDown(200);
    }

	var b_vid = document.querySelectorAll( '.bonus-wrapper video.video');
	for(var i=0;i<b_vid.length;i++){ b_vid[i].addEventListener('ended', bonusVideoHandler ,false); }
    function bonusVideoHandler(e) {
        if(!e) { e = window.event; }
			$('.result-txt.win').css("opacity", "0.3");
			$('.bonus-wrapper').append('<div id="result-txt-final">Good Job!<br/>Feel free to proceed to another chapter or visit a new page.</div> ');
				
    }

initialize_game(false);

})