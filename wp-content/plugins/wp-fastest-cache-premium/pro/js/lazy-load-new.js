var Wpfc_Lazyload = {
	sources: [],
	osl: 0,
	init: function(){
		Wpfc_Lazyload.set_source();

		window.addEventListener('load', function(){
			window.addEventListener("DOMSubtreeModified", function(e){
				Wpfc_Lazyload.osl = Wpfc_Lazyload.sources.length;Wpfc_Lazyload.set_source();
				if(Wpfc_Lazyload.sources.length > Wpfc_Lazyload.osl){Wpfc_Lazyload.load_sources(false);}
			},false);
			
			Wpfcll.load_sources(true);
		});
		window.addEventListener('scroll', function(){Wpfc_Lazyload.load_sources(false);});
		window.addEventListener('resize', function(){Wpfc_Lazyload.load_sources(false);});
		window.addEventListener('click', function(){Wpfc_Lazyload.load_sources(false);});
	},
	c: function(e, pageload){
		var winH = document.documentElement.clientHeight || body.clientHeight;
		var number = pageload ? 0 : 800;
		var elemRect = e.getBoundingClientRect();
		var top = 0;
		var parentOfE = e.parentNode;

		if(typeof parentOfE.getBoundingClientRect == "undefined"){
			var parentRect = false;
		}else{
			var parentRect = parentOfE.getBoundingClientRect();
		}

		if(elemRect.x == 0 && elemRect.y == 0){
			for(var i = 0; i < 10; i++){
				if(parentOfE){
					if(parentRect.x == 0 && parentRect.y == 0){
						parentOfE = parentOfE.parentNode;

						if(typeof parentOfE.getBoundingClientRect == "undefined"){
							parentRect = false;
						}else{
							parentRect = parentOfE.getBoundingClientRect();
						}
					}else{
						top = parentRect.top;
						break;
					}
				}
			};
		}else{
			top = elemRect.top;
		}


		if(winH - top + number > 0){
			return true;
		}

		return false;
	},
	r: function(e, pageload){
		var self = this;
		var originalsrc,originalsrcset;

		try{

			originalsrc = e.getAttribute("data-wpfc-original-src");
			originalsrcset = e.getAttribute("data-wpfc-original-srcset");

			if(originalsrc || originalsrcset){
				if(self.c(e, pageload)){
					if(originalsrc){
						e.setAttribute('src', originalsrc);
					}

					if(originalsrcset){
						e.setAttribute('srcset', originalsrcset);
					}

					e.removeAttribute("data-wpfc-original-src");
					e.removeAttribute("onload");

					if(e.tagName == "IFRAME"){
						e.onload = function(){
							if(typeof window.jQuery != "undefined"){if(jQuery.fn.fitVids){jQuery(e).parent().fitVids({ customSelector: "iframe[src]"});}}

							var s = e.getAttribute("src").match(/templates\/youtube\.html\#(.+)/);
							var y = "https://www.youtube.com/embed/";
							if(s){
								try{
									var i = e.contentDocument || e.contentWindow;
									if(i.location.href == "about:blank"){
										e.setAttribute('src',y+s[1]);
									}
								}catch(err){
									e.setAttribute('src',y+s[1]);
								}
							}
						}
					}
				}
			}

		}catch(error){
			console.log(error);
			console.log("==>", e);
		}
	},
	set_source: function(){
		var i = Array.prototype.slice.call(document.getElementsByTagName("img"));
		var f = Array.prototype.slice.call(document.getElementsByTagName("iframe"));

		this.sources = i.concat(f);
	},
	load_sources: function(pageload){
		var self = this;

		[].forEach.call(self.sources, function(e, index) {
			self.r(e, pageload);
		});
	}
};

document.addEventListener('DOMContentLoaded',function(){
	wpfcinit();
});

function wpfcinit(){
	Wpfc_Lazyload.init();
}