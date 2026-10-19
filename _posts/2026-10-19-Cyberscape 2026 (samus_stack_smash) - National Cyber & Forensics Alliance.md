---
layout: default
title: "Cyberscape 2026 (samus_stack_smash) - National Cyber & Forensics Alliance"
date: 2026-10-19
permalink: /write-ups/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance
category: write-ups
---

I had the opportunity to participate in Cyberscape 2026, a Capture The Flag (CTF) event conducted by the National Cyber & Forensics Alliance. It was my first-ever CTF event, marking a significant milestone in my journey towards mastering cybersecurity. In this write-up, I’ll go over my approach, the techniques I explored, and my overall process.

### Table of Contents

- [Binary Analysis](#binary-analysis)
- [Vulnerability Identification](#vulnerability-identification)
- [Exploit Development](#exploit-development)

### Binary Analysis

I began with binary analysis to study the binary format, architecture, and several basic traits of the executable file without running it. For this first analysis, I used various Linux utilities such as file and readelf so I could acquire details regarding the binary.

![file](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/file.png)

From the output of the file command, I saw that the binary is a 64-bit ELF executable made for the x86-64 architecture. The endian byte order is shown by the LSB label, which means the least significant byte comes first. The ELF executable is dynamically linked, so it needs libraries when it runs. The interpreter path, /lib64/ld-linux-x86-64.so.2, tells me which dynamic linker/loader is used to load those shared libraries. The Build ID gives an ID for this specific version of the binary. The stripped attribute means debugging symbols and extra symbol info have been removed, which makes reverse engineering harder. This first look helped me understand the binary’s format and features before going into the analysis.

Next, I examined the security mitigations to see which ones were turned on. The security mitigations included Stack Canary, PIE, and RELRO. I used the readelf tool to check the binary and see if there were signs of security protections. Understanding how these protections functioned helped me figure out how the program protected itself against various exploitation techniques.

![stack_canary](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/stack_canary.png)

I looked at the symbol table of the binary and noticed that the __stack_chk_fail symbol was missing, which means the binary might have been compiled without Stack Canary protection.

> **Note:** Since the binary is stripped, the absence of __stack_chk_fail from the symbol table does not prove that Stack Canary protection is disabled. To verify this, inspect the binary disassembly for Stack Canary protection checks.

![pie](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/pie.png)

I looked at the ELF header to see if PIE mitigation was turned on. The output showed Type: EXEC (Executable file), which means PIE mitigation was not turned on. Therefore, the executable’s main code normally loads at a fixed address rather than at a randomized base address.

![relro](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/relro.png)

Finally, I checked if RELRO protection was fully or partially enabled. The program header had a GNU_RELRO segment, but the dynamic section did not have the BIND_NOW flag. So, I concluded that partial RELRO was enabled.

### Vulnerability Identification

I opened the file in IDA Pro. I looked through the strings, functions, the export table, and other components. I also turned the assembly code into pseudocode. This helped me see the program’s logic and how it behaves.

![main_function](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/main_function.png)

While examining the pseudocode of the main function, I observed that it called other functions, such as sub_40128C(). Therefore, I navigated directly to that function to analyze its implementation and understand its role in the program.

![vulnerable_function](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/vulnerable_function.png)

During the analysis of the sub_40128C() function, I found a security issue: it uses the gets() function, which is unsafe. The function reads user input and stores it in a 32-byte buffer called v1, with no check to ensure the input doesn’t exceed that size. If someone provides input longer than 32 bytes, it can overflow the buffer. This overflow happens on the stack and can compromise the program’s security, allowing an attacker to potentially take control of execution.

![flag_function](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/flag_function.png)

While exploring the functions, I discovered sub_40119B(__int64 a1), which appeared to be responsible for generating a flag. The corresponding flag.txt file was located in the root directory.

### Exploit Development

The challenge required exploiting a stack-based buffer overflow in the v1 buffer through the gets() function. By providing input that exceeded the buffer’s capacity, the objective was to redirect program execution to the sub_40119B(__int64 a1) function, passing the argument for authorization. Additionally, I needed to create a flag.txt file in the root directory containing a test string. The function reads up to 127 characters from this file into a buffer before printing its contents. If the exploit worked correctly, the flag would be displayed on my machine, confirming successful control-flow redirection.

![frame_pointer](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/frame_pointer.png)

In the sub_40119B(__int64 a1) function, the v1 buffer can hold 32 bytes of character data. The following 8 bytes hold the saved frame pointer, and the next 8 bytes hold the return address. I made a test input to see if the overflow could change the saved frame pointer. While debugging with GDB, I saw that the RBP register changed to 0x4242424242424242, proving that I had indeed overwritten the saved frame pointer. So, I thought that writing the next 8 bytes would let me change the return address and take control of the RIP register so that I could send program execution to the sub_40119B(__int64 a1) function.

![ropper_flag](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/ropper_flag.png)

Before writing the exploit, I first created a flag.txt file in the root directory. Since the x86-64 calling convention states that the first function argument is passed through the RDI register, my plan was to overwrite the saved return address with the address of a pop rdi; ret; gadget found using ropper, place the argument directly after the gadget address on the stack, and follow it with the address of the sub_40119B(__int64 a1) function.

![function_address](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/function_address.png)

I found address of sub_40119B(__int64 a1) function using IDA pro and the final exploit should be:

```c
#include <stdio.h>
#include <stdint.h>
#include <string.h>

int main(void)
{
    unsigned char buffer[64] = {0};

    // padding -> 32 bytes + 8 bytes
    memset(buffer, 'A', 32);
    memset(buffer + 32, 'B', 8);

    // pop rdi; ret; -> 0x0000000000401196
    uint64_t pop_rdi_ret = 0x0000000000401196;

    // authorization -> 0x43484F5A4F313031
    uint64_t authorization = 0x43484F5A4F313031;

    // function -> 0x000000000040119B
    uint64_t function = 0x000000000040119B;

    // copy addresses in little-endian byte order
    memcpy(buffer + 40, &pop_rdi_ret, sizeof(pop_rdi_ret));
    memcpy(buffer + 48, &authorization, sizeof(authorization));
    memcpy(buffer + 56, &function, sizeof(function));

    // print all 64 payload bytes
    for (size_t i = 0; i < sizeof(buffer); i++)
        printf("%c", buffer[i]);

    return 0;
}
```

![flag](/assets/images/cyberscape-2026-samus-stack-smash-national-cyber-&-forensics-alliance/flag.png)

After writing the exploit, I compiled it with gcc and piped its output directly into the binary. The payload successfully overflowed the buffer: pop rdi; pops the argument pointed to by the RSP register into the RDI register, and the subsequent ret; instruction pops the next address off the stack to jump straight into the sub_40119B(__int64 a1) function with the required argument in place, and flag was printed.

Happy Hacking :)
