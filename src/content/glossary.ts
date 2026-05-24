/**
 * Course-wide glossary. Add a term here once and every lab workbook will
 * automatically detect the first occurrence in the rendered article and
 * decorate it with a hover tooltip definition.
 *
 * Conventions:
 *  - `term` is what appears in the prose. Match is case-insensitive but
 *    whole-word, so "MFT" will not match inside "MFTRecord".
 *  - `aliases` lets one definition cover multiple spellings (e.g. "USB
 *    history" and "USBSTOR").
 *  - Keep definitions to one or two short sentences. The tooltip is small.
 *  - Definitions support a tiny inline-markdown subset:
 *      `code`, **bold**, *italic*, _italic_
 */
export interface GlossaryEntry {
  term: string
  aliases?: string[]
  definition: string
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Prefetch',
    definition:
      'Files Windows writes under `C:\\Windows\\Prefetch\\` to speed up program launches. For analysts they are **high-confidence** evidence that a program actually executed on the system.',
  },
  {
    term: 'Amcache',
    definition:
      'A registry hive (`Amcache.hve`) Windows uses to track program execution and installation history. Often *corroborates* Prefetch.',
  },
  {
    term: 'KAPE',
    definition:
      '**Kroll Artifact Parser and Extractor**: a popular triage collection tool that copies forensic artifacts off a live or imaged system to a holding location for offline analysis.',
  },
  {
    term: 'MFT',
    aliases: ['Master File Table'],
    definition:
      'The **Master File Table** is the index NTFS uses to track every file on a volume. Each entry records timestamps, size, and where the file content lives.',
  },
  {
    term: 'LNK',
    aliases: ['LNK file', 'shortcut file'],
    definition:
      'A Windows shortcut file (`.lnk`). Windows automatically creates LNK files when users open documents, capturing the original path, timestamps, and the volume the file came from.',
  },
  {
    term: 'USBSTOR',
    aliases: ['USB History'],
    definition:
      'A registry key (`HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR`) that records every USB mass-storage device ever connected to the system.',
  },
  {
    term: 'corroboration',
    definition:
      'When two or more *independent* sources tell the same story. Single-source claims are **leads**. Corroborated claims are **conclusions**.',
  },
  {
    term: 'chain of custody',
    definition:
      'The unbroken, documented record of who held a piece of evidence, when, and why, from seizure through analysis to disposition.',
  },
  {
    term: 'forensic image',
    aliases: ['forensically imaged'],
    definition:
      'A bit-for-bit copy of a storage device or memory, captured in a way that preserves the original data exactly. Analysts work from the image so the source evidence stays untouched.',
  },
  {
    term: 'order of volatility',
    definition:
      'The principle that during evidence collection you proceed from the most volatile data (CPU registers, RAM) to the least (archival media). Memory is captured before disk because power loss destroys it.',
  },
  {
    term: 'kernel driver',
    aliases: ['kernel-mode driver', 'kernel mode driver', 'device driver'],
    definition:
      'A privileged piece of code that runs in kernel mode alongside the operating system itself. Only kernel-mode code can address physical memory directly, which is why memory acquisition tools must install one.',
  },
  {
    term: 'NTP',
    aliases: ['Network Time Protocol'],
    definition:
      '**Network Time Protocol**: the standard for keeping system clocks synchronized to authoritative time sources. Forensic timestamps recorded against an NTP-synced clock are defensible. Timestamps from a drifted clock are not.',
  },
  {
    term: 'MACB',
    definition:
      'The four NTFS timestamps maintained for every file: **M**odified (last data write), **A**ccessed (last read), **C**hanged (metadata changed), and **B**irth (file created). Used in timeline analysis to reconstruct file activity.',
  },
  {
    term: 'avalanche effect',
    definition:
      'A property of cryptographic hash functions where any change to the input, no matter how small, produces a completely different-looking output.',
  },
  {
    term: 'Volume Shadow Copy',
    aliases: ['Volume Shadow Copies', 'VSS', 'shadow copy', 'shadow copies'],
    definition:
      'A point-in-time snapshot of a Windows volume, capturing the state of every file at the moment the snapshot was taken. Used by System Restore and backup tools, and forensically valuable for recovering historical or deleted file content.',
  },
  {
    term: 'hypervisor',
    definition:
      'Software that runs virtual machines on a host system, presenting each VM with its own virtual CPU, memory, and disk. Examples include **VMware Workstation/Fusion**, **VirtualBox**, and **Hyper-V**.',
  },
  {
    term: 'VM snapshot',
    aliases: ['VM snapshots'],
    definition:
      'A saved point-in-time state of a virtual machine that you can revert back to later. Used in the labs to keep a clean baseline and to recover quickly after a forensic technique alters the VM state.',
  },
  {
    term: 'TPM',
    aliases: ['Trusted Platform Module', 'TPM 2.0'],
    definition:
      '**Trusted Platform Module**: a tamper-resistant chip (or hypervisor-emulated equivalent) that stores cryptographic keys. Windows uses it to seal **BitLocker** volume keys, back **Windows Hello** authentication, and anchor the integrity measurements **Credential Guard** depends on.',
  },
  {
    term: 'OOBE',
    aliases: ['Out-of-Box Experience', 'out-of-box experience'],
    definition:
      '**Out-of-Box Experience**: the post-install Windows setup wizard that runs on the first boot of a fresh OS install. It collects regional settings, the user account, and the initial privacy toggles, writing them into the registry as Windows comes online.',
  },
  {
    term: 'JumpList',
    aliases: ['Jump List', 'JumpLists', 'Jump Lists'],
    definition:
      'A Windows shell artifact that stores per-application lists of recently-opened files. Each entry is essentially an embedded **LNK** record, making JumpLists a parallel "what did the user open" source alongside the `Recent\\` folder.',
  },
  {
    term: 'UserAssist',
    definition:
      'A registry key (`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\UserAssist`) that records each GUI program a user launches via Explorer, with a run count and last-execution timestamp. Often used alongside **Prefetch** and **Amcache** to corroborate program execution.',
  },
  {
    term: 'exfiltration',
    aliases: ['data exfiltration', 'IP exfiltration'],
    definition:
      'The unauthorized removal of data from a system or network, whether by USB, cloud sync, email, or another channel. A central concept in insider-threat and intellectual-property investigations.',
  },
  {
    term: 'cryptographic hash',
    aliases: ['hash', 'hash function'],
    definition:
      'A function that takes input of any size and produces a fixed-length output uniquely representing that input. In forensics, hashes are the foundation of **integrity verification**, file **identification** against reference sets, and **deduplication** of identical files across a dataset.',
  },
  {
    term: 'hash collision',
    definition:
      'Two different inputs producing the same hash output. Cryptographic hash functions are designed to make collisions infeasible. **MD5** and **SHA-1** are now broken in this sense (an attacker can construct deliberate collisions), which is why **SHA-256** is the modern default for forensic work.',
  },
  {
    term: 'acquisition',
    aliases: ['evidence acquisition', 'forensically acquired'],
    definition:
      'The act of capturing evidence (a disk image, memory dump, or live triage collection) in a way that preserves the original bytes exactly. The hash recorded at acquisition is what every later analyst checks their working copy against to prove nothing has changed in transit.',
  },
  {
    term: 'SHA-256',
    aliases: ['SHA256'],
    definition:
      'A 256-bit hash algorithm from the SHA-2 family. The modern default for forensic integrity verification, having displaced **MD5** and **SHA-1** once those were shown to be vulnerable to deliberate collision attacks.',
  },
  {
    term: 'SHA-1',
    aliases: ['SHA1'],
    definition:
      'A 160-bit hash algorithm. Considered cryptographically broken since 2017, when researchers demonstrated the first practical collision (the SHATTERED attack). Still acceptable for integrity verification of non-adversarial evidence, but not for any context where an attacker might craft inputs to attack the hash.',
  },
  {
    term: 'MD5',
    definition:
      'A 128-bit hash algorithm from the early 1990s. Considered cryptographically broken for collision resistance for over two decades, but still widely used in forensic workflows as a fast secondary check alongside **SHA-256**.',
  },
  {
    term: 'write-blocker',
    definition:
      'A device or driver that prevents any writes to a source storage device while it is being imaged or examined. Inserted between the suspect drive and the imaging workstation to guarantee the original bytes are never altered. Without one, simply mounting a Windows drive can modify timestamps and metadata, breaking integrity.',
  },
  {
    term: 'E01',
    definition:
      'The most common forensic image container format, originally from EnCase. An `.E01` file bundles the imaged sectors with embedded case metadata (examiner name, case number, notes), a recorded hash, and optional compression. Modern tools (FTK Imager, X-Ways, Autopsy, libewf) all read and write it.',
  },
  {
    term: 'working copy',
    definition:
      'A duplicate of evidence (typically a forensic image) that the analyst actually examines, leaving the original untouched in the evidence locker. Every analytical operation, parser, and tool runs against the working copy. If something corrupts or alters it, discard it and pull a fresh copy from the original.',
  },
  {
    term: 'tamper-evident bag',
    definition:
      'A sealed bag with a one-time-use closure that visibly fails (tears, color change, broken seal) if anyone opens it. Used to transport seized evidence so any unauthorized access is immediately apparent. Each bag carries an evidence tag with the case number, item description, and signatures.',
  },
  {
    term: 'file signature',
    aliases: ['magic header', 'magic bytes', 'magic number'],
    definition:
      'A fixed byte sequence at the start of a file (or sometimes at a known offset) that identifies its true format, independent of the filename or extension. JPEGs start with `FF D8 FF`, ZIP/Office archives with `50 4B 03 04`, PDFs with `25 50 44 46` (`%PDF`). Signature-based identification catches renamed files that filename-based searches would miss.',
  },
  {
    term: 'unallocated space',
    definition:
      'Disk space the filesystem currently considers free, but which often still contains the leftover bytes of previously-deleted files. Until something writes over the same physical sectors, that residual data persists on disk and is recoverable.',
  },
  {
    term: 'file carving',
    aliases: ['data carving'],
    definition:
      'Recovering files from raw bytes by locating known file signatures, parsing forward through the file structure, and extracting everything in between. Works even when the filesystem no longer references the file, which makes it the standard technique for pulling deleted content out of unallocated space and disk slack.',
  },
  {
    term: 'endianness',
    definition:
      'The order in which multi-byte values are stored. Reading a value with the wrong endianness gives a completely different number.',
  },
  {
    term: 'little-endian',
    aliases: ['little endian'],
    definition:
      'Byte order that stores the least-significant byte first. The four bytes `DE AD BE EF` on disk represent the 32-bit value `0xEFBEADDE` in little-endian. Windows and x86/x64 are little-endian, so almost every Windows on-disk artifact uses this order.',
  },
  {
    term: 'big-endian',
    aliases: ['big endian'],
    definition:
      'Byte order that stores the most-significant byte first. The four bytes `DE AD BE EF` on disk represent the 32-bit value `0xDEADBEEF` in big-endian. Common in network protocols and some file formats (notably **EXIF** inside JPEGs, which can be either endianness depending on the encoder).',
  },
  {
    term: 'EXIF',
    aliases: ['EXIF metadata', 'Exif'],
    definition:
      'Embedded metadata inside image files (JPEG, TIFF, HEIC, and others) that records what device took the photo, when the shutter clicked (with subsecond precision and a timezone offset), and (if location services were on) where in the world. Independent of filesystem timestamps, so it survives copies, renames, and transfers between machines.',
  },
  {
    term: 'registry hive',
    definition:
      'A binary file on disk holding one branch of the Windows registry tree. The major hives are `SOFTWARE` (installed apps and OS metadata), `SYSTEM` (hardware, services, USB history), `SAM` (local user accounts), `SECURITY` (security policy), and per-user `NTUSER.DAT` / `UsrClass.dat`. Hives are locked while Windows is running, which is why forensic tools parse them offline from a collected copy.',
  },
  {
    term: 'FILETIME',
    definition:
      'A 64-bit Windows timestamp format storing the number of 100-nanosecond intervals since January 1, 1601 (UTC). It is the standard timestamp type across the registry, the NTFS `$MFT`, Prefetch files, LNKs, and most Windows on-disk artifacts. Always in UTC, so it never needs timezone conversion the way local-time text logs do.',
  },
  {
    term: 'SID',
    definition:
      'A **Security Identifier**, a variable-length string of the form `S-1-5-21-<domain>-<RID>` that uniquely identifies a user, group, or other security principal on a Windows system. The `<RID>` (relative identifier) starting at `1000` marks ordinary locally-created accounts (built-in Administrator is `500`, Guest is `501`). Many artifacts (Recycle Bin subfolders, registry hive ownership, ACLs) are keyed by SID rather than username.',
  },
  {
    term: 'triage collection',
    definition:
      'A curated set of forensically-relevant files pulled from a running system using a tool like **KAPE**, captured via predefined paths rather than as a bit-for-bit disk image. Small, fast, and sufficient for most artifact-level questions. Modern incident response usually starts here and escalates to a full disk image only when triage isn\'t enough.',
  },
  {
    term: 'VHDX',
    definition:
      'A Microsoft virtual hard disk container format that Windows can mount natively by double-clicking the file. Used by Hyper-V for VM storage and by triage tools like **KAPE** to package a collection as a single mountable container that mirrors the source filesystem structure when opened.',
  },
  {
    term: 'cmdlet',
    definition:
      'A PowerShell command, always named in `Verb-Noun` form (`Get-ChildItem`, `Set-ItemProperty`, `Remove-MpPreference`, etc.). Cmdlets return structured objects rather than text, which is what lets PowerShell pipelines filter, sort, and select properties without re-parsing output between stages. The vocabulary is self-documenting: `Get-` retrieves, `Set-` modifies, `New-` creates, `Remove-` deletes.',
  },
  {
    term: 'Timeline Explorer',
    definition:
      'Eric Zimmerman\'s CSV viewer designed for forensic output. A spreadsheet-like grid with built-in per-column filtering, in-place search, grouping, and the ability to handle the multi-million-row CSVs that tools like **PECmd**, **LECmd**, and **MFTECmd** routinely produce. The standard answer for "what do I use to look at this CSV" on a forensic workstation.',
  },
  {
    term: 'NTUSER.DAT',
    definition:
      'The per-user **registry hive** stored at `C:\\Users\\<username>\\NTUSER.DAT`. Holds the user\'s `HKEY_CURRENT_USER` state: recent documents (`RunMRU`), launched applications (`UserAssist`), shellbags, typed paths, and many other per-user artifacts. Parsing it offline from a forensic image recovers the user\'s interaction history with the system.',
  },
  {
    term: 'live acquisition',
    definition:
      'Collecting evidence from a system while it is still running, as opposed to **dead acquisition** (after shutdown). Required for memory, for decrypted volume content on encrypted systems, and for anything else that exists only in RAM. Trades off some forensic purity (the acquisition itself leaves a footprint) for access to volatile evidence.',
  },
  {
    term: 'BitLocker',
    definition:
      'Microsoft\'s built-in full-disk encryption product. Standard on Windows Pro/Enterprise and increasingly enabled by default on modern installs. When BitLocker is on and the system is locked, the disk is unreadable without a key protector (**TPM**, password, recovery key, etc.). Detection has to happen *before* shutdown, because the unlocked-volume keys live in RAM.',
  },
  {
    term: 'dead acquisition',
    definition:
      'Collecting evidence from a system that has been powered off, typically by removing the drive, attaching it through a **write-blocker**, and imaging it on an examiner workstation. The cleanest acquisition path because there is no examiner footprint on the suspect system, but only available when the disk content can be read without a live decryption context.',
  },
  {
    term: 'forensically sound',
    definition:
      'An acquisition or analysis process that preserves the original evidence exactly, is reproducible, and can be defended in court. The two practical pillars: nothing modifies the source bytes during acquisition (**write-blocker** or live read-only path), and the result is hash-verified against the source so any later corruption or tampering is detectable.',
  },
  {
    term: 'NullMRU',
    definition:
      'This is a **placeholder term** used by the lab workbook to show how glossary tooltips work. It is not a real forensic artifact!',
  },
]
