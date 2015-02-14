(function () {
    window.obsjs = {};
    var useObjectObserve = obsjs.useObjectObserve = Object.observe && (!window.hasOwnProperty("useObjectObserve") || window.useObjectObserve);