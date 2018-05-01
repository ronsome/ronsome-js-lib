/*
* ronsome-js-lib.js
* Ron Newsome, Jr.
* 2018-04-30
*/

if (!String.prototype.trim) {
  (function() {
    // Make sure we trim BOM and NBSP
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    String.prototype.trim = function() {
      return this.replace(rtrim, '');
    };
  })();
}

if( !String.prototype.strip ) {
	String.prototype.strip = function() {
		return this.replace(/<[^>]+>/gi, '');
	};
}

String.prototype.format = function(){
	let str = this;
	let vars = arguments;
	for(var i=0; i<vars.length; i++){
		str = str.replace('{' + i + '}', vars[i]);
	}
	return str;
}

function $(el){ return document.getElementById(el); }
function $$(sel){ return document.querySelectorAll(sel); }

// Convenience function to create a new element
function $E(tag, atts){
	var el = document.createElement(tag);
	for(every in atts){ el[every] = atts[every]; }
		el.addKids = function(kids){
			for(var i=0; i<kids.length; i++){
				el.appendChild(kids[i]);
			}
			return el;
		}
	return el;
}

function $_COOKIE(label){
	var c = document.cookie;
	var sites = c.split(';');
	for(var  i=0; i<sites.length; i++){
		if(sites[i].match(label)){
			return sites[i].replace(label+'=', '').trim();
		}
	}
	return '';
}

function ondomloaded(f){
	document.addEventListener('DOMContentLoaded', f, false);
}

