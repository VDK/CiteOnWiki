const SCRIPTS_PATH = 'scripts';

function matchesHostname(host, match) {
    const index = host.indexOf(match);
    return index === -1 ? false : host.slice(index) === match;
}

// Promisified wrapper
function executeScript(tabId, code) {
    return new Promise((resolve) => {
        chrome.tabs.executeScript(tabId, { code }, resolve);
    });
}

function injectCss(tabId, modules) {
    const css = modules.map(m => m.css ? m.css : '');

    if (!css.length) {
        return;
    }

    console.log('Injecting CSS');

    chrome.tabs.insertCSS(tabId, {
        code : css.join('\n')
    });
}

// Yes, this is pretty much voodoo
function injectScripts(tabId, modules) {
    let scripts = modules.filter(m => !!m.js).map(m => m.src);

    if (!scripts.length) {
        return;
    }

    scripts = JSON.stringify(scripts);

    console.log('Injecting scripts');

    const code = `
        (function() {
            if (!document.querySelector('script[src*="nagfree-loader"]')) {
                const script = document.createElement('script');
                script.type = 'module';
                script.dataset.scripts = '${scripts}';
                script.src = '${chrome.runtime.getURL('nagfree-loader.js')}';
                document.querySelector('body').appendChild(script);
            }
        })();
    `;

    executeScript(tabId, code);
}

function getScriptsInDirectory(directory) {
    return new Promise((resolve, reject) => {
        chrome.runtime.getPackageDirectoryEntry((entry) => {
            entry.getDirectory(directory, { create : false }, (dir) => {
                const reader = dir.createReader();

                reader.readEntries((results) => {
                    // Only get stuff that ends in '.js'
                    results = results.filter(entry => entry.name.slice(-3) === '.js');

                    // And transform to a proper path
                    results = results.map(entry => `./${directory}/${entry.name}`);

                    resolve(results);
                });
            });
        })
    });
}

// Because this can happen multiple times, we can't make this a promise!
function onLoad(resolve) {
    chrome.webNavigation.onCompleted.addListener((details) => {
        const { tabId, url } = details;
        const hostname = new URL(url).hostname;
        resolve({ hostname, tabId, url });
    });
}

async function checkModule({ tabId, hostname, module }) {
    if (!module.host && !module.query) {
        console.log(`${module.src} has no host or query check!`);
    }

    // Check if the module has a hostname, and if the hostname is part of the
    // end of the tab's hostname
    if (module.host && matchesHostname(hostname, module.host)) {
        return module;
    }

    if (module.query) {
        const code = `!!document.querySelector('${module.query}');`;
        const result = await executeScript(tabId, code);
        return result[0] ? module : false;
    }

    return false;
}

async function loadModule(script) {
    const module = await import(script);
    module.default.src = script;
    return module.default.disabled ? false : module.default;
}

async function main() {
    let then = Date.now();

    console.log('Loading modules');
    let scripts = await getScriptsInDirectory(SCRIPTS_PATH);
    scripts = scripts.map(async (script) => await loadModule(script));
    let availableModules = scripts.length;
    console.log(`${availableModules} modules available`);

    let allModules = await Promise.all(scripts);

    // Remove modules that have a disabled flag
    allModules = allModules.filter(m => !!m);

    if (allModules.length !== availableModules) {
        console.log(`${availableModules - allModules.length} modules disabled`);
    }

    console.log(`Loading took ${Date.now() - then}ms`);

    // Note how we use an old fashioned callback here for onLoad instead of
    // a promise, because the background.js runs all the time but needs to
    // execute this stuff every time we have a page reload, we can't use a
    // promise because they only execute *once*.
    onLoad(async function({ hostname, tabId, url }) {
        let then = Date.now();

        // Loop through all modules and check if the host or query check
        // is valid for the current tab, after that filter that
        // to all the usable modules
        let modules = allModules.map(async function(module) {
            return await checkModule({ tabId, hostname, module });
        });

        modules = (await Promise.all(modules)).filter(m => !!m);

        if (modules.length > 0) {
            const moduleSrc = JSON.stringify(modules.map(m => m.src));
            console.log(`${modules.length} module(s) will be loaded for ${hostname}: ${moduleSrc}`);
            injectCss(tabId, modules);
            injectScripts(tabId, modules)
            console.log(`Injecting took ${Date.now() - then}ms`);
        }
    });
}


main();