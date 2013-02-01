/*global document:true, module:true, ButtonFactory:true */
if (typeof PAYPAL === 'undefined' || !PAYPAL) {
	var PAYPAL = {};
}

PAYPAL.apps = PAYPAL.apps || {};


(function () {

	'use strict';

	var app = {},
		paypalURL = 'https://www.paypal.com/cgi-bin/webscr',
		qrCodeURL = 'https://www.paypal.com/webapps/ppint/qrcode?data={url}&pattern={pattern}&height={size}',
		scriptURL = 'paypal-button.min.js',
		bnCode = 'JavaScriptButton_{type}',
		prettyParams = {
			id: 'hosted_button_id',
			name: 'item_name',
			number: 'item_number',
			lang: 'lc'
		},
		buttonImgs = {
			buynow: '//www.paypalobjects.com/{locale}/i/btn/btn_buynow_{size}.gif',
			cart: '//www.paypalobjects.com/{locale}/i/btn/btn_cart_{size}.gif'
		},
		buttonText = {
			en_US: {
				buynow: 'Buy Now',
				cart: 'Add to Cart'
			},
			es_ES: {
				buynow: 'Comporar ahora',
				cart: 'A&ntilde;adir al carro'
			},
			fr_FR: {
				buynow: 'Acheter',
				cart: 'Ajouter au panier'
			},
			de_DE: {
				buynow: 'Jetzt kaufen',
				cart: 'In den Warenkorb'
			}
		};

	if (!PAYPAL.apps.ButtonFactory) {

		/**
		 * Initial config for the app. These values can be overridden by the page.
		 */
		app.config = {
			labels: {
				item_name: 'Item',
				item_number: 'Number',
				amount: 'Amount',
				quantity: 'Quantity'
			}
		};

		/**
		 * A count of each type of button on the page
		 */
		app.buttons = {
			buynow: 0,
			cart: 0,
			hosted: 0,
			qr: 0
		};

		/**
		 * Renders a button in place of the given element
		 *
		 * @param business {Object} The ID or email address of the merchant to create the button for
		 * @param raw {Object} An object of key/value data to set as button params
		 * @param type (String) The type of the button to render
		 * @param parent {HTMLElement} The element to add the button to (Optional)
		 * @return {HTMLElement}
		 */
		app.create = function (business, raw, type, el) {
			var data = new DataStore(), button, key, parent;

			if (!business) { return false; }

			// Normalize the data's keys and add to a data store
			for (key in raw) {
				data.add(prettyParams[key] || key, raw[key].value, raw[key].isEditable);
			}

			// Defaults
			type = type || 'buynow';

			// Hosted buttons
			if (data.items.hosted_button_id) {
				type = 'hosted';
				data.add('cmd', '_s-xclick');
			// Cart buttons
			} else if (type === 'cart') {
				data.add('cmd', '_cart');
				data.add('add', true);
			// Plain text buttons
			} else {
				data.add('cmd', '_xclick');
			}

			// Add common data
			data.add('business', business);
			data.add('bn', bnCode.replace(/\{type\}/, type));

			// Build the UI components
			if (type === 'qr') {
				button = buildQR(data, data.items.size);
				data.remove('size');
			} else {
				button = buildForm(data, type);
			}
			
			// Inject CSS
			injectCSS();

			// Register it
			this.buttons[type] += 1;

			// Add it to the DOM
			if ((parent = el.parentNode)) {
				parent.replaceChild(button, el);
			}

			return button;
		};


		PAYPAL.apps.ButtonFactory = app;
	}


	/**
	 * Builds the form DOM structure for a button
	 *
	 * @param data {Object} An object of key/value data to set as button params
	 * @param type (String) The type of the button to render
	 * @return {HTMLElement}
	 */
	function buildForm(data, type) {
		var form = document.createElement('form'),
			btn = document.createElement('button'),
			hidden = document.createElement('input'),
			items = data.items,
			item, child, label, input, key, size, locale;

		btn.type = 'submit';
		hidden.type = 'hidden';
		form.method = 'post';
		form.action = paypalURL;
		form.className = 'paypal-button';
		form.target = '_top';

		for (key in items) {
			item = items[key];

			if (item.isEditable) {
				input = document.createElement('input');
				input.type = 'text';
				input.className = 'paypal-input';
				input.name = item.key;
				input.value = item.value;

				label = document.createElement('label');
				label.className = 'paypal-label';
				label.appendChild(document.createTextNode(app.config.labels[item.key] + ' ' || ''));
				label.appendChild(input);

				child = document.createElement('p');
				child.className = 'paypal-group';
				child.appendChild(label);
			} else {
				input = child = hidden.cloneNode(true);
				input.name = item.key;
				input.value = item.value;
			}

			form.appendChild(child);
		}

		size = items.size ? items.size.value : "large";
		locale = items.lc ? items.lc.value : "en_US";

		//btn.src = getButtonImg(type, size, locale);
		btn.className = "paypal-button " + size;
		btn.innerHTML = buttonText[locale][items.button.value];
		
		form.appendChild(btn);

		// If the Mini Cart is present then register the form
		if (PAYPAL.apps.MiniCart && data.cmd === '_cart') {
			var MiniCart = PAYPAL.apps.MiniCart;

			if (!MiniCart.UI.itemList) {
				MiniCart.render();
			}

			MiniCart.bindForm(form);
		}

		return form;
	}
	
	/**
	 * Injects button CSS in the <head>
	 *
	 * @return {void}
	 */
	function injectCSS() {
		var css = '',
			styleEl = document.createElement('style'),
			paypalButton = '.paypal-button',
			paypalInput = paypalButton + ' button[type=submit]';

		css += paypalButton + ' { white-space: nowrap; overflow: hidden; }';
		css += paypalInput + ' { outline: none; text-decoration: none; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; -ms-box-sizing: border-box; box-sizing: border-box; max-width: 100%; position: relative; margin: 0; background-color: rgb(252,155,0);  background: -moz-linear-gradient(top, rgb(255,248,252) 0%, rgb(252,155,0) 66%, rgb(252,155,0) 66%, rgb(255,248,252) 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgb(255,248,252)), color-stop(66%,rgb(252,155,0)), color-stop(66%,rgb(252,155,0)), color-stop(100%,rgb(255,248,252))); background: -webkit-linear-gradient(top, rgb(255,248,252) 0%,rgb(252,155,0) 66%,rgb(252,155,0) 66%,rgb(255,248,252) 100%); background: -o-linear-gradient(top, rgb(255,248,252) 0%,rgb(252,155,0) 66%,rgb(252,155,0) 66%,rgb(255,248,252) 100%); background: -ms-linear-gradient(top, rgb(255,248,252) 0%,rgb(252,155,0) 66%,rgb(252,155,0) 66%,rgb(255,248,252) 100%); background: linear-gradient(to bottom, rgb(255,248,252) 0%,rgb(252,155,0) 66%,rgb(252,155,0) 66%,rgb(255,248,252) 100%);filter:progid:DXImageTransform.Microsoft.gradient( startColorstr="rgb(255,248,252)", endColorstr="rgb(252,155,0)",GradientType=0 );border: rgb(251,137,0) solid 1px; -moz-border-radius: 12px; -webkit-border-radius: 12px; border-radius: 12px; color: rgb(5, 37, 87); font-weight: bold; text-shadow: 0 1px 0 rgba(255,255,255,.5); -webkit-user-select: none; -moz-user-select: none; -o-user-select: none; user-select: none; cursor: pointer; max-width: 100%; overflow: hidden; font-style: italic; font-family: "Verdana"; }';
		css += paypalInput + '.small { padding: 3px 15px; font-size: 11px; }';
		css += paypalInput + '.large { padding: 4px 22px; font-size: 13px; }';
	
		styleEl.type = 'text/css';
		
		if (styleEl.styleSheet) {
			styleEl.styleSheet.cssText = css;
		} else {
			styleEl.appendChild(document.createTextNode(css));
		}
		
		document.getElementsByTagName('head')[0].appendChild(styleEl);
	}


	/**
	 * Builds the image for a QR code
	 *
	 * @param data {Object} An object of key/value data to set as button params
	 * @param size {String} The size of QR code's longest side
	 * @param locale {String} The locale
	 * @return {HTMLElement}
	 */
	function buildQR(data, size, locale) {
		var img = document.createElement('img'),
			url = paypalURL + '?',
			pattern = 13,
			items = data.items,
			item, key;

		// QR defaults
		size = size.value || 250;

		for (key in items) {
			item = items[key];
			url += item.key + '=' + encodeURIComponent(item.value) + '&amp;';
		}

		url = encodeURIComponent(url);
		img.src = qrCodeURL.replace('{url}', url).replace('{pattern}', pattern).replace('{size}', size);

		return img;
	}


	/**
	 * Utility function to return the rendered button image URL
	 *
	 * @param type {String} The type of button to render
	 * @param size {String} The size of button (small/large)
	 * @param locale {String} The locale
	 * @return {String}
	 */
	function getButtonImg(type, size, locale) {
		var img = buttonImgs[type] || buttonImgs.buynow;

		// Image defaults
		locale = locale || 'en_US';
		size = (size === 'small') ? 'SM' : 'LG';

		return img.replace(/\{locale\}/, locale).replace(/\{size\}/, size);
	}


	/**
	 * Utility function to polyfill dataset functionality with a bit of a spin
	 *
	 * @param el {HTMLElement} The element to check
	 * @return {Object}
	 */
	function getDataSet(el) {
		var dataset = {}, attrs, attr, matches, len, i;

		if ((attrs = el.attributes)) {
			for (i = 0, len = attrs.length; i < len; i++) {
				attr = attrs[i];

				if ((matches = /^data-([a-z]+)(-editable)?/i.exec(attr.name))) {
					dataset[matches[1]] = {
						value: attr.value,
						isEditable: !!matches[2]
					};
				}
			}
		}

		return dataset;
	}

	/**
	 * A storage object to create structured methods around a button's data
	 */
	function DataStore() {
		this.items = {};

		this.add = function (key, value, isEditable) {
			this.items[key] = {
				key: key,
				value: value,
				isEditable: isEditable
			};
		};

		this.remove = function (key) {
			delete this.items[key];
		};
	}
	
	
	function getButtons() {
		var slice;

		if (document.querySelectorAll) {
			slice = Array.prototype.slice;
			return function (attr) {
				return slice.call(document.body.querySelectorAll('[data-paypal]'));
			};
		}

		return function (attr) {
			var elems = document.body.getElementsByTagName('button'),
				match = [],
				elem, i;

			for (i = elems.length - 1; i > -1; i--) {
				elem = elems[i];
				// Non-existent attributes generally return empty string ('') or null,
				// so their falsy-ness suffices in this case.
				if (elem.getAttribute(attr)) {
					match.push(elems);
				}
			}

			return match;
		};
	}
	
	/**
	 * Gets all elements w/ data-paypal attributes
	 *
	 * @param type {String} The data-paypal value to match against
	 * @return {NodeList}
	 */
	function getButtonsByType(type){
		var nodes = [],
			attr = "data-paypal",
			value;
		
		function getButton(node, fn) {     
			fn(node);
			node = node.firstChild;
		
			while (node) {         
				getButton(node, fn);         
				node = node.nextSibling;     
			}
		}
		
		getButton(document.body, function(n) { 
			if (n.nodeType === 1 && (value = n.getAttribute(attr))) {
				if (value === type) {
					nodes.push(n);	
				}
			}
		});
		
		return nodes;
	}

	/**
	 * Grab the merchant's ID off of the <script> snippet
	 *
	 * @param
	 * @return {String}
	 */
	function getMerchantId() {
		var nodes = document.getElementsByTagName('script'),
			node, data, type, business, i, len;

		for (i = 0, len = nodes.length; i < len; i++) {
			node = nodes[i];

			if (!node || !node.src) { continue; }
			
			business = node.src.split('?merchant=')[1];
			break;
		}
		
		return business;
	}


	// Find paypal button elements, find merchant ID, and then initialize buttons
	if (typeof document !== 'undefined') {
		
		var ButtonFactory = PAYPAL.apps.ButtonFactory,
			buttons = getButtonsByType('checkout'),
			merchantId = getMerchantId(),
			button, data, type, i, len;
		
		for (i = 0, len = buttons.length; i < len; i++) {
			button = buttons[i];

			data = button && getDataSet(button);
			type = data && data.button && data.button.value;
			
			if (merchantId) {
				ButtonFactory.create(merchantId, data, type, button);
			}
		}
	}


}());


// Export for CommonJS environments
if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = PAYPAL;
}