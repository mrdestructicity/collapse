// Collapse.js: The last collapse script you'll ever need

// Version 0.9 (2021/08/02): Presentation to Barkley REI dev team.

;(function (window) {

	'use strict';

	// Defaults Options: 
	// - accordion: if true, opening one item closes all others
	// - open: on activation, if false, do not open panel; if a string or integer, open that panel

	var defaults = {
		accordion: true,
		open: false
	};

	// Default Settings
	class Collapse {
		constructor(element, options) {
			this.defaults = defaults;
			this.element = element;
			this.buttons = Array.from(this.element.querySelectorAll('.collapse__button'));
			this.panels = Array.from(this.element.querySelectorAll('.collapse__panel'));
			this.allClose = this.element.querySelector('.collapse__all-close');
			this.allOpen = this.element.querySelector('.collapse__all-open');
			this.options = { ...defaults, ...options };
			this.screenwidth = window.innerWidth;
			this.bindUIActions();
			this.activate();
		}

		// activate()
		// - add 'activated' class to parent element to enable styling
		// - remove disabled state from buttons
		// - close all items
		// - of anchor is set, ovveride default or user-provided 'open' value
		// - ppen the indicated tab

		activate() {
			let anchor = window.location.hash;
			this.buttons.forEach( function(element) {
				element.removeAttribute('disabled');
			});
			this.panels.forEach( function(element) {
				element.setAttribute('data-height', element.offsetHeight);
			});
			this.element.classList.add('collapse--activated');
			this.closeAll();
			if (anchor.length > 0 ) {
				this.options.open = anchor;
			}
			this.open(this.options.open);
		}

		// bindUIActions()

		bindUIActions() {
	 		var _this = this;
			_this.allClose.addEventListener('click', _this.closeAll.bind(_this));
			_this.allOpen.addEventListener('click', _this.openAll.bind(_this));
			_this.buttons.forEach( function(element) {
				element.addEventListener('click', _this.click.bind(_this));
				element.addEventListener('keydown', _this.keydown.bind(_this));
			});
			window.addEventListener('resize', _this.recalculate.bind(_this));
		}

		// click(event): 
		// - if the object is an accordion, close all items
		// - toggle the open state of the panel associated with the button
		// - if we just opened, push the ID of the button to the window history

		click(event) {
			event.preventDefault();
			event.stopPropagation();
			var _this = this;
			let pressed = event.currentTarget;
			let expanded = pressed.getAttribute('aria-expanded');
			let id = pressed.getAttribute('id');
			let label = pressed.getAttribute('aria-label');
			let target = _this.panels[_this.buttons.indexOf(event.currentTarget)];
			let height = target.getAttribute('data-height');
			let hidden = target.getAttribute('aria-hidden');
			if(_this.options.accordion) {
				_this.closeAll();
			}
			expanded = (expanded === 'true') ? 'false' : 'true';
			label = (label.indexOf('open') > -1) ? label.replace('open','close') : label.replace('close','open');
			pressed.setAttribute('aria-expanded', expanded);
			pressed.setAttribute('aria-label', label);
			hidden = (hidden === 'true') ? 'false' : 'true';
			if(expanded === 'true') {
				target.setAttribute('style','height:' + height + 'px');
				window.history.pushState(null, null, '#' + id);
			} else {
				window.history.pushState(null, null, ' ');
			}
			target.setAttribute('aria-hidden', hidden);
		}

		// closeAll(): Close all tabs

		closeAll() {
			var _this = this;
			_this.buttons.forEach( function(element) {
				element.setAttribute('aria-expanded', 'false');
				element.setAttribute('aria-label', element.querySelector('.collapse__label').innerText + ' (click to open)' );
			});
			_this.panels.forEach( function(element) {
				element.removeAttribute('style');
				element.setAttribute('aria-hidden', 'true');
			});
			window.history.pushState(null, null, ' ');
		}

		// keydown(event): 
		// - If up arrow (38), move to the previous button (or the last, if you're at the start)
		// - If down arrow (40), move to the next button (or the first, if you're at the end)

		keydown(event) {
			var _this = this;
			let code = (event.keyCode) ? event.keyCode : event.which;
			let target = _this.buttons.indexOf(event.currentTarget);
			if(code === 38) {
				target = target - 1;
				if (target < 0) {
					target = _this.buttons.length - 1;
				}
				_this.buttons[target].focus();
			}
			if(code === 40) {
				target = target + 1;
				if(target === _this.buttons.length) {
					target = 0;
				}
				_this.buttons[target].focus();
			}
		}

		// open(tab):
		// - open panel identified either by an ID attribute, or by a 0-indexed tab number
		// - this can be called from outside via [node].collapse.open(tab)

		open(tab) {
			var _this = this;
			let target = null;
			switch( typeof(tab) ) {
				case 'string':
					if(tab.indexOf('#') > -1) {
						target = _this.buttons.indexOf(document.querySelector(tab));
					}
					break;
				case 'number':
					if(tab < _this.buttons.length) {
						target = tab;
					}
					break;
			}
			if(target !== null) {
				if(_this.options.accordion) {
					_this.closeAll();
				}
				_this.buttons[target].setAttribute('aria-expanded', 'true');
				_this.buttons[target].setAttribute('aria-label', _this.buttons[target].querySelector('.collapse__label').innerText + ' (click to close)' );
				_this.panels[target].setAttribute('aria-hidden', 'false');
				_this.panels[target].setAttribute('style','height:' + _this.panels[target].getAttribute('data-height') + 'px');
			}
		}

		// openAll(): open all tabs

		openAll() {
			var _this = this;
			_this.buttons.forEach( function(element) {
				element.setAttribute('aria-expanded', 'true');
				element.setAttribute('aria-label', element.querySelector('.collapse__label').innerText + ' (click to close)' );
			});
			_this.panels.forEach( function(element) {
				element.setAttribute('aria-hidden', 'false');
				element.setAttribute('style','height:' + element.getAttribute('data-height') + 'px');
			});
			window.history.pushState(null, null, ' ');
		}

		// recalculate(): recalculate size of all tabs
		// - remove activated state and inline styes so panels show at natural height
		// - store each panel's natural height in its data-height attribute
		// - reactivate activated state

		recalculate() {
			var _this = this;
			_this.element.classList.remove('collapse--activated');
			_this.panels.forEach( function(element) {
				element.removeAttribute('style');
				element.setAttribute('data-height', element.offsetHeight);
				if(element.getAttribute('aria-hidden') === 'false') {
					element.setAttribute('style','height:' + element.getAttribute('data-height') + 'px');
				}
			});
			_this.element.classList.add('collapse--activated');
			_this.screenwidth = window.innerWidth;
		}
	}

	window.Collapse = Collapse;

})(window);
