/**
  * Easy to use RSS feed viewer. 
  * NewsWidget can even combine multiple RSS feeds and show the latest news items of these feeds.
  * 
  * @author Sitebase (Wim Mostmans)
  * @param
  * source: String array or string with RSS feeds to show
  * itemWrapElement: An html element that wraps each news item. For example li (default=li)
  * itemTitleElement: An html element that wraps each item title. For example div (default=h4)
  * linkTitle: Fill in true or false. If set to true the title will be a link. (default=false)
  * itemDescriptionElement: An html element that wraps each item description. For example div (default=div)
  * itemDateElement: An html element that wraps each item date. For example div (default=div)
  * itemLinkElement: An html element that wraps each item link. For example div (default=span)
  * itemWebsiteTitleElement: An html element that wraps each item website title. For example div (default=div)
  * itemWebsiteLinkElement: An html element that wraps each item website link. For example div (default=div)
  * newPageLink: Fill in "true" or "false". Open item link in new page? (default=true)
  * proxyUrl: Fill in the url to the proxy php script. For example http://yourwebsite.com/proxy.php. Default the script will look for proxy.php in the same directory as the page it's called from.
  * limitDescription: Limit the item description to x characters. Is this is set to 0 that means that there is no limit. (default=100)
  * limitDescriptionSuffix: If the description is cut off by the limitDescription setting, what suffix should be add to the description. (default=... or 3 dots)
  * limitItems: Number of items to show. When set to 0 there is no limit and all the items will be shown. (default=10)
  * stripHtml: Fill in "true" or "false". Strip html characters from the item description.
  * prettyDate: Fill in "true" or "false". If false that dates are displayed in full format. If true the dates are shown like "x days ago" or "last week"
  * format: Comma sepperated string of field you want to show. You can use these strings "title", "description", "date", "link", "websiteTitle", "websiteLink". With the order of the fields you can also define the order of the html elements. For example use "title,description,link" to show the title, description and the link of the RSS item.
  * animationSpeed: Speed of the fade in animation when the items are loaded. This should be set in miliseconds, so 1000 is an animation of 1 second. (default=500)
  * random: Fill in true or false. If set to true the shown items will be random. (default=false)
  * refresh: Time in miliseconds to refresh. If set to 0 the script will not refresh it's content.
  * showFilter: Fill in a function that is called before an items is show on the screen. In this function you can then modify the content before it is displayed. See the Example 4 where I used this to replace url's with clickable links. 
  */
