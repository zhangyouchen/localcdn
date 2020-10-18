window.FontAwesomeConfig = {
  asyncEnabled: true,
  autoAccessibilityEnabled: true,
  reportingEnabled: true,

  reportingDomains: "localhost, *.dev",

  useUrl: "use.fontawesome.com",
  faCdnUrl: "https://cdn.fontawesome.com:443",
  code: "fa-loader",
  webFontLoaderVersion: "1.6.24"
};
window.FontAwesome||(window.FontAwesome={}),function(){function a(a){this.el=a;for(var b=a.className.replace(/^\s+|\s+$/g,"").split(/\s+/),c=0;c<b.length;c++)d.call(this,b[c])}function b(a,b,c){Object.defineProperty?Object.defineProperty(a,b,{get:c}):a.__defineGetter__(b,c)}if(!("undefined"==typeof window.Element||"classList"in document.documentElement)){var c=Array.prototype,d=c.push,e=c.splice,f=c.join;a.prototype={add:function(a){this.contains(a)||(d.call(this,a),this.el.className=this.toString())},contains:function(a){return-1!=this.el.className.indexOf(a)},item:function(a){return this[a]||null},remove:function(a){if(this.contains(a)){for(var b=0;b<this.length&&this[b]!=a;b++);e.call(this,b,1),this.el.className=this.toString()}},toString:function(){return f.call(this," ")},toggle:function(a){return this.contains(a)?this.remove(a):this.add(a),this.contains(a)}},window.DOMTokenList=a,b(Element.prototype,"classList",function(){return new a(this)})}}(),function(a,b,c){function d(){}function e(a){var c,d=[],e=b,f=e.documentElement.doScroll,g="DOMContentLoaded",h=(f?/^loaded|^c/:/^loaded|^i|^c/).test(e.readyState);h||e.addEventListener(g,c=function(){for(e.removeEventListener(g,c),h=1;c=d.shift();)c()}),h?setTimeout(a,0):d.push(a)}function f(a){var b=!1;return p.split(",").forEach(function(c){var d=new RegExp(c.trim().replace(".","\\.").replace("*","(.*)"));a.match(d)&&(b=!0)}),b}function g(){var a,c,d,e=b.querySelectorAll(".fa");Array.prototype.forEach.call(e,function(e){a=e.getAttribute("title"),e.setAttribute("aria-hidden","true"),c=e.nextElementSibling?!e.nextElementSibling.classList.contains("sr-only"):!0,a&&c&&(d=b.createElement("span"),d.innerHTML=a,d.classList.add("sr-only"),e.parentNode.insertBefore(d,e.nextSibling))})}function h(a){"undefined"!=typeof MutationObserver&&new MutationObserver(a).observe(b,{childList:!0,subtree:!0})}function i(){var a=b.createElement("link");a.href="https://"+q+"/"+s+".css",a.media="all",a.rel="stylesheet",b.getElementsByTagName("head")[0].appendChild(a)}function j(){var c,e=b.createElement("script"),f={},g=b.scripts[0];a.WebFontConfig||(a.WebFontConfig={}),f=a.WebFontConfig,f.custom||(f.custom={}),f.custom.families||(f.custom.families=[]),f.custom.urls||(f.custom.urls=[]),f.custom.testStrings||(f.custom.testStrings={}),f.custom.families.push("FontAwesome"),f.custom.urls.push("https://"+q+"/"+s+".css"),f.custom.testStrings.FontAwesome="ï‰€",c=f.fontactive||d,f.fontactive=function(b,e){var f=(a.FontAwesomeHooks||{}).loaded||d;c(b,e),"FontAwesome"===b&&"n4"===e&&f()},e.src="https://"+q+"/webfontloader/"+t+"/webfontloader.js",g.parentNode.insertBefore(e,g)}function k(){var a=b.createElement("script"),c=b.scripts[0];a.src=r+"/js/stats.js",c.parentNode.appendChild(a)}function l(){return n&&(e(g),h(g)),o&&f(location.host)&&k(),m?j():i()}var m=a.FontAwesomeConfig.asyncEnabled,n=a.FontAwesomeConfig.autoAccessibilityEnabled,o=a.FontAwesomeConfig.reportingEnabled,p=a.FontAwesomeConfig.reportingDomains,q=a.FontAwesomeConfig.useUrl,r=a.FontAwesomeConfig.faCdnUrl,s=a.FontAwesomeConfig.code,t=a.FontAwesomeConfig.webFontLoaderVersion;a.FontAwesome.load=l}(this,document);try{window.FontAwesome.load()}catch(e){}
