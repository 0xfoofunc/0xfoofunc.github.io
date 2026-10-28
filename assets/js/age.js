(function () {
    var el = document.getElementById("my_age");
    if (!el) return;

    el.style.display = "inline-block";
    el.style.width = "11.7ch";
    el.style.whiteSpace = "nowrap";
    el.style.textAlign = "left";
    el.style.fontVariantNumeric = "tabular-nums";

    var birth = new Date(2003, 5, 6).getTime();
    var msPerYear = 31557600000;
    var interval = 0;
    var last = "";
    var lastTick = -Infinity;

    (function tick(now) {
        if (now - lastTick >= interval) {
            lastTick = now;
            var s = ((Date.now() - birth) / msPerYear).toFixed(9);
            if (s !== last) {
                last = s;
                el.textContent = s;
            }
        }
        requestAnimationFrame(tick);
    })(0);
})();