// Navigable calendar object
function Calendar() {
	var opts = (arguments[0] || {});
	function $E(tag, atts){
		var el = document.createElement(tag);
		for(every in atts){ el[every] = atts[every]; }
			return el;
	}
	var wrapper = new $E('div',{innerHTML:'', className:(opts.className || 'rn_calendar')});

	wrapper.setAttribute("id", opts.id || "");
	wrapper.dayNames = ["S", "M", "T", "W", "T", "F", "S"];

	wrapper.now = new Date();
	wrapper.startPos = 0;
	wrapper.padNum = function(num){
		return num > 9? num: '0' + num;
	}

	wrapper.checkleapyear = function(datea) {
	 // function by hscripts.com
	 datea = parseInt(datea);
	 if(datea%4 == 0) {
	 	if(datea%100 != 0) {
	 		return true;
	 	} else {
	 		if(datea%400 == 0) {return true;}
	 		else {return false;}
	 	}
	 }
	 return false;
	}

	wrapper.mthData = [
	{name:"January", length:31},
	{name:"February", length:(wrapper.checkleapyear(wrapper.now.getFullYear())? 29: 28)},
	{name:"March", length:31}, {name:"April", length:30},{name:"May", length:31},
	{name:"June", length:30}, {name:"July", length:31},{name:"August", length:31},
	{name:"September", length:30}, {name:"October", length:31},{name:"November", length:30},
	{name:"December", length:31}
	];

	wrapper.Set = function(){


		var dt = wrapper.now.getDate();
		var numDays = wrapper.mthData[wrapper.now.getMonth()].length+1;
		if(wrapper.now.getMonth()==1 && wrapper.checkleapyear(wrapper.now.getFullYear()) ){
			numDays = wrapper.mthData[wrapper.now.getMonth()].length+2;
		}

// Figure out where 1st of the month goes
var yesterday = wrapper.now.getDate()-1;
var firstDay = wrapper.now.setDate(wrapper.now.getDate()-yesterday);
wrapper.startPos = wrapper.now.getDay().toString();
wrapper.startPos = 1 * wrapper.startPos;


var yearmo = new $E('section',{className:'rn_yearmo'});
// Write month
var mSpan = document.createElement("span");
mSpan.appendChild(document.createTextNode(wrapper.mthData[wrapper.now.getMonth()].name) );
yearmo.appendChild( mSpan );

// Write year
var ySpan = document.createElement("span");
ySpan.appendChild( document.createTextNode( wrapper.now.getFullYear() ) );
yearmo.appendChild( ySpan );

wrapper.appendChild(yearmo);

var tbl = document.createElement("table");
var tbody = document.createElement("tbody");
var thead = document.createElement("thead");
var header = document.createElement("tr");
header.className = "header";
tbl.appendChild(thead);
thead.appendChild(header);

// Create days of the week
for(i=0; i<wrapper.dayNames.length; i++){
	var dayTd = document.createElement("th");
	dayTd.appendChild( document.createTextNode(wrapper.dayNames[i]) );
	header.appendChild(dayTd);
}

// Create days of the month
var tr;
for (ct=0; ct<42; ct++) {
	var dayNum = ct - wrapper.startPos;
	if(dayNum>0){
		if(dayNum<=wrapper.mthData[wrapper.now.getMonth()].length){
			dayNum = dayNum;
		} else {dayNum = "";}
	} else {
		dayNum = "";
	}
	if(ct%7 == 1){
		tr = document.createElement("tr");
		tbody.appendChild(tr);
	}

	if(tr) {
		dayNum = (dayNum<=numDays)? dayNum: "";
		td = new $E("td");
		if(dayNum != "") { td.id = 'td'+dayNum; }
		var tdspan = new $E('span',{innerHTML:dayNum});
		td.appendChild( tdspan );
		if( (dayNum == new Date().getDate()) && wrapper.now.getMonth() == new Date().getMonth() ){
			td.className =  "rn_today";
		}
		
		td.datetext = [wrapper.now.getFullYear(), 
		wrapper.padNum(wrapper.now.getMonth()+1),
		wrapper.padNum(dayNum)].join('-');
		tr.appendChild( td );
	}		
}

tbl.appendChild(tbody);
wrapper.appendChild(tbl);
}

wrapper.getMonth = function(pad){
	var mo = wrapper.now.getMonth() + 1;
	if(pad == 'name')
		return wrapper.mthData[wrapper.now.getMonth()].name;
	else if(pad)
		return mo > 9? mo: '0' + mo;
	else
		return mo;
}
wrapper.getYear = function(){
	return wrapper.now.getFullYear();
}
wrapper.currentDate = function(today){
	var dt = today? new Date().getDate(): wrapper.now.getDate();
	dt = dt > 9? dt: ('0' + dt);
	return [wrapper.getYear(), wrapper.getMonth(2), dt].join('-');
}

wrapper.next = function(callback){
	wrapper.now.setMonth(wrapper.now.getMonth()+1);
	wrapper.innerHTML = '';
	wrapper.Set();
	if(callback) { callback(); }
}
wrapper.back = function(callback){
	wrapper.now.setMonth(wrapper.now.getMonth()-1);
	wrapper.innerHTML = '';
	wrapper.Set();
	if(callback) { callback(); }
}

wrapper.goto = function(y, m, callback){
	wrapper.now.setFullYear(y);
	wrapper.now.setMonth(m - 1);
	wrapper.now.setDate(1);
	wrapper.innerHTML = '';
	wrapper.Set();
	if(callback) { callback(); }
}

wrapper.Set();
return wrapper;
}


// Material design effects

(function(){
	function rn_filter(){
		var val = new RegExp( document.querySelectorAll('input.rn_searchable')[0].value,'gi' );
		var li = document.querySelectorAll('.mobilelist li, .filterable li,.rn_filterable li');
		for(var i=0; i<li.length; i++){
			li[i].style.display = li[i].innerHTML.strip().match(val)? '': 'none';
		}
	}

	function rn_addFilter(){
		var ip = document.querySelectorAll('form.rn_search_form input.rn_searchable');
		if(ip.length) {
			ip[0].addEventListener('input', rn_filter);
		}
		if(document.querySelectorAll('a.tucked,a.tuck').length) {
			document.addEventListener('scroll', function(){
				var sel = '.rn_material_tools a,'+
					'.rn_material_btn,.rn_material_add,.rn_material_search';
				var a = document.querySelectorAll(sel)[0];
				if(document.body.scrollTop == 0) {
					a.classList.remove('tucked');
				} else if( (document.body.scrollTop > document.body.hasScrolled) ) {
					a.classList.add('tucked');
				} else {
					a.classList.remove('tucked');
				}
				document.body.hasScrolled = document.body.scrollTop;
			});
			if( document.querySelectorAll('a.tucked').length ) 
				document.querySelectorAll('a.tucked')[0].classList.remove('tucked');
		}
	}

	document.addEventListener('DOMContentLoaded', rn_addFilter);
})();

