define(["./box"], function (box) {
    if (window.XMLHttpRequest) {
        box.set("XHR", function () { return new XMLHttpRequest(); });
    } else if (window.ActiveXObject) {
        box.set("XHR", function () { return new ActiveXObject("Microsoft.XMLHTTP"); });
    }
});