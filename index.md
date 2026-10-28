---
title: Arunesh
layout: base
---

# Arunesh

I am <span id="my_age"></span> years old. Started playing Super Mario Bros. on the NES as a kid and, somehow, ended up breaking things for a living.

<b>Posts</b>
 
<ul class="post-list-wrapper">
  {%- for post in site.posts %}
  <li class="post-list">
    <span class="post-list-date"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%d %b %y" }}</time></span>
    <a class="post-list-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
  </li>
  {%- endfor %}
</ul>

If you want to reach out securely, grab my public key <a href="{{ '/assets/files/public_key.asc' | relative_url }}" download="public_key.asc">here</a> and check the fingerprint matches `0922 FB4F 7E86 4B4D 230F  9D8C C240 46EB BAE3 69C4` before you send anything.
