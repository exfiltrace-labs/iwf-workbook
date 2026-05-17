# Introduction to Windows Forensics Lab Workbook

A hands-on companion to TCM Security Academy's **Introduction to Windows
Forensics** course. The workbook is a self-contained web app that you run
locally alongside the lessons.

## Quick start

Requirements: **Node.js 18 or newer** and a recent npm.

```bash
git clone https://github.com/exfiltrace-labs/iwf-workbook.git
cd iwf-workbook
npm install
npm run dev
```

Then open the URL provided by Vite (typically `http://localhost:5173`).
The home page lists every lab in the course, grouped by module.

To build and preview a production bundle:

```bash
npm run build
npm run preview
```

## Staying up to date

The workbook ships as a normal git repository. Pull new labs and bug
fixes the same way you would any other project:

```bash
git pull
npm install
```

The build hash shown in the footer of every workbook page comes from
`git rev-parse --short HEAD` at the moment you ran `npm run dev` or
`npm run build`, so you can tell at a glance whether you are on the
latest commit.

## How progress is saved

Every answer, every checklist item, and every interactive case state is
persisted to your browser's `localStorage` under per-lab keys. That
means:

- You can close the tab and resume mid-lab on the same machine.
- Switching browsers or wiping site data resets your progress.
- The "Reset all questions" button at the bottom of a workbook page
  clears persisted answers for that lab only.

The app has no external backend and does not require an internet connection.
