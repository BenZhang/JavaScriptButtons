## PayPal Payment Buttons [![Build Status](https://travis-ci.org/paypal/JavaScriptButtons.png?branch=master)](https://travis-ci.org/paypal/JavaScriptButtons)

Unofficial PayPal JavaScript payment buttons that are as easy as including a snippet of code. [Try it out and configure your own](http://paypal.github.com/JavaScriptButtons/).

### PayPal Button SDK
To use any of the buttons below, paste this snippet into your page.  At the top of the snippet, replace "YOUR_MERCHANT_ID" with your Merchant ID.  This will load the PayPal Button SDK asynchronously so it does not block loading other elements on your page.

```html
<script>
	(function(d, s, id){
		var merchantId = "YOUR_MERCHANT_ID",
			ref = d.getElementsByTagName(s)[0],
			js;
			
		if (!d.getElementById(id)) {
			js = d.createElement(s); js.id = id; js.async = true;
			js.src = "../src/paypal-button.js?merchant=" + merchantId;
			ref.parentNode.insertBefore(js, ref);
		}
	}(document, "script", "paypal-js"));
</script>
```
    
We have a few flavors of buttons for you to use:

### Buy Now
Buy Now buttons are for single item purchases.

```html
<button data-paypal="checkout"
    data-button="buynow"
    data-name="My product"
	data-amount="1.00"
></button>
```


### Add To Cart
Add To Cart buttons lets users add multiple items to their PayPal cart.

```html
<button data-paypal="checkout"
    data-button="cart"
    data-name="Product in your cart"
    data-amount="1.00"
></button>
```

### Hosted 
Hosted buttons help tamper-proof your button's data. 

```html
<button data-paypal="checkout"
    data-button="buynow"
    data-id="YOUR_BUTTON_ID"
></button>
```

*Note: Hosted buttons IDs must be created on PayPal.com or via the Button Manager APIs using your credentials.*

### QR Codes
QR codes which can be scanned with a smart phone can also be easily generated.

```html
<button data-paypal="checkout"
    data-name="Product via QR code"
    data-amount="1.00"
></button>
```

## Button variables
All of PayPal's [HTML button variables](https://cms.paypal.com/us/cgi-bin/?cmd=_render-content&content_ID=developer/e_howto_html_Appx_websitestandard_htmlvariables) are supported by prefixing their name with "data-". Here are the most commonly used:

* `data-name` Description of the item.
* `data-number` The number of the item.
* `data-amount` The price of the item.
* `data-quantity` Quantity of items to purchase.
* `data-shipping` The cost of shipping this item.
* `data-tax` Transaction-based tax override variable.
* `data-size` For button images: `small` and `large` work. For QR codes enter the pixel length of the longest side.
* `data-id` The hosted ID of the button (if applicable).

## Editable fields
Creating editable fields is easy! Just add `-editable` to the name of your variable, e.g. `data-quantity-editable`, and an input field will magically appear for your users.


## Localization
* Changing the default language of a button can be done by setting the variable `data-lc` with the correct locale code, e.g. es_ES.
* Changing the default input labels of editable buttons can be done by overriding the default configuration, e.g. PAYPAL.apps.ButtonFactory.config.labels.


## JavaScript API
There's even a fancy JavaScript API if you'd like to pragmatically create your buttons.

**PAYPAL.apps.ButtonFactory.config**  
This can be overridden to change the default behavior of the buttons.

**PAYPAL.apps.ButtonFactory.create(business, data, type, parentNode)**  
Creates and returns an HTML element that contains the button code. 
> **business** - A string containing either the business ID or the business email  
> **data** - A JavaScript object containing the button variables  
> **type** - The button type, e.g. "buynow", "cart", "qr"  
> **parentNode** - An HTML element to add the newly created button to (Optional)  


## Download
To download the production-ready JavaScript you'll need to save one of these files:

* [JavaScript Buttons](https://github.com/paypal/JavaScriptButtons/blob/master/dist/paypal-button.min.js)
* [JavaScript Buttons + MiniCart](https://github.com/paypal/JavaScriptButtons/blob/master/dist/paypal-button-minicart.min.js)

The first file gives you support for PayPal's JavaScript buttons. The second file has the same code from the first, but also contains functionality for the [PayPal Mini Cart](https://github.com/jeffharrell/MiniCart).

To see the un-minified code you can take a peek at [paypal-button.js](https://github.com/paypal/JavaScriptButtons/blob/master/src/paypal-button.js).


## Browser support 
The JavaScript buttons have been tested and work in all modern browsers including:

* Chrome
* Safari
* Firefox
* Internet Explorer 7+.


## Getting your Merchant ID
Your merchant ID needs to be added to the top of the referenced script. This ID can either be your Secure Merchant ID, which can be found by logging into your PayPal account and visiting your profile, or your email address.


## Contributing 

We love contributions! If you'd like to contribute please submit a pull request via Github. 

[Mocha](https://github.com/visionmedia/mocha) is used to run our test cases. Please be sure to run these prior to your pull request and ensure nothing is broken.


## Authors
**Jeff Harrell**  
[https://github.com/jeffharrell](https://github.com/jeffharrell)

**Mark Stuart**  
[https://github.com/mstuart](https://github.com/mstuart)
