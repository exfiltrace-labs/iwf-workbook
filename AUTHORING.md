# Lab Authoring Reference

## Frontmatter

```mdx
---
id: lab-2-1               # must match the directory name (src/content/labs/lab-2-1/)
moduleId: module-2        # references a module in src/content/modules
labNumber: Lab 2.1
title: Your Lab Title
order: 1                  # sort order within the module
readTime: 15 minutes
difficulty: beginner      # beginner | intermediate | advanced
description: One-line blurb shown on lab cards.
---
```

Question ids must be prefixed with the lab id (e.g. `lab-2-1-q1`) to keep localStorage keys unique across the course. The registry will throw at dev-server startup if two labs share a question id.

---

## Questions

State is persisted to localStorage and contributes to the lab's "n / total answered" header counter.

### Free text

```mdx
<Question id="lab-2-1-q1" label="Q1" type="text" accept="MFT, master file table">
  What does **MFT** stand for?

  <Hint>It is the heart of every NTFS volume.</Hint>
  <Solution>Master File Table, the index of every file and directory on an NTFS partition.</Solution>
</Question>
```

Props:
- `id` (required for persistence, must be globally unique)
- `label` short header tag like `Q1`, `Warm-up`
- `type` `"text"` (default), `"choice"`, or `"checkboxes"`
- `accept` comma-separated accepted answers, OR `answers={["a", "b"]}`
- `caseSensitive` defaults to `false`

### Single choice

```mdx
<Question id="lab-2-1-q2" label="Q2" type="choice">
  Which artifact survives a reboot?

  <Choice id="a">RAM</Choice>
  <Choice id="b" correct>The MFT</Choice>
  <Choice id="c">Open file handles</Choice>

  <Solution>The MFT lives on disk. The other two are volatile.</Solution>
</Question>
```

### Multi-select

```mdx
<Question id="lab-2-1-q3" label="Q3" type="checkboxes">
  Select **every** volatile artifact.

  <Choice id="a" correct>Running processes</Choice>
  <Choice id="b">Prefetch files</Choice>
  <Choice id="c" correct>Network connections</Choice>
  <Choice id="d">Registry hives on disk</Choice>
</Question>
```

---

## Callouts

```mdx
<Callout type="note">    By default this is a blue informational note. </Callout>
<Callout type="warning"> Amber, for things that can sink a case.        </Callout>
<Callout type="tip">     Green, for tradecraft and pro tips.            </Callout>
<Callout type="key">     Brand-colored "key takeaway" box.              </Callout>

<Callout type="warning" title="Custom title">
  Pass `title` to override the default header text.
</Callout>
```

---

## Definition (inline glossary tooltip)

**Reach for this only when you cannot reach for the global glossary.** Every term added to `src/content/glossary.ts` is auto-linked on first occurrence in any lab's prose, with no markup required from the author. That is the right home for any term worth defining more than once. Use `<Definition>` only when one of the following is true:

- The term is genuinely one-off and not worth a permanent registry entry.
- You want to override the global definition for a specific lab or paragraph.

Wrapping a term that is already in the global glossary will still render correctly (the auto-linker skips text inside `<Definition>` spans), but it duplicates content the registry already provides. Prefer adding the term to the registry once.

```mdx
The <Definition term="MFT">Master File Table, the index of every file on an NTFS volume.</Definition> is the heart of every NTFS partition.
```

---

## Checklist

State stored in localStorage. Every child must be a `<Check>` with a stable `id`.

```mdx
<Checklist id="lab-2-1-prep" title="Before you start">
  <Check id="vm">Snapshot your analysis VM.</Check>
  <Check id="evidence">Verify the evidence hash matches the case file.</Check>
  <Check id="notes">Open your case notes template.</Check>
</Checklist>
```

---

## Compare (Good vs. Bad)

```mdx
<Compare>
  <Good title="Defensible note">
    `2026-05-08 14:02 UTC, imaged \\.\PhysicalDrive0 to evidence.E01, SHA-256 verified.`
  </Good>
  <Bad title="Sloppy note">
    `imaged the laptop, looks fine`
  </Bad>
</Compare>
```

`title` is optional on each side; defaults are "Do this" / "Don't do this".

---

## Details (collapsible "go deeper")

Defaults to collapsed.

```mdx
<Details summary="Why FILETIME is 100-nanosecond ticks since 1601" eyebrow="Go deeper" defaultOpen={false}>
  Win32 FILETIME is a 64-bit count of 100ns intervals since 1601-01-01 UTC. The 1601 epoch lines up with...
</Details>
```

---

## Cite + references

Pass the source list to the workbook via the `references` prop on the page wrapper. Inline:

```mdx
The avalanche effect makes single-bit drift detectable<Cite id="nist-fips-180" />.
```

The `Cite` lookup is keyed by `id`, the rendered superscript is the source's 1-based index in the `references` array. Unknown ids render as `[?]` in red so you notice them in dev.

---

## Figure (image with optional caption + lightbox)

Plain markdown images auto-route through this component:

```mdx
![Prefetch directory listing](/img/prefetch-dir.png "Prefetch directory after first run")
```

Or use it directly when you want a `width` cap:

```mdx
<Figure
  src="/img/prefetch-dir.png"
  alt="Prefetch directory listing"
  caption="Prefetch directory after first run"
  width="32rem"
/>
```

Clicking the image opens a focus-trapped lightbox.

---

## Code blocks

Fenced code blocks auto-render through `CodeBlock` (copy button + language label). Add `title="..."` after the language for a filename header.