// User form input
function form(fields, ttl, callback, onCancel, opts){
	opts = opts || {autocomplete: 'off', capitalize: 'off'};

	if(document.querySelectorAll('.rn_form').length){
		document.querySelectorAll('.rn_form')[0].parentNode.removeChild(
			document.querySelectorAll('.rn_form')[0]);
	}
	onCancel = onCancel || function(){}
	function $(el){ return document.getElementById(el); }
	function $$(sel){ return document.querySelectorAll(sel); }
	function $E(tag, atts){
		var el = document.createElement(tag);
		for(every in atts){ el[every] = atts[every]; }
			el.addKids = function(kids){
				for(var i=0; i<kids.length; i++){
					el.appendChild(kids[i]);
				}
				return el;
			}
		return el;
	}

	var wrapper = new $E('div',{className:'rn_form'});
	if(!opts.scroll || opts.scroll != false) {
		wrapper.rn_scrolled = document.body.scrollTop || document.documentElement.scrollTop;
		document.body.scrollTop = document.documentElement.scrollTop = wrapper.rn_scrolled;
	}
	document.body.scrollTop = document.documentElement.scrollTop = 0;
	wrapper.skin = new $E('div',{className:'rn_form_skin'});
	wrapper.dismiss = function(){
		wrapper.skin.classList.add('rn_form_hidden');
		setTimeout(function(){ 
			wrapper.parentNode.removeChild(wrapper); 
			if( !opts.scroll || opts.scroll != false) { 
				document.body.scrollTop = document.documentElement.scrollTop = wrapper.rn_scrolled; 
			}
		}, 600);
	}

	wrapper.onCancel = function(){
		wrapper.dismiss();
		setTimeout(onCancel, 600);
	}

	wrapper.fill = function(vals){
		var ips = $$('.rn_form')[0].querySelectorAll('[placeholder]');
		for(var i=0; i<vals.length; i++){
			ips[i].value = vals[i];
		}
		return wrapper;
	}

	wrapper.editField = function(name, newType){
		var ip = wrapper.querySelectorAll('[name="'+name+'"]')[0];
		var par = ip.parentNode;
		ip.setAttribute('type', newType);
		if(newType == 'textarea') {
			var ta = new $E('textarea',{name:ip.name, value:ip.value, placeholder:ip.placeholder});
			par.replaceChild(ta, ip);
		}
		return ip;
	}

	wrapper.addImage = function(imgSrc, onClick, onErr){
		if( !wrapper.poster )
			wrapper.poster = new $E('img',{className:'rn_form_poster'});
		if(onErr) {
			if(typeof onErr === 'string')
				wrapper.poster.onerror = function(){ wrapper.poster.src = onErr; }
			else
				wrapper.poster.onerror = function(){ onErr(this); };
		}
		wrapper.poster.src = imgSrc;
		if(onClick){
			wrapper.poster.addEventListener('click', onClick, false);
		}
		wrapper.subtext.parentNode.insertBefore(wrapper.poster, wrapper.subtext);
		return wrapper.poster;		
	}

	wrapper.textfield = function(ip){
		if(typeof ip == 'number') return wrapper.querySelectorAll('[placeholder]')[ip];
		return wrapper.querySelectorAll('[name="'+ip+'"],[placeholder="'+ip+'"]')[0];
	}

	wrapper.setValue = function(ip, val){
		if(typeof ip == 'number') wrapper.querySelectorAll('[placeholder]')[ip].value = val;
		else wrapper.querySelectorAll('[name="'+ip+'"],[placeholder="'+ip+'"]')[0].value = val;
	}

	wrapper.serialize = function(){
		wrapper.vals = {};
		wrapper.vals.formData = new FormData();
		var q = [];
		var ips = wrapper.querySelectorAll('[placeholder],.rn_form_value');
		for(var i=0; i<ips.length; i++){
			wrapper.vals[ips[i].name] = ips[i].value;
			q.push(ips[i].name +"="+ ips[i].value);
			wrapper.vals.formData.append(ips[i].name, ips[i].value);
		}
		wrapper.vals.query = q.join('&');
		callback(wrapper.vals);
		wrapper.dismiss();
	}

	wrapper.addSubtext = function(str){
		wrapper.subtext.innerHTML = str;
	}
	
	var ttldiv = new $E('div',{innerHTML:ttl, className:'rn_form_ttldiv'});
	wrapper.fieldset = new $E('fieldset');
	wrapper.subtext = new $E('div',{className:'rn_form_subtext', 
		innerHTML:(opts.subtext || '')});
	wrapper.btndiv = new $E('div',{className:'rn_form_btndiv'});

	wrapper.fieldset.appendChild(wrapper.subtext);

	for(var i=0; i<fields.length; i++){
		var ip = new $E('input',{type:'text', name:fields[i], 
			placeholder:fields[i], autocomplete:(opts.autocomplete || 'off'), 
			'autocapitalize': (opts.capitalize || 'off')});
		if(i == (fields.length-1)) {
			ip.addEventListener('keyup', function(evt){
				if(evt.keyCode == '13'){
					evt.target.parentNode.parentNode.serialize();
				}
			});
		}
		wrapper.fieldset.appendChild(ip);
	}

	wrapper.btndiv.addKids([
		new $E('button',{innerHTML:'OK', onclick:wrapper.serialize}),
		new $E('button',{innerHTML:'Cancel', onclick:wrapper.onCancel})
	]);

	wrapper.skin.appendChild(wrapper);
	wrapper.appendChild(ttldiv);
	wrapper.appendChild(wrapper.fieldset);
	wrapper.appendChild(wrapper.btndiv);
	document.body.appendChild(wrapper.skin);
	return wrapper;
}

