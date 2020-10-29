"use strict";

function getFile(url) {
    return new Promise((resolve, reject) => {
        let req = new XMLHttpRequest();
        req.onreadystatechange = function() { 
            if (req.readyState == 4) {
                if(req.status == 200) {
                    resolve(req.responseText);
                } else {
                    reject(req.status);
                }
            }
        }
        req.open("GET", url, true);
        req.send(null);
    });
}

function buildElement(type, classList = []) {
    let ele = document.createElement(type);
    if(classList.length > 0) {
        classList.forEach(clazz => {
           ele.classList.add(clazz); 
        });
    }
    return ele;
}