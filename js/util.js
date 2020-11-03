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

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function randomColor(seed) {
  return "#" + Math.round(mulberry32(seed)() * 0xFFFFFF).toString(16);
}