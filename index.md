---
layout: default
---

<p>An offensive security researcher who is <span id="my_age"></span> years old, specializing in reverse engineering and exploit development.</p>

<strong>Writeups:</strong>
<ul class="post-list">
    {% for post in site.categories.writeups %}
    <li>
        <span class="post-date">{{ post.date | date: "%d %b %Y" }}</span> - <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
    {% endfor %}
</ul>

<strong>Articles:</strong>
<ul class="post-list">
    {% for post in site.categories.articles %}
    <li>
        <span class="post-date">{{ post.date | date: "%d %b %Y" }}</span> - <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
    {% endfor %}
</ul>

<p>If you wish to communicate securely, verify fingerprint 85B3 AFD8 82CC 3CCB 44F3 78E6 2BDF F316 9A0E C8C2 against the <a href="{{ '/assets/key/public_key.asc' | relative_url }}" download="public_key.asc">public key</a>.</p>