// A quick notification system
function Growl(str, opts){
	var opts = opts || {};
	var wrapper;
	if(document.getElementById('rn_growl_wrapper')) {
		wrapper = document.getElementById('rn_growl_wrapper');
	} else {
		wrapper = document.createElement('div');
		wrapper.id = 'rn_growl_wrapper';
		document.body.appendChild(wrapper);
	}

	var msg = document.createElement('div');
	if(opts.color) msg.style.color = opts.color;
	msg.remove = function(){
		msg.parentNode.removeChild(msg);
	}
	msg.dismiss = function(){
		msg.classList.add('rn_growl_hidden');
		setTimeout(msg.remove, 500);
	}
	msg.className = 'rn_growl_msg';
	msg.innerHTML = str;
	if(opts.icon){ 
		msg.style.backgroundImage = 'url('+opts.icon+')';
		msg.classList.add('rn_has_icon');
	}
	wrapper.appendChild(msg);
	if(opts.timeout) {
		if( opts.timeout.match(/s/) ) {
			opts.timeout = opts.timeout.replace('s', '');
			opts.timeout = opts.timeout * 1000;
		}
	}
	setTimeout(msg.dismiss, opts.timeout || 3000);
}

// A modal indicator
function Indicator(){
	var x = document.documentElement.clientWidth/2 - 16;
	var wrapper = new $E('div',{className:'rn_indicator'});

	wrapper.dismiss = function(){
		wrapper.classList.add('rn_indicator_fade');
		setTimeout(wrapper.remove, 800);
	}

	wrapper.remove = function(){
		wrapper.parentNode.removeChild(wrapper);
	}
	wrapper.spinner = new $E('span',{className:'rn_indicator_spinner'});
	wrapper.appendChild(wrapper.spinner);
	document.body.appendChild(wrapper);
	return wrapper;
}

