---
layout: default
---

As an offensive security researcher at <span id="my_age"></span>, my focus lies in reverse engineering, vulnerability research, exploit and malware development. You can find my writeups here:

<script>
    function me_when() {
        var a = new Date(2003, 06, 06);
        var b = new Date();
        var c = b - a;
        var d = c / (1000 * 60 * 60 * 24 * 365.25);
        document.getElementById("my_age").innerHTML = "" + Math.floor(d) + "." + (d % 1).toFixed(9).substr(2);
    }
    setInterval(me_when, 1);
</script>

{% for post in site.posts %}
{{ post.date | date: "%d %b %Y" }} - [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}

If you wish to communicate securely, Verify fingerprint 85B3 AFD8 82CC 3CCB 44F3  78E6 2BDF F316 9A0E C8C2 against the given public key:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----

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qX++
-----END PGP PUBLIC KEY BLOCK-----
```