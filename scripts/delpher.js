import {elementFromHtml, waitForSelector, getWikiText, paste0 } from '../utils.js';
const MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september','oktober','november', 'december'];
const HEADER_SELECTOR = '.js-object-view-side-bar';

function insertLabels(label, wikitext){
     var htmlRefPage1 =elementFromHtml( getCiteTextMobile(label, wikitext));
     $(htmlRefPage1).insertBefore($($('dl')[0]));

     var htmlRefPage2 =elementFromHtml( getCiteText(label, wikitext));
     $(htmlRefPage2).insertBefore($($('.object-view-menu__share-links-wrapper__details__items')[0]));

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

function main(){
   // for anything in here, $ will be jQuery
    // (function($) {
    var pubDate = $($( "li[data-testing-id='object__header__metadata--date']" )[0]).text();
    pubDate = new Date (pubDate.replace(/(\d+)-(\d+)-(\d+)/,'$2-$1-$3'));
    var pubDateNL = pubDate.getDate()+' '+MAANDEN[pubDate.getMonth()]+' '+pubDate.getFullYear();

    var publication = $($( "a[data-testing-id='search-result__papertitle--link']" )[0]).text().replace(/'/g, "\'");
    
    if($(".js-share-input-i4").length > 0){
        var articleTitel = $($( "a[data-testing-id='search-result__title--link']" )[0]).text();
        articleTitel = articleTitel.replace(/(.?\.).+/, "$1");
        var articleURL = $( ".js-share-input-i4" )[0].value;
        if (articleURL != ""){
            insertLabels("Refereer aan dit artikel", getWikiText(articleURL, articleTitel, "", pubDate, "Delpher.nl", publication, "", "nl"));
        }

    }
   
    if($(".js-share-input-i3").length > 0){
        var pageURL =  $( ".js-share-input-i3" )[0].value
        var pageNr  = pageURL.replace(/.+(0+)?(\d+)$/,'$2');
        var pageTitle = (pageNr == "1" ? "Voorpagina ":"")+ publication + (pageNr != "1" ? ' p. '+ pageNr:"");
        
        insertLabels("Refereer aan deze pagina", getWikiText(pageURL, pageTitle, "", pubDate, "Delpher.nl", "", "", "nl"));
    }
    //datum "achterstevoren" schrijven in mobile view t.b.v. overzetten afbeeldingen naar Commons.
    $($( "a[data-testing-id='search-result__date--link']" )[0]).text(pubDate.getFullYear()+"-"+paste0(pubDate.getMonth()+1)+"-"+paste0(pubDate.getDate()));
    //datum voluit schrijven in header
    $($("li[data-testing-id='object__header__metadata--date']" )[0]).html('<a href="#" alt="'+pubDateNL+'">'+pubDateNL+'</a>');
// })(jQuery);
    
}

export default {
    host : 'delpher.nl',

    js : {
        run : main,
        runOnUrlChange : true,
        waitForSelector : HEADER_SELECTOR
    }
};