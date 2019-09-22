// Open open.spotify.com links in the desktop app instead of with the web client
// Based on < https://greasyfork.org/en/scripts/38920-spotify-open-in-app/code >
const  MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september','oktober','november', 'december'];
function sliceZero(input){
	//spaces out single digits with a leading zero
    var a ="0"+ input;
    a = a.slice(-2);
    return a;
}

function insertLabels(label, wikitext){
     var htmlRefPage1 =$.parseHTML( getCiteTextMobile(label, wikitext)), nn1 = [];
     $(htmlRefPage1[0]).insertBefore($($('dl')[0]));

     var htmlRefPage2 =$.parseHTML( getCiteText(label, wikitext)), nn2 = [];
     $(htmlRefPage2[0]).insertBefore($($('.object-view-menu__share-links-wrapper__details__items')[0]));
}
function getCiteText(label,input){
    var identifier = label.replace(/\s+/g,"");
    var html = '<div class="object-view-menu__share-links-wrapper__details__items">'+
				'<label for="'+identifier+'" class="object-view-menu__share-links-wrapper__details__items--label" >'+
					label+'</label>'+
				'<div id="'+identifier+'" class="object-view-menu__share-links-wrapper__details__items--link">'+
					'<input class="object-view-menu__share-links-wrapper__details__items--input" type="text" onclick="this.setSelectionRange(0, this.value.length)" onchange="$(this).val(\''+input+'\')" value="'+input+'" readonly="">'+
				'</div>'+
			'</div>';
    return html;

}
function getCiteTextMobile(label, input){
    var identifier = label.replace(/\s+/g,"");
    var html = '<span><label class="metadata__details-text-top metadata__details-persistent">'+
			label+'</label>'+
		'<div class="metadata__details-persistent">'+
			'<input type="text" onclick="this.setSelectionRange(0, this.value.length)" onchange="$(this).val(\''+input+'\')" class="js-share-input-i2 persistent-id metadata__details-persistent--input" value="'+input+'" readonly="" >'+
		'</div></span>';
    return html;
}



export default {
    host : 'delpher.nl',

    js() {
    var today = new Date();
    var todayNL = today.getDate() +' ' + MAANDEN[today.getMonth()-1]+' '+today.getFullYear();   
    var pubDate = $($( "li[data-testing-id='object__header__metadata--date']" )[0]).text();
    pubDate = new Date (pubDate.replace(/(\d+)-(\d+)-(\d+)/,'$2-$1-$3'));
    var pubDateNL = pubDate.getDate()+' '+MAANDEN[pubDate.getMonth()]+' '+pubDate.getFullYear();

    var publication = $($( "a[data-testing-id='search-result__papertitle--link']" )[0]).text().replace(/'/g, "\'");

    var articleTitel = $($( "a[data-testing-id='search-result__title--link']" )[0]).text();
    articleTitel = articleTitel.replace(/'/g, "\'");
    articleTitel = articleTitel.replace(/"/g, "&quot;");
    articleTitel = articleTitel.replace(/(.?\.).+/, "$1");
    var articleURL = $( ".js-share-input-i4" )[0].value;

    var pageURL =  $( ".js-share-input-i3" )[0].value
    var pageNr  = pageURL.replace(/.+(0+)?(\d+)$/,'$2');


    if ( articleURL != ''){
        var citeArticle = "<ref>{{Citeer web| titel = "+articleTitel
        +"| werk = "+publication
        +"| datum = "+pubDateNL
        +"| bezochtdatum ="+todayNL
        +"| url ="+articleURL
        +"}}</ref>";
        insertLabels("Refereer aan dit artikel", citeArticle);
    }
    var citePage = "<ref>{{Citeer web| titel = "+ (pageNr == "1" ? "Voorpagina ":"")+ publication + (pageNr != "1" ? ' p. '+ pageNr:"")
        +"| datum = "+pubDateNL
        +"| bezochtdatum ="+todayNL
        +"| url ="+pageURL
        +"}}</ref>";
    insertLabels("Refereer aan deze pagina", citePage);

    //datum "achterstevoren" schrijven in mobile view t.b.v. overzetten afbeeldingen naar Commons.
    $($( "a[data-testing-id='search-result__date--link']" )[0]).text(pubDate.getFullYear()+"-"+sliceZero(pubDate.getMonth()+1)+"-"+sliceZero(pubDate.getDate()));
    //datum voluit schrijven in header
    $($("li[data-testing-id='object__header__metadata--date']" )[0]).html('<a href="#" alt="'+pubDateNL+'">'+pubDateNL+'</a>');

    }
};