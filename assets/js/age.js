(function () {
    var el = document.getElementById("my_age");
    if (!el) return;
    var birth = new Date(2003, 5, 6).getTime(), msPerYear = 31557600000, last = "";
    (function tick() {
        var s = ((Date.now() - birth) / msPerYear).toFixed(9);
        if (s !== last) el.textContent = last = s;
        requestAnimationFrame(tick);
    })();
})();