````mdx
```powershell title="windows.ps1"
certutil -hashfile sample.bin SHA256
```

```bash title="unix.sh"
sha256sum sample.bin
```
````

---

## Timeline

Children are `<TimelineEvent>` nodes.

```mdx
<Timeline caption="Reconstructed activity from Prefetch + USNJrnl">
  <TimelineEvent
    time="2026-05-08 09:14:22 UTC"
    title="`7zfm.exe` first run"
    source="Prefetch"
    tone="info"
  >
    Prefetch hash `7ZFM.EXE-0F1D5A3B.pf` records the first execution.
  </TimelineEvent>

  <TimelineEvent
    time="2026-05-08 09:14:38 UTC"
    title="USB device attached"
    source="USBSTOR"
    tone="warning"
  >
    Kingston DataTraveler 3.0, serial `0014780F1A2B&0`.
  </TimelineEvent>

  <TimelineEvent
    time="2026-05-08 09:21:05 UTC"
    title="Archive `payload.7z` written to removable volume"
    source="USNJrnl"
    tone="danger"
  />
</Timeline>
```

`TimelineEvent` props:
- `time` (required) timestamp/date label
- `title` (required) the headline
- `source` optional artifact-source pill (Prefetch, USBSTOR, MFT, ...)
- `tone` `"default"` | `"info"` | `"warning"` | `"danger"` (controls the source pill color)
- `children` optional body paragraph

---

## HexView

```mdx
<HexView
  bytes="4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00"
  offset={0}
  highlights={[
    { start: 0, length: 2, label: "PE 'MZ' magic" }
  ]}
  caption="First 16 bytes of a Windows PE file"
/>
```

`bytes` accepts a hex string ("4D 5A 90 00..." or "4D5A9000..."), a `number[]`, or a `Uint8Array`. `width` defaults to 16 bytes per row. `highlights[].color` overrides the default palette (forensic primary, sky, amber, red, emerald, cycled).

---

## RegistryTree

Use `<RegistryKey>` for keys (can nest) and `<RegistryValue>` for the table rows under a key.

```mdx
<RegistryTree caption="USBSTOR sub-keys after the Kingston attach">
  <RegistryKey name="HKLM\SYSTEM\CurrentControlSet\Enum\USBSTOR" defaultOpen>
    <RegistryKey name="Disk&Ven_Kingston&Prod_DataTraveler_3.0" highlight>
      <RegistryKey name="0014780F1A2B&0">
        <RegistryValue name="FriendlyName"   type="REG_SZ"    data="Kingston DataTraveler 3.0 USB Device" />
        <RegistryValue name="ContainerID"    type="REG_SZ"    data="{6f1a...e92b}" highlight />
        <RegistryValue name="Driver"         type="REG_SZ"    data="{36fc9e60-c465-11cf-8056-444553540000}\0001" />
      </RegistryKey>
    </RegistryKey>
  </RegistryKey>
</RegistryTree>
```

`defaultOpen` (key only) starts a key collapsed if false. `highlight` works on both keys and values to draw the eye.

---

## FileTree

Use `<TreeFolder>` for directories (can nest) and `<TreeFile>` for files.

```mdx
<FileTree caption="$Recycle.Bin layout for SID S-1-5-21-...-1001">
  <TreeFolder name="$Recycle.Bin" defaultOpen>
    <TreeFolder name="S-1-5-21-1234-5678-1001" highlight meta="3 items">
      <TreeFile name="$IB7CKQ2.docx" meta="84 KB · 2026-05-07" />
      <TreeFile name="$RB7CKQ2.docx" meta="84 KB · 2026-05-07" highlight />
      <TreeFile name="$IDELETED.tmp" meta="hidden" deleted />
    </TreeFolder>
  </TreeFolder>
</FileTree>
```

Folder props: `defaultOpen`, `highlight`, `meta` (right-aligned annotation like "8 items").
File props: `meta`, `highlight`, `deleted` (renders dimmed + strikethrough).

---

## Home-page-only components

These are registered in MDX but really only make sense on the workbook's home page (`src/content/home/index.mdx`):

- `<LabGrid />` renders all labs grouped by module. The home page uses it; you probably should not drop it inside a lab.
- `<ResumeCard />` shows the "resume your last lab" affordance.

---

## Quick reference: every available tag

| Tag                                | Purpose                                        |
|------------------------------------|------------------------------------------------|
| `<Question>` / `<Choice>`          | Persistent free-text or multiple-choice prompt |
| `<Hint>` / `<Solution>`            | Slots inside `<Question>`                      |
| `<Callout>`                        | Note / warning / tip / key takeaway box        |
| `<Definition>`                     | Inline glossary tooltip. Prefer the global glossary. Escape hatch only.   |
| `<Checklist>` / `<Check>`          | Persistent checkbox list                       |
| `<Compare>` / `<Good>` / `<Bad>`   | Side-by-side do/don't panels                   |
| `<Details>`                        | Collapsible "go deeper" section                |
| `<Cite>`                           | Numbered superscript citation marker           |
| `<Figure>`                         | Image with caption + lightbox                  |
| `<Timeline>` / `<TimelineEvent>`   | Vertical event rail                            |
| `<HexView>`                        | Hex dump with highlightable byte ranges        |
| `<RegistryTree>` / `<RegistryKey>` / `<RegistryValue>` | Registry Editor mockup       |
| `<FileTree>` / `<TreeFolder>` / `<TreeFile>`           | File Explorer mockup         |
| ` ```lang title="..." `            | Fenced code block with copy button             |
| `![alt](src "caption")`            | Image (auto-routes through `<Figure>`)         |
