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
    term: 'NullMRU',
    definition:
      'This is a **placeholder term** used by the lab workbook to show how glossary tooltips work. It is not a real forensic artifact!',
  },
]