(function($){
	$.fn.newswidget = function(options) {

		/**
		 * The dollar sign could be overwritten globally,
		 * but jQuery should always stay accesible
		 */
		var $ = jQuery;
	
		var defaults = {
		  	source: ['http://rss.news.yahoo.com/rss/us', 'http://rss.news.yahoo.com/rss/world', 'http://feeds.bbci.co.uk/news/rss.xml'],
			itemWrapElement: 'li',
			itemTitleElement: 'h4',
			linkTitle: false,
			itemDescriptionElement: 'div',
			itemDateElement: 'div',
			itemLinkElement: 'span',
			itemWebsiteTitleElement: 'div',
			itemWebsiteLinkElement: 'div',
			itemLinkText: 'read mores',
			newPageLink: true,
			proxyUrl: 'proxy.php',
			limitDescription: 100,
			limitDescriptionSuffix: "...",
			limitItems: 10,
			stripHtml: true,
			prettyDate: true,
			format: "title,description,date,link",
			animationSpeed: 500,
			random: true,
			refresh: 0,
			showFilter: function(){}
		  },
		settings = $.extend({}, defaults, options);
		
		// Variables
		var newsHolder 		= this;
		var items			= new Array();
		var busyRequests 	= 0;
		var timer;
			
		// Start script
		init();
			
		/**
		 * Init
		 */
		function init(){
		
			// Kill timer
			if(settings.refresh > 0){
				clearTimeout(timer);
			}
		
			if(isArray(settings.source)){
				busyRequests = settings.source.length;
				for( source in settings.source){
					load( settings.source[source] );
				}
			}else{
				busyRequests = 1;
				load( settings.source );
			}
		}
		
		function cleanText( text ){
			
			var cleanText = text;
		
			// Remove rubisch xml
			var index = cleanText.indexOf('&#60;?xml');
			if(index > -1){
				cleanText = cleanText.substring(0, index);
			}
			var index = cleanText.indexOf('<div class="feedflare">');
			if(index > -1){
				cleanText = cleanText.substring(0, index);
			}
			var index = cleanText.indexOf('<p>');
			if(index > -1){
				cleanText = cleanText.substring(0, index);
			}
			return cleanText;
		}
		
		/**
		 * Parse RSS XML content to an object array
		 */
		function parse(xml) {

				// Get rss title and website
				var channel = $('channel', xml).eq(0);
				var websiteTitle = $(channel).find('title:first').text();
				var websiteLink = $(channel).find('link:first').text();
			
				busyRequests--;
				$('item', xml).each( function() {
					var item 				= new Object();
					item.websiteTitle		= websiteTitle;
					item.websiteLink		= websiteLink;
					item.title				= $(this).find('title').eq(0).text();
					item.description		= cleanText($(this).find('description').eq(0).text());
					if(item.description == ""){
						item.description 	= cleanText($(this).find('content\\:encoded').eq(0).text());
					}
					if(settings.limitDescription > 0){
						
						item.description		= limitText(item.description, settings.limitDescription, settings.limitDescriptionSuffix);
					}
					if(settings.stripHtml){
						item.description = stripHtml( item.description );
					}
					item.date				= new Date($(this).find('pubDate').eq(0).text());
					item.linkUrl			= $(this).find('link').eq(0).text();
					item.linkText			= settings.itemLinkText == "" ? item.linkUrl : settings.itemLinkText;
					item.linkTarget			= settings.newPageLink ? ' target="_blank"' : '';
					
					// Call external filter
					settings.showFilter.call(item);
					
					items.push(item);
				});
				if(busyRequests == 0){
					if(settings.random){
						items.sort(sortByRandom);
					}else{
						items.sort(sortByDate);
					}
					
					// Show
					show(items);
					
					// Start timer (again)
					if(settings.refresh > 0){
						timer = setTimeout(init, settings.refresh);
					}
				}
		}
		
		// Show items in news holder
		function show( items ){
			
			// Variable
			var itemsDisplayed = 0;
			
			// Empty news holder
			newsHolder.html("");
			
			for(index in items){
				
				if(settings.limitItems > 0 && itemsDisplayed >= settings.limitItems) break;
			
				// Make item var
				var item = items[index];
			
				// Main item wrapper element
				var wrapElement				= document.createElement(settings.itemWrapElement);
				wrapElement.style.display	= 'none';
				wrapElement.id				= 'newsBlock' + index;
					
				// Create title element
				var titleElement			= document.createElement(settings.itemTitleElement);
				if(settings.linkTitle){
					titleElement.innerHTML	= '<a href="' + item.linkUrl + '"' + item.linkTarget + '>' + item.title + '</a>';
				}else{
					titleElement.innerHTML		= item.title;
				}
				titleElement.className		= "title";
					
				// Create description element
				var descElement				= document.createElement(settings.itemDescriptionElement);
				descElement.innerHTML		= item.description;
				descElement.className		= "description";
					
				// Create date element
				var dateElement				= document.createElement(settings.itemDateElement);
				if(settings.prettyDate){
					dateElement.innerHTML	= prettyDate( item.date );
				}else{
					dateElement.innerHTML	= item.date;
				}
				dateElement.className		= "date";
				
				// Create website title element
				var websiteTitleElement		= document.createElement(settings.itemWebsiteTitleElement);
				websiteTitleElement.innerHTML		= item.websiteTitle;
				websiteTitleElement.className		= "websiteTitle"
				
				// Create website link element
				var websiteLinkElement		= document.createElement(settings.itemWebsiteLinkElement);
				websiteLink 				= item.websiteLink.replace("http://", "")
				if(websiteLink.indexOf("/") > -1){
					websiteLink = websiteLink.substring(0, websiteLink.indexOf("/"));
				}
				websiteLinkElement.innerHTML	= '<a href="' + item.websiteLink + '" target="_blank" class="websiteLink">' + websiteLink + '</a>';
				websiteLinkElement.className	= "websiteLink";	
				
				// Create link element
				var linkElement				= document.createElement(settings.itemLinkElement);
				linkElement.innerHTML		= '<a href="' + item.linkUrl + '"' + item.linkTarget + '>' + item.linkText + '</a>';
				linkElement.className		= "link";	
				
				// Concat blocks
				var parts = settings.format.split(",");
				for(part in parts){
					switch(trim(parts[part])){
						case "title":
							wrapElement.appendChild( titleElement );
							break;
						case "description":
							if(descElement.innerHTML != ""){
								wrapElement.appendChild( descElement );
							}
							break;
						case "date":
							if(dateElement.innerHTML != "undefined"){
								wrapElement.appendChild( dateElement );
							}
							break;
						case "link":
							wrapElement.appendChild( linkElement );
							break;
						case "websiteTitle":
							wrapElement.appendChild( websiteTitleElement );
							break;
						case "websiteLink":
							wrapElement.appendChild( websiteLinkElement );
							break;
					}
				}

				// Add parent to main wrapper
				newsHolder.append( wrapElement );
				
				// Find block and fade in
				newsHolder.find("#newsBlock" + index).fadeIn(settings.animationSpeed);
				
				// Increment items displayed
				itemsDisplayed++;
				
			}
		}
		
		/**
		 * Convert dates to pretty format
		 */
		function prettyDate(date){
			var diff = (((new Date()).getTime() - date.getTime()) / 1000);
			var day_diff = Math.floor(diff / 86400);
					
			if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
				return;
					
			return day_diff == 0 && (
					diff < 60 && "just now" ||
					diff < 120 && "1 minute ago" ||
					diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
					diff < 7200 && "1 hour ago" ||
					diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
				day_diff == 1 && "Yesterday" ||
				day_diff < 7 && day_diff + " days ago" ||
				day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
		}

		
		/**
		 * Check if an object is of type array
		 */
		function isArray(object) {
		   if (object.constructor.toString().indexOf("Array") == -1)
			  return false;
		   else
			  return true;
		}
		
		/**
		 * Load RSS
		 */
		function load( source ){
			$.ajax({
				type: 'GET',
				url: settings.proxyUrl + '?url=' + source,
				dataType: 'xml',
				success: parse
			});
		}

		/**
		 * Sort RSS items by date
		 */
		function sortByDate(a, b) {
			var x = a.date;
			var y = b.date;
			return ((x > y) ? -1 : ((x < y) ? 1 : 0));
		}
		
		/**
		 * Sort RSS items random
		 */
		function sortByRandom(){
			return (Math.round(Math.random())-0.5); 
		} 
		
		/**
		 * Limit text
		 */
		function limitText( text, limit, suffix ){
			if(text.length > limit){
				text = text.substr(0, limit) + suffix;
			}
			return text;
		}
		
		/**
		 * Strip HTML
		 */
		function stripHtml( text ){
			var matchTag = /<(?:.|\s)*?>/g;
			return text.replace(matchTag, "");
		}
		 
		 /**
		  * Trim spaces from a string
		  */
		function trim( text ) {
			 return text.replace(/^\s+|\s+$/g,"");
		}

		
		// returns the jQuery object to allow for chainability.
		return this;
	}
})(jQuery);