// An in-page logging system
function info(str, color){
	var infodiv;
	if(document.getElementById('rn_infodiv')) {
		infodiv = document.getElementById('rn_infodiv');
	} else {
		infodiv = document.createElement('div');
		infodiv.id = 'rn_infodiv';
		infodiv.dismiss = function(){
			infodiv.classList.add('rn_info_dismissed');
			setTimeout(function(){ infodiv.parentNode.removeChild(infodiv); }, 600);
		}
		infodiv.closer = document.createElement('img');
		infodiv.closer.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAABmJLR0QA%2FwD%2FAP%2BgvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH1wQGEggCKnHjEQAAAAh0RVh0Q29tbWVudAD2zJa%2FAAAADElEQVR42mNgoBMAAABpAAEvwz4LAAAAAElFTkSuQmCC";
		infodiv.closer.className = 'rn_infodiv_closer';
		infodiv.closer.onclick = infodiv.dismiss;
		infodiv.appendChild(infodiv.closer);
		document.body.appendChild(infodiv);
	}

	var infoline = document.createElement('div');
	infoline.className = 'rn_infodiv_line';
	infoline.innerHTML = str;
	if(color) { infoline.style.color = color; }
	infodiv.appendChild(infoline);
	return str;
}


// Control page menus
document.addEventListener('DOMContentLoaded', function(){
	if(document.querySelectorAll('.rn_app_menu_btn').length) {
		document.querySelectorAll('.rn_app_menu_btn')[0].innerHTML = '<span></span>';
		document.querySelectorAll('.rn_app_menu')[0].show = function(){
			var menu = document.querySelectorAll('.rn_app_menu')[0];
			var btn = document.querySelectorAll('.rn_app_menu_btn')[0];
			menu.classList.add('show');
			btn.classList.add('show');
		}
		document.querySelectorAll('.rn_app_menu')[0].hide = function(){
			var menu = document.querySelectorAll('.rn_app_menu')[0];
			var btn = document.querySelectorAll('.rn_app_menu_btn')[0];
			menu.classList.remove('show');
			btn.classList.remove('show');
		}
		document.querySelectorAll('.rn_app_menu')[0].show = function(){
			var menu = document.querySelectorAll('.rn_app_menu')[0];
			var btn = document.querySelectorAll('.rn_app_menu_btn')[0];
			menu.classList.add('show');
			btn.classList.add('show');
		}
		var btn = document.querySelectorAll('.rn_app_menu_btn')[0];
		btn.onOpen = function(){}
		btn.onClose = function(){}
		btn.addEventListener('click', function(){
			var menu = document.querySelectorAll('.rn_app_menu')[0];
			if(menu && menu.classList.contains('show')) {
				menu.classList.remove('show');
				btn.classList.remove('show');
				return btn.onClose();
			}
			menu.classList.add('show');
			btn.classList.add('show');
			btn.onOpen();
		}, false);
	}
	if(document.querySelectorAll('.rn_app_menu').length){
		function stretch(){
			var menu = document.querySelectorAll('.rn_app_menu')[0];
			var dh = document.documentElement.clientHeight -
				(document.querySelectorAll('header').length? 
				document.querySelectorAll('header')[0].offsetHeight: 38);
			menu.style.minHeight = dh + 'px';
		}
		stretch();
		window.addEventListener('resize', stretch, false);
	}
}, false);

