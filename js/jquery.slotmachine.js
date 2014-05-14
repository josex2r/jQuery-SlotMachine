(function($) {
			
	//Set required styles, filters and masks
	
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
	
	//CSS classes
	$("body").append("<style>"+
							".easySlotMachineBlurFast{-webkit-filter: blur(5px);-moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);filter: url(#easySlotMachineBlurFilterFast);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='5')}"+
							".easySlotMachineBlurMedium{-webkit-filter: blur(3px);-moz-filter: blur(3px);-o-filter: blur(3px);-ms-filter: blur(3px);filter: blur(3px);filter: url(#easySlotMachineBlurFilterMedium);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='3')}"+
							".easySlotMachineBlurSlow{-webkit-filter: blur(1px);-moz-filter: blur(1px);-o-filter: blur(1px);-ms-filter: blur(1px);filter: blur(1px);filter: url(#easySlotMachineBlurFilterSlow);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='1')}"+
							".easySlotMachineGradient{"+
								"-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(0,0,0,0)), color-stop(25%, rgba(0,0,0,1)), color-stop(75%, rgba(0,0,0,1)), color-stop(100%, rgba(0,0,0,0)) );"+
								"mask: url(#easySlotMachineFadeMask);"+
							"}"+
						"</style>");
	
	//Required easing functions
	if( typeof $.easing.easeOutBounce!=="function" ){
		//From jQuery easing, extend jQuery animations functions
		$.extend( jQuery.easing, {
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
	}
	
	/**
	  * @desc PUBLIC - Makes Slot Machine animation effect
	  * @param object settings - Plugin configuration params
	  * @return jQuery node - Returns jQuery selector with some new functions (shuffle, stop, next, auto, active)
	*/
	$.fn.easySlotMachine = function(settings){
		
		var defaults = {
				active	: 0, //Active element [int]
				delay	: 200, //Animation time [int]
				repeat	: false //Repeat delay [false||int]
			},
			settings = $.extend(defaults, settings), //Plugin settings
			$slot = $(this), //jQuery selector
			$titles = $slot.children(), //Slot Machine elements
			$container, //Container to wrap $titles
			maxTop, //Max marginTop offset
			_timer = null, //Timeout recursive function to handle auto (settings.repeat)
			_currentAnim = null, //Current playing jQuery animation
			_forceStop = false, //Force execution for some functions
			_active = { //Current active element
				index : settings.active,
				el	  : $titles.get( settings.active )
			};
		
		/**
		  * @desc PRIVATE - Get element offset top
		  * @param int index - Element position
		  * @return int - Negative offset in px
		*/
		function _getOffset( index ){
			var offset = 0;
			for(var i=0; i<index; i++){
				offset += $( $titles.get(i) ).height();
			}
			return -offset;
		}
		
		/**
		  * @desc PRIVATE - Get random element different than last shown
		  * @return object - Element index and HTML node
		*/
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
		
		/**
		  * @desc PRIVATE - Set currently showing element and makes active
		  * @param object elWithIndex - Element index and HTML node
		*/
		function _setActive( elWithIndex ){
			//Update last choosen element index
			_active = elWithIndex;
		}
		
		/**
		  * @desc PRIVATE - Get the next element
		  * @return int - Element index and HTML node
		*/ 
		function _getNext(){
			var nextIndex = _active.index+1<$titles.length ? _active.index+1 : 0
			var nextObj = {
				index : nextIndex,
				el	  : $titles.get(nextIndex)
			}
			return nextObj;
		};
		
		/**
		  * @desc PRIVATE - Set CSS classes to make speed effect
		  * @param string speed - Element speed [fast||medium||slow]
		  * @param string||boolean fade - Set fade gradient effect
		*/
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
		
		/**
		  * @desc PRIVATE - Reset active element position
		*/
		function _resetPosition(){
			$container.css("margin-top", _getOffset(_active.index));
		}
		
		/**
		  * @desc PRIVATE - Starts shuffling the elements
		  * @param int count - Number of shuffles (undefined to make infinite animation
		*/
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
		
		/**
		  * @desc PRIVATE - Stop shuffling the elements
		  * @param int||boolean nowOrRepeations - Number of repeations to stop (true to stop NOW)
		*/
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
		
		/**
		  * @desc PRIVATE - Checks if the machine is on the screen
		  * @return int - Returns true if machine is on the screen
		*/
		function _isVisible(){
			//Stop animation if element is [above||below] screen, best for performance
			var above = $slot.offset().top > $(window).scrollTop() + $(window).height(),
				below = $(window).scrollTop() > $slot.height() + $slot.offset().top;
			
			return !above && !below;
		}
		
		/**
		  * @desc PRIVATE - Start auto shufflings, animation stops each 3 repeations. Then restart animation recursively
		*/
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
		
		
		/**
		  * @desc PUBLIC - Starts shuffling the elements
		  * @param int count - Number of shuffles (undefined to make infinite animation
		*/
		$slot.shuffle = function( count ){
			
			_forceStop = false;
			
			_shuffle(count);
			
		};
		
		/**
		  * @desc PUBLIC - Stop shuffling the elements
		  * @param int||boolean nowOrRepeations - Number of repeations to stop (true to stop NOW)
		*/
		$slot.stop = function( nowOrRepeations ){
			
			if( settings.repeat!==false && _timer!==null ){
				
				_forceStop = true;
				
				clearTimeout(_timer);
				
			}
			
			_stop(nowOrRepeations);
			
		};
		
		/**
		  * @desc PUBLIC - SELECT next element relative to the current active element
		*/
		$slot.next = function(){
			
			$slot.stop(true);
			
		}
		
		/**
		  * @desc PUBLIC - Get selected element
		  * @return object - Element index and HTML node
		*/
		$slot.active = function(){
			return _getActive();
		}
		
		/**
		  * @desc PUBLIC - Start auto shufflings, animation stops each 3 repeations. Then restart animation recursively
		*/
		$slot.auto = _auto;
		
		return $slot;
		
	};
	
})(jQuery);