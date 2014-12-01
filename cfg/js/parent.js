(function(window, document){

	if ( window.HTMLPictureElement ) {
		$('html').addClass('resp-supported');
	}

	webshim.setOptions('forms-ext', {
		replaceUI: 'auto'
	});


	webshim.polyfill('forms forms-ext details');


	$(function(){
		var oninput;
		var o = window.respimage._.cfg;

		$('#xQuant').each(function(){
			var dpr = window.devicePixelRatio || 1;
			$(this).val(0.5);
			$(this).prop({
				min: 1 / dpr,
				max: Math.max(2 / dpr, 1),
				value: 1
			});
		});

		$.each(o, function(name, value){
			$('#'+name).val(value);
		});

		$('#vw-input')
			.on('change.smooth-vwchange', function(){
				oninput = $.prop(this, 'checked');
			})
			.trigger('change.smooth-vwchange')
		;
		$('#viewport').each(function(){
			var onChange = function(e){
				if (!e || (oninput && e.type == 'input') || (e.type == 'change' && !oninput)){
					var val = $(this).val();
					$('#arena').width(val);
				}
			};
			$(this).on('input change', onChange).each(onChange);
		});
		$('#arena').removeAttr('src').prop('src', 'javascript:false');



		$('.arena-config')
			.on('submit', function(){
				var data = $(this).serialize();
				$('#arena').prop('src', 'child.html?' + data);
				return false;
			})
			.triggerHandler('submit')
		;
	})

})(window, document);