// A simple image preview library
if(document.querySelectorAll('script[src$="popbox.js?css"]').length){
	document.write('<link rel="stylesheet" type="text/css" href="/css/popbox.css" />');
	document.close();
}
// Gesture control for touchscreen devices
Element.prototype.addGesture = function(gesture, callback){
	var elmnt = this;
	function start(evt){
		if(evt.targetTouches.length > 1){// 2 or more fingers touching
			evt.target.xCoord = evt.targetTouches[0].pageX;
			evt.target.yCoord = evt.targetTouches[0].pageY;
			document.documentElement.touching = evt.target;
			
		}
	}

	var stop = {
		"swipeRight": function(evt){
			if(document.documentElement.touching) {
				elmnt = document.documentElement.touching;
				if(evt.touches[0].pageX > elmnt.xCoord){
					document.documentElement.touching = null;
					callback(elmnt);
				}
			}
		},
		"swipeLeft": function(evt){
			if(document.documentElement.touching) {
				elmnt = document.documentElement.touching;
				if(evt.touches[0].pageX < elmnt.xCoord){
					document.documentElement.touching = null;
					callback(elmnt);
				}
			}
		},
		"swipeUp": function(evt){
			if(document.documentElement.touching) {
				elmnt = document.documentElement.touching;
				if(evt.touches[0].pageY < elmnt.yCoord){
					document.documentElement.touching = null;
					callback(elmnt);
				}
			}
		},
		"swipeDown": function(evt){
			if(document.documentElement.touching) {
				elmnt = document.documentElement.touching;
				if(evt.touches[0].pageY > elmnt.yCoord){
					document.documentElement.touching = null;
					callback(elmnt);
				}
			}
		}
	}
	elmnt.addEventListener('touchstart', start, false);
	elmnt.addEventListener('touchmove', stop[gesture], false);
}

void(function(){
	function view(a){
		var shadowWidth = document.documentElement.clientWidth;
		var shadowHeight = 60 + document.documentElement.clientHeight;
		var wrapper = new $E('div',{className:'rn_popbox'});
		wrapper.remove = function(){
			wrapper.parentNode.removeChild(wrapper);
		}
		wrapper.dismiss = function(){
			wrapper.classList.add('rn_popbox_fade');
			setTimeout(wrapper.remove, 600);
		}
		wrapper.ttl = new $E('div',{className:'rn_popbox_ttl', 
			innerHTML:(a.title || '')});
		wrapper.image = new $E('img',{className:'rn_popbox_image', 
			src:a.href, alt:(a.title || "")});
		if(a.title)
			wrapper.appendChild(wrapper.ttl);
		wrapper.appendChild(wrapper.image);

		wrapper.image.addGesture('swipeLeft', wrapper.dismiss);

		wrapper.addEventListener('click', function(evt){
			if(evt.target.className == 'rn_popbox'){
				evt.target.dismiss();
			}
		}, false);

		wrapper.style.height = shadowHeight + 'px';
		document.body.appendChild(wrapper);
		return false;
	}

	function resetSize(){
		if($$('.rn_popbox').length){
			var shadowHeight = document.documentElement.clientHeight;
			$$('.rn_popbox')[0].style.height = shadowHeight + 'px';
		}
	}

	window.rn_popbox_init = function(){
		var pops = $$('[rel="popbox"],[data-popbox]');
		for(var i=0; i<pops.length; i++){
			pops[i].onclick = function(){ return view(this); };
		}
		document.documentElement.addEventListener('keyup', function(evt){
			if(evt.keyCode == '27' && $$('.rn_popbox').length){
				$$('.rn_popbox')[0].dismiss();
			}
		}, false);
	}

	document.addEventListener('DOMContentLoaded', rn_popbox_init, false);
	window.addEventListener('resize', resetSize, false);
})();

// Simplify AJAX calls
function xhr(url, callback, onerror){
	var poststring = url.indexOf('?#')>-1? url.substring(url.indexOf('?#')+2): null;
	onerror = onerror || function(){}
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
    if (req.readyState == 4) {
      if (req.status == 200) {
        callback(req);
      } else {
        var statusText = (req.status == '0')? 'Error: Check your connection.': req.statusText;
        if(onerror && typeof onerror == 'string'){
          if(window.info){
            info(req.status + ' Error: '+ onerror, 'red');
          }
        } else {
      	 onerror([req.status, statusText, url]);
        }
      }
    }
  }
  req.open(url.indexOf('?#')>-1? "POST":"GET", url);
  if(url.indexOf('?#')>-1) {
	  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
	}
  req.send(poststring);
}