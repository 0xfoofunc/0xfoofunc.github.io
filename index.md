---
layout: default
---

As an offensive security researcher at <span id="my_age"></span>, my focus lies in reverse engineering, vulnerability research, exploit and malware development. You can find my writeups here:

<script>
    function age() {
        var a = new Date(2003, 5, 6);
        var b = new Date();
        var c = b - a;
        var d = c / (1000 * 60 * 60 * 24 * 365.25);
        document.getElementById("my_age").innerHTML = "" + Math.floor(d) + "." + (d % 1).toFixed(9).substr(2);
    }
    setInterval(age, 1);
</script>

{% for post in site.posts %}
{{ post.date | date: "%d %b %Y" }} - [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}

If you wish to communicate securely, verify fingerprint `85B3 AFD8 82CC 3CCB 44F3 78E6 2BDF F316 9A0E C8C2` against the <a href="{{ '/assets/key/public_key.asc' | relative_url }}" download="public_key.asc">public key</a>.
