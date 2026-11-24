(function () {
    var el = document.getElementById("my_age");

    if (!el) return;

    el.style.display = "inline-block";
    el.style.width = "11.7ch";
    el.style.whiteSpace = "nowrap";
    el.style.textAlign = "left";
    el.style.fontVariantNumeric = "tabular-nums";

    var dob = new Date(2003, 5, 6).getTime();
    var year = 31557600000;
    var prev = "";

    (function tick() {
        var age = ((Date.now() - dob) / year).toFixed(9);

        if (age !== prev) {
            prev = age;
            el.textContent = age;
        }

        requestAnimationFrame(tick);
    })();
})();
