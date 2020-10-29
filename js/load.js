"use strict";

((scripts) => {
    function loadScript(scriptSrc) {
        return new Promise((resolve, reject) => {
            scriptSrc = scriptSrc;
            let scriptTag = document.createElement("script");
            let whenLoaded = () => {
                resolve(scriptSrc);
            };
            scriptTag.onload = whenLoaded;
            scriptTag.onreadystatechange = whenLoaded;
            scriptTag.onerror = () => {
                reject(scriptSrc);
            };
            scriptTag.src = scriptSrc;
            document.body.append(scriptTag);
        });
    }

    let scriptsLoaded = 0;
    let afterScriptLoaded = () => {
        if(scriptsLoaded < scripts.length) {
            loadScript(scripts[scriptsLoaded++]).then(afterScriptLoaded);
        } else {
            init();
        }
    }
    afterScriptLoaded();
})([
    "https://cdn.jsdelivr.net/npm/chart.js@2.9.4/dist/Chart.min.js",
    "https://code.createjs.com/1.0.0/createjs.min.js",
    "/js/util.js",
    "/js/models.js",
    "/js/init.js",
    "/js/pathing.js"
]);