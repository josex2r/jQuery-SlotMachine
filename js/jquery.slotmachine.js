(function($) {
			
	//Set styles and mask
	//Fast blur
	if( $("filter#easySlotMachineBlurSVG").length<=0 ){
		$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display:none">'+
							'<filter id="easySlotMachineBlurFilterFast">'+
								'<feGaussianBlur stdDeviation="5" />'+
							'</filter>'+
						'</svg>');
	}
	//Medium blur
	if( $("filter#easySlotMachineBlurSVG").length<=0 ){
		$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display:none">'+
							'<filter id="easySlotMachineBlurFilterMedium">'+
								'<feGaussianBlur stdDeviation="3" />'+
							'</filter>'+
						'</svg>');
	}
	//Slow blur
	if( $("filter#easySlotMachineBlurSVG").length<=0 ){
		$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display:none">'+
							'<filter id="easySlotMachineBlurFilterSlow">'+
								'<feGaussianBlur stdDeviation="1" />'+
							'</filter>'+
						'</svg>');
	}
	//Fade mask
	if( $("mask#easySlotMachineFadeSVG").length<=0 ){
		$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display:none">'+
							'<mask id="easySlotMachineFadeMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">'+
								'<linearGradient id="easySlotMachineFadeGradient" gradientUnits="objectBoundingBox" x="0" y="0">'+
									'<stop stop-color="white" stop-opacity="0" offset="0"></stop>'+
									'<stop stop-color="white" stop-opacity="1" offset="0.25"></stop>'+
									'<stop stop-color="white" stop-opacity="1" offset="0.75"></stop>'+
									'<stop stop-color="white" stop-opacity="0" offset="1"></stop>'+
								'</linearGradient>'+
								'<rect x="0" y="-1" width="1" height="1" transform="rotate(90)" fill="url(#easySlotMachineFadeGradient)"></rect>'+
							'</mask>'+
						'</svg>');
	}
	
	$("body").append("<style>"+
							".easySlotMachineBlurFast{-webkit-filter: blur(5px);-moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);filter: url(#easySlotMachineBlurFilterFast);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='5')}"+
							".easySlotMachineBlurMedium{-webkit-filter: blur(3px);-moz-filter: blur(3px);-o-filter: blur(3px);-ms-filter: blur(3px);filter: blur(3px);filter: url(#easySlotMachineBlurFilterMedium);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='3')}"+
							".easySlotMachineBlurSlow{-webkit-filter: blur(1px);-moz-filter: blur(1px);-o-filter: blur(1px);-ms-filter: blur(1px);filter: blur(1px);filter: url(#easySlotMachineBlurFilterSlow);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='1')}"+
							".easySlotMachineGradient{"+
								"-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(0,0,0,0)), color-stop(25%, rgba(0,0,0,1)), color-stop(75%, rgba(0,0,0,1)), color-stop(100%, rgba(0,0,0,0)) );"+
								"mask: url(#easySlotMachineFadeMask);"+
							"}"+
						"</style>");
	
	/** 
	  * @desc makes Slot Machine animation effect
	  * @param object settings - Plugin configuration params
	  * @return jQuery node - Return jQuery selector with some new functions (shuffle, stop, next, auto)
	*/  
	$.fn.easySlotMachine = function(settings){
		
		var defaults = {
				active	: 0, //Active element
				delay	: 200, //Animation time
				repeat	: false //Repeat each 2000ms
			},
			settings = $.extend(defaults, settings),
			$slot = $(this),
			$titles = $slot.children(),
			$container,
			maxTop,
			_timer = null,
			_currentAnim = null,
			_forceStop = false,
			_active = {
				index : settings.active,
				el	  : $titles.get( settings.active )
			};
		
		//Get element offset top
		function _getOffset(index){
			var offset = 0;
			for(var i=0; i<index; i++){
				offset += $( $titles.get(i) ).height();
			}
			return -offset;
		}
		
		//Get random element
		function _getRandom(){
			var rnd;
			do{
				rnd = Math.floor( Math.random() * $titles.length );
			}while( rnd==_active.index && rnd>=0 );
			
			//Choose element
			var choosen = {
					index : rnd,
					el : $titles.get( rnd )
				};
			return choosen;
		}
		
		function _setActive(elWithIndex){
			//Update last choosen element index
			_active = elWithIndex;
		}
		
		//Get next element
		function _getNext(){
			var nextIndex = _active.index+1<$titles.length ? _active.index+1 : 0
			var nextObj = {
				index : nextIndex,
				el	  : $titles.get(nextIndex)
			}
			return nextObj;
		};
		
		//From jQuery easing
		jQuery.extend( jQuery.easing, {
			easeOutBounce: function (x, t, b, c, d) {
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
				} else {
					return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
				}
			},
		});
		
		function _setAnimationFX(speed, fade){
			$container.add( $titles ).removeClass("easySlotMachineBlurFast easySlotMachineBlurMedium easySlotMachineBlurSlow");
			switch( speed ){
				case 'fast':
					$container.add( $titles ).addClass("easySlotMachineBlurFast");
					break;
				case 'medium':
					$container.add( $titles ).addClass("easySlotMachineBlurMedium");
					break;
				case 'slow':
					$container.add( $titles ).addClass("easySlotMachineBlurSlow");
					break;
			}
			
			if( fade!==true || speed==="stop" ){
				$slot.removeClass("easySlotMachineGradient");
			}else{
				$slot.addClass("easySlotMachineGradient");
			}
		}
		
		function _resetPosition(){
			//Reset top position
			$container.css("margin-top", _getOffset(_active.index));
		}
		
		//Rock the machine!
		function _shuffle( count ){
			
			//Infinite animation
			if( count===undefined ){
				
				//Set animation effects
				_setAnimationFX("fast", true);
				
				var delay = settings.delay / 2;
				
				if( _isVisible() ){
					
					//Perform animation
					_currentAnim = $container.animate({
						marginTop : _maxTop
					}, delay, function(){
						
						//Remove animation var
						_currentAnim = null;
						
						//Reset top position
						$container.css("margin-top", 0);
						
					});
				
				}else{
						
					_setAnimationFX("stop");
					
					_resetPosition();
					
				}
					
				//Oncomplete animation
				setTimeout(function(){
					
					if( _forceStop===false ){
						
						//Repeat animation
						_shuffle();
						
					}
					
				}, delay + 25);
			
			//Stop animation after {count} repeats
			}else{
				
				//Perform fast animation
				if( count>=1 ){
					
					var delay = settings.delay;
					
					if( count>1 ){
						
						//Set animation effects
						_setAnimationFX("fast", true);
					
						delay /= 2;
						
					}else{
						
						//Set animation effects
						_setAnimationFX("medium", true);
						
					}
					
					if( _isVisible() ){
						
						//Perform animation
						_currentAnim = $container.animate({
							marginTop : _maxTop
						}, delay, function(){
							
							//Remove animation var
							_currentAnim = null;
							
							//Reset top position
							$container.css("margin-top", 0);
							
						});
						
					}else{
						
						_setAnimationFX("stop");
						
						_resetPosition();
						
					}
					
					//Oncomplete animation
					setTimeout(function(){
						
						//Repeat animation
						_shuffle( count-1 );
						
					}, delay + 25);
					
				}else{
					
					//Stop NOW!
					_stop(true);
					
				}
				
			}
			
		}
		
		function _stop( nowOrRepeations ){
			
			//Stop animation
			if( _currentAnim!==null ){
				_currentAnim.stop();
			}
			
			//Get element
			var rnd;
			if( settings.repeat ){
				rnd = _getNext();
			}else{
				rnd = _getRandom();
			}
								
			//Stop animation NOW!!!!!!!
			if( nowOrRepeations===true || nowOrRepeations<=1 ){
				
				_setAnimationFX("slow", true);
				
				//get random element offset
				var offset = _getOffset(rnd.index);
				
				//Exception: first element
				if( rnd.index===0 ){
					$container.css("margin-top", -$( rnd.el ).height() / 2 );
				}
				
				var delay = 75 * $titles.length - rnd.index;
				
				if( _isVisible() ){
					
					_setActive( rnd );
					
					//Perform animation
					$container.animate({
						marginTop : offset
					}, delay, "easeOutBounce");
					
				}else{
					
					_setAnimationFX("stop");
					
					_resetPosition();
					
				}
				
				//Oncomplete animation
				setTimeout(function(){
					
					_setAnimationFX("stop");
					
				}, delay + 25);
			
			//Stop animation sloooooooowly
			}else{
				
				_shuffle(nowOrRepeations || 3);
				
			}
			
		}
		
		function _isVisible(){
			//Stop animation if element is [above||below] screen, best for performance
			var above = $slot.offset().top > $(window).scrollTop() + $(window).height(),
				below = $(window).scrollTop() > $slot.height() + $slot.offset().top;
			
			return !above && !below;
		}
		
		function _auto(){
			
			if( _forceStop===false ){
				
				_timer = setTimeout(function(){
					
					if( _forceStop===false ){
						
						_shuffle(3);
						
					}
					
					_timer = _auto();
					
				}, settings.repeat + 1000);
				
			}
			
		}
		
		$slot.css("overflow", "hidden");
		
		//Wrap elements inside $container
		$titles.wrapAll("<div class='slotMachineContainer' />");
		$container = $slot.find(".slotMachineContainer");
		
		//Set max top offset
		_maxTop = - $container.height();
		
		//Show active element
		$container.css("margin-top", _getOffset(settings.active) );
		
		//Start auto animation
		if( settings.repeat!==false ){
			
			_auto();
			
		}
		
		//Public methods
		
		//Starts shuffling animation
		$slot.shuffle = function( count ){
			
			_forceStop = false;
			
			_shuffle(count);
			
		};
		
		$slot.stop = function( nowOrRepeations ){
			
			if( settings.repeat!==false && _timer!==null ){
				
				_forceStop = true;
				
				clearTimeout(_timer);
				
			}
			
			_stop(nowOrRepeations);
			
		};
		
		$slot.next = function(){
			
			$slot.stop(true);
			
		}
		
		$slot.auto = _auto;
		
		return $slot;
		
	};
})(jQuery);