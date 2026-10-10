---
layout: default
title: "Markdown Syntax & Style Guide 2"
date: 2026-06-06
permalink: /articles/markdown-style-guide-2/
category: articles
---

This page serves as a comprehensive test bench to verify CSS styling, typography, and layout rendering for all standard Kramdown/Jekyll elements on the site.

---

## Table of Contents

- [Typography & Headings](#typography--headings)
- [Text Formatting](#text-formatting)
- [Lists & Checklists](#lists--checklists)
- [Tables](#tables)
- [Blockquotes](#blockquotes)
- [Images & Media](#images--media)
- [Code](#code)
- [Footnotes](#footnotes)

---

## Typography & Headings

# Heading 1 (H1)
## Heading 2 (H2)
### Heading 3 (H3)
#### Heading 4 (H4)
##### Heading 5 (H5)
###### Heading 6 (H6)

![PCB Board](https://www.nintendojo.com/wp-content/uploads/2017/08/Sonic-Gif.gif)

Paragraphs are separated by a blank line. This text should test your `text-align: justify` rule from your CSS. When setting up a QEMU virtual machine to analyze kernel panics with `syzkaller` reproducers, ensuring the console output is properly captured is critical for root-cause analysis.

---

## Text Formatting

Standard inline formatting elements:

* **Bold text** using double asterisks.
* *Italic text* using single asterisks.
* ***Bold and Italic*** combined.
* ~~Strikethrough text~~ using double tildes.
* Inline `code blocks` for things like `objdump -d` or `e2fsck`.
* Keyboard inputs: press <kbd>Ctrl</kbd> + <kbd>C</kbd> to interrupt the reverse shell.
* Subscripts (H~2~O) and superscripts (2^10^).
* Highlighting <mark>important text</mark> using the HTML mark tag.

---

## Lists & Checklists

### Unordered List
* Exploit Development
* Reverse Engineering
  * Static Analysis (Ghidra, IDA Pro)
  * Dynamic Analysis (GDB, x64dbg)
* Hardware Hacking
* 
You can also make images act as links by wrapping the markdown:


```
qemu-system-x86_64 \
  -kernel bzImage \
  -append "console=ttyS0 root=/dev/sda earlyprintk=serial" \
  -hda raw_disk.img \
  -net user,hostfwd=tcp::10022-:22 \
  -net nic \
  -nographic \
  -m 2G \
  -smp 2
```

### Ordered List
1. Hardware Reconnaissance
2. Voltage level mapping (3.3V vs 5V logic)
3. Shell access
   1. Serial console (UART)
   2. Network daemon exploitation

### Task List
- [x] Measure UART pin logic voltages
- [x] Capture bootloader diagnostic logs via serial connection
- [x] Extract rootfs from TP-Link TL-WR840N firmware
- [ ] Write blind shell in C
- [ ] Test syzkaller crash reproducer via QEMU

---

## Tables

Tables test data alignment and overflow handling. 

| Architecture | Endianness | Instruction Length | Common Usage |
| :--- | :---: | :---: | ---: |
| **x86-64** | Little | Variable | Desktop / Server |
| **ARM32** | Bi-endian | Fixed (32-bit) / Thumb | Embedded / Mobile |
| **MIPS** | Bi-endian | Fixed (32-bit) | Routers / IoT |

---

## Blockquotes

Blockquotes are often used for callouts, warnings, or terminal output summaries.

> **Warning:** Do not connect the VCC pin from your USB-to-TTL adapter to the router's VCC pin if the router is already powered from the wall. You will fry the board.

You can also nest blockquotes for threaded discussions or deep context:

> U-Boot 1.1.4 (Oct 22 2018 - 14:23:11)
> > Board: Ralink APSoC DRAM:  32 MB
> > > Booting image at bc050000...

---

## Images & Media

Testing image constraints (`max-width: 100%; height: auto;`). 


![Macro photography of a PCB board](https://static0.howtogeekimages.com/wordpress/wp-content/uploads/wm/2025/11/img20251121150959.jpg?q=49&fit=crop&w=825&dpr=2)
*Caption: Close-up analysis of PCB traces and surface-mount components during hardware reconnaissance.*

---

## Code

```bash
#!/bin/bash

# ==============================================================================
# 1. FUNCTIONS & VARIABLES
# ==============================================================================
# Variables are assigned without spaces around '='
DEVELOPER_NAME="User" 

# Define a function with an argument
greet_user() {
    # $1 accesses the first argument passed to the function
    echo "Hello, $1! Welcome to the Bash sample script."
}

# Call the function and pass the variable
greet_user "$DEVELOPER_NAME"

# ==============================================================================
# 2. USER INPUT & CONDITIONALS
# ==============================================================================
echo "----------------------------------------"
echo -n "Would you like to run the countdown loop? (yes/no): "
read -r USER_CHOICE

# Convert input to lowercase to make it case-insensitive
USER_CHOICE="${USER_CHOICE,,}"

# 'if/else' syntax using string comparison
if [ "$USER_CHOICE" = "yes" ] || [ "$USER_CHOICE" = "y" ]; then
    echo "Proceeding to the loop..."
elif [ "$USER_CHOICE" = "no" ] || [ "$USER_CHOICE" = "n" ]; then
    echo "Skipping the loop execution."
else
    echo "Invalid input received. Defaulting to skip."
    # Set a variable flag to use later
    SKIP_LOOP=true
fi

# ==============================================================================
# 3. LOOPS & ARITHMETIC
# ==============================================================================
if [ "$SKIP_LOOP" != true ] && { [ "$USER_CHOICE" = "yes" ] || [ "$USER_CHOICE" = "y" ]; }; then
    echo "----------------------------------------"
    echo "Starting a standard 'for' loop:"
    
    # Simple 'for' loop counting down from 3 to 1
    for count in {3..1}; do
        echo "Counting... $count"
        sleep 0.5  # Pauses execution for half a second
    done

    echo "----------------------------------------"
    echo "Starting a 'while' loop with basic arithmetic:"
    
    index=1
    # Loop runs while 'index' is less than or equal to 3
    while [ $index -le 3 ]; do
        # Perform arithmetic evaluations using $(( ... ))
        square=$((index * index))
        echo "The square of $index is: $square"
        
        # Increment the index
        index=$((index + 1))
    done
fi

echo "----------------------------------------"
echo "Script finished successfully!"
```

# Multi-Language Syntax Highlighting Samples

This page serves as a test bench for language token highlighting across major programming languages.

---

## 1. C

```c
#include <stdio.h>

struct Greeter {
    const char *target;
};

void print_greeting(const struct Greeter *g) {
    int attempts = 1;
    printf("[%d] Hello, %s!\n", attempts, g->target);
}

int main(void) {
    struct Greeter greeter = { .target = "World" };
    print_greeting(&greeter);
    return 0;
}
```

---

## 2. C++

```cpp
#include <iostream>
#include <string>

class Greeter {
private:
    std::string target;

public:
    explicit Greeter(std::string name) : target(std::move(name)) {}

    void say_hello() const {
        int count = 1;
        std::cout << "[" << count << "] Hello, " << target << "!" << std::endl;
    }
};

int main() {
    Greeter greeter("World");
    greeter.say_hello();
    return 0;
}
```

---

## 3. Python

```python
class Greeter:
    def __init__(self, target: str):
        self.target = target

    def say_hello(self) -> None:
        count: int = 1
        print(f"[{count}] Hello, {self.target}!")

def main() -> None:
    greeter = Greeter("World")
    greeter.say_hello()

if __name__ == "__main__":
    main()
```

---

## 4. Bash

```bash
#!/usr/bin/env bash

set -euo pipefail

TARGET="World"

function print_hello() {
    local recipient="$1"
    local count=1
    echo "[${count}] Hello, ${recipient}!"
}

# Entrypoint
print_hello "${TARGET}"
```

---

## 5. x86-64 Assembly (NASM / Linux)

```nasm
global _start

section .rodata
    msg:    db "[1] Hello, World!", 10
    len:    equ $ - msg

section .text

print_message:
    mov rax, 1          ; sys_write
    mov rdi, 1          ; stdout
    mov rsi, msg        ; buffer pointer
    mov rdx, len        ; buffer length
    syscall
    ret

_start:
    call print_message

    mov rax, 60         ; sys_exit
    xor rdi, rdi        ; status code 0
    syscall
```

---

## 6. Ruby

```ruby
# frozen_string_literal: true

class Greeter
  attr_reader :target

  def initialize(target)
    @target = target
  end

  def say_hello
    count = 1
    puts "[#{count}] Hello, #{@target}!"
  end
end

greeter = Greeter.new("World")
greeter.say_hello
```
