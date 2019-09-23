const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function $(selector) {
    return document.querySelector(selector);
}

export function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
}

export function countWords(string) {
    return string.split(/\n/)
                 .map((l) => l.trim())
                 .filter((l) => l !== '')
                 .join('. ')
                 .split(/(\b[^\s]+\b)/)
                 .map((w) => w.trim())
                 .filter((w) => ['', '.', "'", ','].indexOf(w) === -1)
                 .length;
}

export function elementFromHtml(html) {
    const template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function tryFor(times = 10, timeout = 1000, fn) {
    function go() {
        fn();

        if (times > 0) {
            window.requestIdleCallback(go, { timeout });
        } else {
            times--;
        }
    }

    go();
}

export function waitFor(fn, timeout, tries = 10) {
    return new Promise((resolve, reject) => {
        function check() {
            if (fn() || tries === 0) {
                resolve();
            } else {
                tries--;
                window.requestIdleCallback(check, { timeout });
            }
        }

        check();
    });
}

export function waitForSelector(selector, timeout) {
    function check() {
        return !!$(selector);
    }

    return waitFor(check, timeout);
}

export class Storage {
    constructor(data) {
        this._store = window.localStorage;
        this._key = '__nagfree__';

        if (!!this._store.getItem(this._key)) {
            const jsonData = this._store.getItem(this._key);
            this._data = JSON.parse(jsonData);
        } else {
            this._data = data;
            this.save();
        }
    }

    get(key) {
        return this._data[key];
    }

    set(key, val) {
        this._data[key] = val;
        alert(JSON.stringify(this._data));
        this.save();
    }

    save() {
        const json = JSON.stringify(this._data);
        this._store.setItem(this._key, json);
    }
}
export function paste0(input){
    input ="0"+ input;
    input = input.slice(-2);
    return input;
}
function escapeString(input){
    input = input.replace(/'/g, "\'");
    input = input.replace(/"/g, "&quot;");
    return input;
}
export function getWikiText( url,title, author, pubDate, website,publisher,quote, language ){
    var today = new Date();
    var todayLabel = today.getDate() +' ' + MONTHS[today.getMonth()-1]+' '+today.getFullYear();   

   return escapeString("<ref>{{cite web"
     +"|url="+url
     +"|title="+title
     + (language != "" ? "|trans-title=  " :"")
     + (author != "" ? "|author= "+author:"")
     +"|date="+pubDate.getFullYear()+" "+MONTHS[pubDate.getMonth()]+" "+pubDate.getDate()
     + (website   != "" ? "|website= "+website:"")
     + (publisher != "" ? "|publisher= "+publisher:"")
     +"|access-date="+todayLabel
     + (quote    != "" ? "|quote= "+quote:"")
     + (language != "" ? "|language= "+language:"")
     +"}}</ref>");
   
}