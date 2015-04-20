(function (orienteer) {
    var busybody = {};
    var useObjectObserve = busybody.useObjectObserve = Object.observe && (!window.hasOwnProperty("useObjectObserve") || window.useObjectObserve);