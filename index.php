<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" type="text/css" href="css/milligram.css">
<style type="text/css">
#main{
	border:1px solid red;
	height: 500px; 
	margin: 1rem;
	overflow: scroll;
	background: #F4EFD0;

}
ul li{
	border:1px solid #BAF2C2;
	margin-top: 10px;
	background:#BAF2C2;
	list-style: none;
	
}
ul li h4{
	font-size: 2rem;
	color: white;
}
ul li h4 a:link{color:black;}
.date{
	margin: 0;
	font-size: 14px;
	color: white;
}
#news{
	position: relative;
}

</style>
<script type="text/javascript" src="js/jquery.js"></script>
<script language="javascript" type="text/javascript" src="js/jquery.newsWidget.js"></script>
	<meta charset="UTF-8">
	<title>RSS Feed</title>
</head>
<body>
	<div class="container">
	<div class="row">
	<div class="column">




	</div>
	</div></div>

	<div class="container">
	<div class="row">
	<div class="column">
<h3 style="text-align: center;">Rss feed</h3>
	</div>
	</div></div>

<div class="container">
	<div class="row">
	<div class="column column-50" id="main">
<ul id="news">
	
</ul>


	</div>

	<div class="column column-50"  id="main">
	contain heree..........
	</div>
	</div></div>
	<script type="text/javascript"> 
        $('ul#news').newswidget({ source: ['http://rss.news.yahoo.com/rss/us', 'http://rss.news.yahoo.com/rss/world', 'http://feeds.bbci.co.uk/news/rss.xml'],
            proxyUrl: "get_rss_feed.php",
            limitItems: 10,
            itemWrapElement: 'li',
			itemTitleElement: 'h4',
            random: false,
            itemDateElement: "span",
            itemLinkElement: "span",
            itemWebsiteTitleElement: 'span',
            linkTitle: true,
            format: "title,date"});
    </script> 

</body>
</html>