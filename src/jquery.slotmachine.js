/*
  * jQuery Slot Machine v1.0.0
  * https://github.com/josex2r/jQuery-SlotMachine
  *
  * Copyright 2014 Jose Luis Represa
  * Released under the MIT license
*/
(function($) {
			
	//Set required styles, filters and masks
	
	$(document).ready(function(){
		
		//Fast blur
		if( $("filter#slotMachineBlurSVG").length<=0 ){
			$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">'+
								'<filter id="slotMachineBlurFilterFast">'+
									'<feGaussianBlur stdDeviation="5" />'+
								'</filter>'+
							'</svg>');
		}
		
		//Medium blur
		if( $("filter#slotMachineBlurSVG").length<=0 ){
			$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">'+
								'<filter id="slotMachineBlurFilterMedium">'+
									'<feGaussianBlur stdDeviation="3" />'+
								'</filter>'+
							'</svg>');
		}
		
		//Slow blur
		if( $("filter#slotMachineBlurSVG").length<=0 ){
			$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">'+
								'<filter id="slotMachineBlurFilterSlow">'+
									'<feGaussianBlur stdDeviation="1" />'+
								'</filter>'+
							'</svg>');
		}
		
		//Fade mask
		if( $("mask#slotMachineFadeSVG").length<=0 ){
			$("body").append('<svg version="1.1" xmlns="http://www.w3.org/2000/svg">'+
								'<mask id="slotMachineFadeMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">'+
									'<linearGradient id="slotMachineFadeGradient" gradientUnits="objectBoundingBox" x="0" y="0">'+
										'<stop stop-color="white" stop-opacity="0" offset="0"></stop>'+
										'<stop stop-color="white" stop-opacity="1" offset="0.25"></stop>'+
										'<stop stop-color="white" stop-opacity="1" offset="0.75"></stop>'+
										'<stop stop-color="white" stop-opacity="0" offset="1"></stop>'+
									'</linearGradient>'+
									'<rect x="0" y="-1" width="1" height="1" transform="rotate(90)" fill="url(#slotMachineFadeGradient)"></rect>'+
								'</mask>'+
							'</svg>');
		}
		
		//CSS classes
		$("body").append("<style>"+
								".slotMachineBlurFast{-webkit-filter: blur(5px);-moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);filter: url(#slotMachineBlurFilterFast);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='5')}"+
								".slotMachineBlurMedium{-webkit-filter: blur(3px);-moz-filter: blur(3px);-o-filter: blur(3px);-ms-filter: blur(3px);filter: blur(3px);filter: url(#slotMachineBlurFilterMedium);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='3')}"+
								".slotMachineBlurSlow{-webkit-filter: blur(1px);-moz-filter: blur(1px);-o-filter: blur(1px);-ms-filter: blur(1px);filter: blur(1px);filter: url(#slotMachineBlurFilterSlow);filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='1')}"+
								".slotMachineGradient{"+
									"-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(0,0,0,0)), color-stop(25%, rgba(0,0,0,1)), color-stop(75%, rgba(0,0,0,1)), color-stop(100%, rgba(0,0,0,0)) );"+
									"mask: url(#slotMachineFadeMask);"+
								"}"+
							"</style>");
		
	});
	
	//Required easing functions
	if( typeof $.easing.easeOutBounce!=="function" ){
		//From jQuery easing, extend jQuery animations functions
		$.extend( $.easing, {
			easeOutBounce: function (x, t, b, c, d) {
				if ((t/=d) < (1/2.75)) {
					return c*(7.5625*t*t) + b;
				} else if (t < (2/2.75)) {
					return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
				} else if (t < (2.5/2.75)) {
					return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
				} else {
					return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
				}
			},
		});
	}
	
	/**
	  * @desc PUBLIC - Makes Slot Machine animation effect
	  * @param object settings - Plugin configuration params
	  * @return jQuery node - Returns jQuery selector with some new functions (shuffle, stop, next, auto, active)
	*/
	$.fn.slotMachine = function(settings){
		
		var defaults = {
			active	: 0, //Active element [int]
			delay	: 200, //Animation time [int]
			repeat	: false //Repeat delay [false||int]
		};
		
		settings = $.extend(defaults, settings); //Plugin settings
		
		var	$slot = $(this), //jQuery selector
			$titles = $slot.children(), //Slot Machine elements
			$container, //Container to wrap $titles
			_maxTop, //Max marginTop offset
			_timer = null, //Timeout recursive function to handle auto (settings.repeat)
			_currentAnim = null, //Current playing jQuery animation
			_forceStop = false, //Force execution for some functions
			_oncompleteShuffling = null, //Callback function
			_isRunning = false, //Machine is running?
			_active = { //Current active element
				index	: settings.active,
				el		: $titles.get( settings.active )
			};
		
		/**
		  * @desc PRIVATE - Get element offset top
		  * @param int index - Element position
		  * @return int - Negative offset in px
		*/
		function _getOffset( index ){
			var offset = 0;
			for(var i=0; i<index; i++){
				offset += $( $titles.get(i) ).outerHeight();
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
			}while( rnd===_active.index && rnd>=0 );
			
			//Choose element
			var choosen = {
					index : rnd,
					el : $titles.get( rnd )
				};
			return choosen;
		}
		
		/**
		  * @desc PRIVATE - Get currently active element
		  * @return object elWithIndex - Element index and HTML node
		*/
		function _getActive(){
			//Update last choosen element index
			return _active;
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
		  * @desc PRIVATE - Get the previous element
		  * @return int - Element index and HTML node
		*/ 
		function _getPrev(){
			var prevIndex = _active.index-1<0 ? $titles.length-1 : _active.index-1;
			var prevObj = {
				index	: prevIndex,
				el		: $titles.get(prevIndex)
			};
			return prevObj;
		}
		
		/**
		  * @desc PRIVATE - Get the next element
		  * @return int - Element index and HTML node
		*/ 
		function _getNext(){
			var nextIndex = _active.index+1<$titles.length ? _active.index+1 : 0;
			var nextObj = {
				index	: nextIndex,
				el		: $titles.get(nextIndex)
			};
			return nextObj;
		}
		
		/**
		  * @desc PRIVATE - Set CSS classes to make speed effect
		  * @param string speed - Element speed [fast||medium||slow]
		  * @param string||boolean fade - Set fade gradient effect
		*/
		function _setAnimationFX(speed, fade){
			$slot.add($titles).removeClass("slotMachineBlurFast slotMachineBlurMedium slotMachineBlurSlow");
			switch( speed ){
				case 'fast':
					$titles.addClass("slotMachineBlurFast");
					break;
				case 'medium':
					$titles.addClass("slotMachineBlurMedium");
					break;
				case 'slow':
					$titles.addClass("slotMachineBlurSlow");
					break;
			}
			
			if( fade!==true || speed==="stop" ){
				$slot.add($titles).removeClass("slotMachineGradient");
			}else{
				$slot.add($titles).addClass("slotMachineGradient");
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
			
			_isRunning = true;
			
			var delay = settings.delay;
			
			//Infinite animation
			if( count===undefined ){
				
				//Set animation effects
				_setAnimationFX("fast", true);
				
				delay /= 2;
				
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
		  * @desc PRIVATE - Perform Shuffling calback
		*/
		function completeCallback(){
			
			if( typeof _oncompleteShuffling==="function" ){
						
				_oncompleteShuffling($slot, _active);
				
				_oncompleteShuffling = null;
				
			}
			
		}
		
		/**
		  * @desc PRIVATE - Stop shuffling the elements
		  * @param int||boolean nowOrRepeations - Number of repeations to stop (true to stop NOW)
		*/
		function _stop( nowOrRepeations, getElementFn ){
			
			//Stop animation
			if( _currentAnim!==null ){
				_currentAnim.stop();
			}
			
			//Get element
			var rnd;
			if( typeof getElementFn==="function" ){
				
				rnd = getElementFn();
				
			}else{
				if( settings.repeat ){
					rnd = _getNext();
				}else{
					rnd = _getRandom();
				}
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
					}, delay, "easeOutBounce", completeCallback);
					
				}else{
					
					_setAnimationFX("stop");
					
					_resetPosition();
					
				}
				
				//Oncomplete animation
				setTimeout(function(){
					
					_setAnimationFX("stop");
					
					_isRunning = false;
					
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
		function _auto( delay ){
			
			if( _forceStop===false ){
				
				delay = delay===undefined ? 1 : settings.repeat + 1000;
				
				_timer = setTimeout(function(){
					
					if( _forceStop===false ){
						
						_shuffle(3);
						
					}
					
					_timer = _auto( delay );
					
				}, delay);
				
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
		$slot.shuffle = function( count, oncomplete ){
			
			_forceStop = false;
			
			_oncompleteShuffling = oncomplete;
			
			_shuffle(count);
			
		};
		
		/**
		  * @desc PUBLIC - Stop shuffling the elements
		  * @param int||boolean nowOrRepeations - Number of repeations to stop (true to stop NOW)
		*/
		$slot.stop = function( nowOrRepeations ){
			
			_forceStop = true;
			
			if( settings.repeat!==false && _timer!==null ){
				
				clearTimeout(_timer);
				
			}
			
			_stop(nowOrRepeations);
			
		};
		
		/**
		  * @desc PUBLIC - SELECT previous element relative to the current active element
		*/
		$slot.prev = function(){
			
			_stop(true, _getPrev);
			
		};
		
		/**
		  * @desc PUBLIC - SELECT next element relative to the current active element
		*/
		$slot.next = function(){
			
			_stop(true, _getNext);
			
		};
		
		/**
		  * @desc PUBLIC - Get selected element
		  * @return object - Element index and HTML node
		*/
		$slot.active = function(){
			return _getActive();
		};
		
		/**
		  * @desc PUBLIC - Check if the machine is doing stuff
		  * @return boolean - Machine is shuffling
		*/
		$slot.isRunning = function(){
			return _isRunning;
		};
		
		/**
		  * @desc PUBLIC - Start auto shufflings, animation stops each 3 repeations. Then restart animation recursively
		*/
		$slot.auto = _auto;
		
		return $slot;
		
	};
	
})(jQuery);