import type { CaseData } from './types'

/**
 * Lab 2.1 case data. The scenario, every artifact card, the rubric the
 * debrief grades against, and the narrative reveal all live here so the
 * UI components can stay focused on rendering.
 *
 * Story: Sarah Morgan submits her two-week notice on Friday afternoon and
 * exfiltrates proprietary design documents that same afternoon and again
 * over the weekend through three independent channels (USB, personal
 * cloud sync, work-to-personal email), then deletes the source files.
 * The case is intentionally a corroboration drill: every "yes" answer is
 * supported by at least two independent witness types.
 */

export const CASE: CaseData = {
  scenario: {
    title: 'Meridian Systems · Suspected IP Exfiltration',
    suspect: 'Sarah Morgan',
  },

  hrQuestions: [
    {
      id: 'q1',
      shortLabel: 'Q1',
      text: 'Did Sarah access any proprietary files after submitting her notice?',
      reinforcement:
        'No single artifact proved access on its own. Recent Files showed which proprietary files were opened. The logon events placed Sarah at the keyboard during that window. Corroboration is what is needed to turn a single-source lead into a finding you can defend.',
    },
    {
      id: 'q2',
      shortLabel: 'Q2',
      text: 'Were any external devices connected to her company laptop?',
      reinforcement:
        'A USB connection by itself only tells you a device was plugged in. The temporal correlation with the file activity, plus the matching volume label appearing on a recently-opened-files entry, is what turns the registry record into evidence.',
    },
    {
      id: 'q3',
      shortLabel: 'Q3',
      text: 'Did Sarah transfer any proprietary files off the laptop?',
      reinforcement:
        'Transfer is the question that benefits most from looking across multiple artifact stacks. Three independent channels showing the same file leaving the laptop in a tight time window provides a much stronger case than any single channel alone.',
    },
    {
      id: 'q4',
      shortLabel: 'Q4',
      text: 'Is there evidence of deletion or an attempt to cover her tracks?',
      reinforcement:
        'A deletion on its own is one data point. A how-to-delete search typed minutes before the deletion is intent. Two independent witnesses telling the same cleanup story is what turns the deletion from a coincidence into a finding.',
    },
  ],

  stacks: [
    { id: 'recent-files', label: 'Recent Files' },
    { id: 'app-execution', label: 'Application Execution' },
    { id: 'usb-devices', label: 'External Devices' },
    { id: 'browser', label: 'Browser Activity' },
    { id: 'cloud-sync', label: 'Cloud Storage Sync' },
    { id: 'email', label: 'Email' },
    { id: 'filesystem', label: 'File System' },
    { id: 'system', label: 'System Events' },
  ],

  artifacts: [
    /* ---------- Recent Files ---------- */
    {
      id: 'lnk-design-docs',
      stackId: 'recent-files',
      name: 'Recent Files: Design Specifications',
      technicalName: 'LNK shortcut files and JumpLists',
      timestamp: '2026-03-13 14:31',
      whatIsThis:
        'When a user opens a file, Windows records a shell-item breadcrumb that captures the path, the timestamps, the volume the object lived on, and many more attributes. These breadcrumbs are what power things like "Recently Opened" lists, jump lists, and .lnk shortcut files.',
      whyItMatters:
        'Recent file evidence shows what the user actually interacted with, not just what existed on the system. In the proper context, it can be a strong signal of user knowledge, proving someone deliberately opened or interacted with this file. The metadata in each entry (paths, timestamps, volume identifiers) can also corroborate other artifacts on the system.',
      data: [
        { label: 'File', value: 'meridian_alpha_design_v7.docx', mono: true },
        { label: 'Source', value: '\\\\fileserver01\\engineering\\restricted\\', mono: true },
        { label: 'Opened', value: '2026-03-13 14:31:08' },
        { label: 'Opened by', value: 'MERIDIAN\\smorgan', mono: true },
      ],
      promptQuestions: [
        'Was the file accessed before or after the two-week notice was submitted Friday afternoon?',
        'Does the source path match the proprietary documents David said went missing?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q1'],
    },
    {
      id: 'lnk-design-on-usb',
      stackId: 'recent-files',
      name: 'Recent Files: Design Specifications (E:\\)',
      technicalName: 'LNK shortcut files and JumpLists',
      timestamp: '2026-03-13 15:11',
      whatIsThis:
        'When a user opens a file, Windows records a shell-item breadcrumb that captures the path, the timestamps, the volume the object lived on, and many more attributes. These breadcrumbs are what power things like "Recently Opened" lists, jump lists, and .lnk shortcut files.',
      whyItMatters:
        'Recent file evidence shows what the user actually interacted with, not just what existed on the system. In the proper context, it can be a strong signal of user knowledge, proving someone deliberately opened or interacted with this file. The metadata in each entry (paths, timestamps, volume identifiers) can also corroborate other artifacts on the system.',
      data: [
        { label: 'File', value: 'meridian_alpha_design_v7.docx', mono: true },
        { label: 'Source', value: 'E:\\sarah-personal\\', mono: true },
        { label: 'Volume label', value: 'CRUZER', mono: true },
        { label: 'Volume serial', value: '4C530001120607117283', mono: true },
        { label: 'Opened', value: '2026-03-13 15:11:42' },
        { label: 'Opened by', value: 'MERIDIAN\\smorgan', mono: true },
      ],
      promptQuestions: [
        'Why would a proprietary design file be opened from an E: drive on a company laptop?',
        'Does the volume label or serial recorded here match anything in another artifact?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q1', 'q2', 'q3'],
    },
    {
      id: 'lnk-resume',
      stackId: 'recent-files',
      name: 'Recent Files: resume.docx',
      technicalName: 'LNK shortcut files and JumpLists',
      timestamp: '2026-03-11 19:14',
      whatIsThis:
        'When a user opens a file, Windows records a shell-item breadcrumb that captures the path, the timestamps, the volume the object lived on, and many more attributes. These breadcrumbs are what power things like "Recently Opened" lists, jump lists, and .lnk shortcut files.',
      whyItMatters:
        'Recent file evidence shows what the user actually interacted with, not just what existed on the system. In the proper context, it can be a strong signal of user knowledge, proving someone deliberately opened or interacted with this file. The metadata in each entry (paths, timestamps, volume identifiers) can also corroborate other artifacts on the system.',
      data: [
        { label: 'File', value: 'resume_smorgan_2026.docx', mono: true },
        { label: 'Source', value: 'C:\\Users\\smorgan\\Documents\\Personal\\', mono: true },
        { label: 'Opened', value: '2026-03-11 19:14:08' },
        { label: 'Opened by', value: 'MERIDIAN\\smorgan', mono: true },
      ],
      promptQuestions: [
        'Is this file proprietary, or routine personal activity?',
        'Does the timestamp line up with any other suspicious activity?',
      ],
      relevance: 'context',
      supportsQuestionIds: [],
    },

    /* ---------- Application Execution ---------- */
    {
      id: 'prog-exec-7zip',
      stackId: 'app-execution',
      name: 'Program Execution: 7-Zip',
      technicalName: 'Prefetch, Amcache, and UserAssist',
      timestamp: '2026-03-13 14:42',
      whatIsThis:
        'Windows quietly tracks which programs have been run and when. These records are kept independently of the programs themselves, so they can remain on disk even after the program is uninstalled or removed.',
      whyItMatters:
        'Program execution records cover everything that ran on the system, including routine use. Run counts and first-seen dates are how you can separate a tool that has been part of the user\'s workflow from one that is new to the system.',
      data: [
        { label: 'Application', value: '7-Zip File Manager' },
        { label: 'Path', value: 'C:\\Program Files\\7-Zip\\7zFM.exe', mono: true },
        { label: 'First seen', value: '2026-03-13 14:42:11' },
        { label: 'Last run', value: '2026-03-13 14:42:11' },
        { label: 'Run count', value: '1' },
        { label: 'User', value: 'MERIDIAN\\smorgan', mono: true },
      ],
      promptQuestions: [
        'Why would a compression/archiving tool be run for the first time on the same afternoon notice was submitted?',
        'How does the timing relate to the file access and the USB attach?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q3'],
    },
    {
      id: 'prog-exec-spotify',
      stackId: 'app-execution',
      name: 'Program Execution: Spotify',
      technicalName: 'Prefetch, Amcache, and UserAssist',
      timestamp: '2026-03-13 08:14',
      whatIsThis:
        'Windows quietly tracks which programs have been run and when. These records are kept independently of the programs themselves, so they can remain on disk even after the program is uninstalled or removed.',
      whyItMatters:
        'Program execution records cover everything that ran on the system, including routine use. Run counts and first-seen dates are how you can separate a tool that has been part of the user\'s workflow from one that is new to the system.',
      data: [
        { label: 'Application', value: 'Spotify' },
        { label: 'Path', value: 'C:\\Users\\smorgan\\AppData\\Roaming\\Spotify\\Spotify.exe', mono: true },
        { label: 'First seen', value: '2024-09-04 09:11:02' },
        { label: 'Last run', value: '2026-03-13 08:14:37' },
        { label: 'Run count', value: '187' },
        { label: 'User', value: 'MERIDIAN\\smorgan', mono: true },
      ],
      promptQuestions: [
        'Is this program normal background noise on this laptop?',
        'Does the run pattern look unusual, or like routine business use?',
      ],
      relevance: 'red-herring',
      supportsQuestionIds: [],
    },

    /* ---------- External Devices ---------- */
    {
      id: 'usb-sandisk',
      stackId: 'usb-devices',
      name: 'USB Device History: SanDisk Cruzer',
      technicalName: 'USBSTOR registry key and SetupAPI logs',
      timestamp: '2026-03-13 15:03',
      whatIsThis:
        'Every time a USB storage device is connected to a Windows system, the OS records information about the device: the manufacturer, model, serial number, the volume label, and the times it was first connected, last connected, and disconnected.',
      whyItMatters:
        'USB history is often the most direct evidence of physical exfiltration. A USB connection that lines up in time with file activity, AND whose volume label appears in another artifact (like a LNK on E:\\), is one of the clearest signals an analyst can ask for.',
      data: [
        { label: 'Device', value: 'SanDisk Cruzer Glide 32GB' },
        { label: 'Serial', value: '4C530001120607117283', mono: true },
        { label: 'Volume label', value: 'CRUZER', mono: true },
        { label: 'First connected', value: '2026-03-13 15:03:47' },
        { label: 'Last connected', value: '2026-03-13 15:03:47' },
        { label: 'Disconnected', value: '2026-03-13 15:18:22' },
        { label: 'Drive letter', value: 'E:\\', mono: true },
      ],
      promptQuestions: [
        'Was this the first time the device was ever attached to this laptop?',
        'Does the volume label or serial match anything seen in another artifact?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q2', 'q3'],
    },

    /* ---------- Browser Activity ---------- */
    {
      id: 'browser-personal-drive',
      stackId: 'browser',
      name: 'Browser History: Personal Google Drive',
      technicalName: 'Edge / Chromium History SQLite database',
      timestamp: '2026-03-14 09:14',
      whatIsThis:
        'Browsers keep a history of every page a user visits. This includes the URL, the page title, when it was visited, and how the user got there (typed, clicked a link, search result, redirect).',
      whyItMatters:
        "Browser history records where a user navigated and what they searched for. The phrasing of search queries, the destinations of typed URLs, and how the user got to a page can all speak to a user's intent and direction.",
      data: [
        { label: 'URL', value: 'https://drive.google.com/drive/u/2/my-drive', mono: true },
        { label: 'Page title', value: 'My Drive - Google Drive' },
        { label: 'Visit type', value: 'Typed URL' },
        { label: 'Visit time', value: '2026-03-14 09:14:33' },
        { label: 'Browser', value: 'Microsoft Edge' },
      ],
      promptQuestions: [
        'Is this a corporate-sanctioned account, or a personal one?',
        'How does the timing relate to the suspected weekend activity David noticed?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q3'],
    },
    {
      id: 'browser-securely-delete',
      stackId: 'browser',
      name: 'Browser History: "how to securely delete files windows"',
      technicalName: 'Edge / Chromium History SQLite database',
      timestamp: '2026-03-14 09:55',
      whatIsThis:
        'A search-query record recovered from the local browser database. The history table stores the full URL, which for a search engine result includes the query string the user typed.',
      whyItMatters:
        "Browser history records where a user navigated and what they searched for. The phrasing of search queries, the destinations of typed URLs, and how the user got to a page can all speak to a user's intent and direction.",
      data: [
        { label: 'Query', value: 'how to securely delete files windows', mono: true },
        { label: 'Search engine', value: 'Google' },
        { label: 'Visit time', value: '2026-03-14 09:55:14' },
        { label: 'Result clicked', value: 'lifehacker.com/how-to-securely-erase-files', mono: true },
      ],
      promptQuestions: [
        'What does the wording of the query suggest the user was trying to do?',
        'Where does the timing land relative to the file deletion in the file system stack?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q4'],
    },
    {
      id: 'browser-lakers',
      stackId: 'browser',
      name: 'Browser History: Lakers score search',
      technicalName: 'Edge / Chromium History SQLite database',
      timestamp: '2026-03-13 12:33',
      whatIsThis:
        'Browsers keep a history of every page a user visits. This includes the URL, the page title, when it was visited, and how the user got there (typed, clicked a link, search result, redirect).',
      whyItMatters:
        "Browser history records where a user navigated and what they searched for. The phrasing of search queries, the destinations of typed URLs, and how the user got to a page can all speak to a user's intent and direction.",
      data: [
        { label: 'URL', value: 'https://www.google.com/search?q=lakers+score+last+night', mono: true },
        { label: 'Page title', value: 'lakers score last night - Google Search' },
        { label: 'Visit time', value: '2026-03-13 12:33:48' },
        { label: 'Visit type', value: 'Typed URL' },
      ],
      promptQuestions: [
        'Does this search relate to any of the four HR questions?',
        'Does the timing of this search fall inside the window of suspect activity?',
      ],
      relevance: 'red-herring',
      supportsQuestionIds: [],
    },
    {
      id: 'browser-therapy-portal',
      stackId: 'browser',
      name: 'Browser History: therapy practice patient portal',
      technicalName: 'Edge / Chromium History SQLite database',
      timestamp: '2026-03-11 18:42',
      whatIsThis:
        'Browsers keep a history of every page a user visits. This includes the URL, the page title, when it was visited, and how the user got there (typed, clicked a link, search result, redirect).',
      whyItMatters:
        "Browser history records where a user navigated and what they searched for. The phrasing of search queries, the destinations of typed URLs, and how the user got to a page can all speak to a user's intent and direction.",
      data: [
        { label: 'URL', value: 'https://portal.healthhaven-therapy.com/login', mono: true },
        { label: 'Page title', value: 'Patient Portal Login - HealthHaven Counseling' },
        { label: 'Visit type', value: 'Typed URL' },
        { label: 'Visits in last 30 days', value: '6' },
        { label: 'Most recent visit', value: '2026-03-11 18:42' },
      ],
      promptQuestions: [
        'Does this artifact relate to any of the four HR questions on the table?',
        'What is your obligation as an analyst when you encounter sensitive personal material that falls outside the authorized scope of the exam?',
      ],
      relevance: 'red-herring',
      supportsQuestionIds: [],
    },

    /* ---------- Cloud Storage Sync ---------- */
    {
      id: 'cloud-sync-drive',
      stackId: 'cloud-sync',
      name: 'Cloud Storage Sync: Google Drive upload',
      technicalName: 'Google Drive client logs and sync database',
      timestamp: '2026-03-14 09:21',
      whatIsThis:
        'Cloud storage clients like Google Drive and OneDrive keep local logs of every file they sync up to the cloud. These logs survive even if the user deletes the local copies.',
      whyItMatters:
        'Cloud sync logs are an independent witness to file movement. Even if the local file is gone, the sync record can tell you the file existed, when it left the device, and which account it went to. A second exfiltration channel running in parallel with the USB is what turns the case from a single lead into a corroborated finding.',
      data: [
        { label: 'Service', value: 'Google Drive Backup and Sync' },
        { label: 'Account', value: 'sarah.morgan.personal@gmail.com', mono: true },
        { label: 'File uploaded', value: 'meridian_alpha_design_v7.docx', mono: true },
        { label: 'Upload size', value: '4.2 MB' },
        { label: 'Upload time', value: '2026-03-14 09:21:08' },
        { label: 'Result', value: 'Success' },
      ],
      promptQuestions: [
        'Is the destination account corporate or personal?',
        'Does this represent a different exfiltration channel than the USB activity, or the same one?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q3'],
    },

    /* ---------- Email ---------- */
    {
      id: 'email-personal',
      stackId: 'email',
      name: 'Outbound Email to Personal Address',
      technicalName: 'Outlook OST / PST mailbox store',
      timestamp: '2026-03-13 16:47',
      whatIsThis:
        "Email clients store a copy of every message sent or received locally. The metadata for each message includes the sender, the recipient, the subject, the timestamp, and whether there were any attachments.",
      whyItMatters:
        'Email is one of the oldest and most common exfiltration channels because it is simple and ubiquitous. A work-to-personal email with attachments during a notice window is a well-known exfiltration method.',
      data: [
        { label: 'From', value: 's.morgan@meridian-systems.com', mono: true },
        { label: 'To', value: 'sarah.morgan.personal@gmail.com', mono: true },
        { label: 'Subject', value: 'project notes' },
        { label: 'Sent', value: '2026-03-13 16:47:22' },
        { label: 'Attachment', value: 'project_archive.7z (3.8 MB)', mono: true },
      ],
      promptQuestions: [
        'Is sending a 7z archive of work files to a personal address consistent with policy?',
        'Does the attachment naming and size match what would be packaged from the proprietary folder?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q3'],
    },

    /* ---------- File System ---------- */
    {
      id: 'recycle-bin-design',
      stackId: 'filesystem',
      name: 'Recycle Bin: staging archive deleted',
      technicalName: '$Recycle.Bin $I and $R metadata files',
      timestamp: '2026-03-14 10:02',
      whatIsThis:
        'When a user deletes a file in Windows, it usually goes to the Recycle Bin first. The bin keeps a record of where the file was deleted from, who deleted it, and when, even after the file itself is gone.',
      whyItMatters:
        'Recycle Bin metadata captures the act of deletion itself. The $I records preserve the original path, the size, and the deletion time even after the bin is emptied or the underlying file content is gone. Deletions read differently depending on the wider timeline they sit in.',
      data: [
        { label: 'Deleted file', value: 'project_archive.7z', mono: true },
        { label: 'Original path', value: 'C:\\Users\\smorgan\\Documents\\Work\\', mono: true },
        { label: 'File size', value: '3.8 MB' },
        { label: 'Deleted by', value: 'MERIDIAN\\smorgan', mono: true },
        { label: 'Deletion time', value: '2026-03-14 10:02:51' },
      ],
      promptQuestions: [
        'Is the deleted file referenced anywhere else in the timeline?',
        'How does the deletion time relate to the "how to securely delete" search?',
      ],
      relevance: 'corroborating',
      supportsQuestionIds: ['q4'],
    },

    /* ---------- System Events ---------- */
    {
      id: 'system-logon-friday',
      stackId: 'system',
      name: 'System Logon Events: Friday and Saturday',
      technicalName: 'Windows Security event log (Event IDs 4624 / 4634)',
      timestamp: '2026-03-13 08:02',
      whatIsThis:
        'Windows records every successful and failed authentication attempt in its security event log. These records confirm who was actually signed in to the machine at a given time.',
      whyItMatters:
        'Logon events anchor your timeline. Without confirming a user was at the keyboard, you cannot rule out the possibility that someone else accessed the account. This is the difference between proving file activity and proving user knowledge of that activity.',
      data: [
        { label: 'Account', value: 'MERIDIAN\\smorgan', mono: true },
        { label: 'Workstation', value: 'MERIDIAN-LT-1184', mono: true },
        { label: 'Friday logon', value: '2026-03-13 08:02:14 (interactive)' },
        { label: 'Friday logoff', value: '2026-03-13 17:42:01' },
        { label: 'Saturday logon', value: '2026-03-14 08:48:30 (interactive)' },
        { label: 'Saturday logoff', value: '2026-03-14 10:31:12' },
      ],
      promptQuestions: [
        'Does this artifact answer one of the three questions on its own, or does it support another artifact?',
        'What would be different about the case if no logon record covered the suspect window?',
      ],
      relevance: 'context',
      supportsQuestionIds: ['q1'],
    },
    {
      id: 'weather-widget',
      stackId: 'system',
      name: 'Weather Widget Cache',
      technicalName: 'Application cache files in AppData',
      timestamp: '2026-03-14 07:02',
      whatIsThis:
        "A small cache file from a desktop weather widget. It records the last few cities the widget was set to display the forecast for.",
      whyItMatters:
        "Application cache files are state that desktop apps keep on disk so they can launch faster, remember preferences, or display offline content. The forensic value of a given cache depends entirely on which application owns it. Some application caches hold meaningful user data, others hold only display state.",
      data: [
        { label: 'Application', value: 'Windows Weather Widget' },
        { label: 'Cached locations', value: 'San Francisco CA, Reno NV' },
        { label: 'Last refresh', value: '2026-03-14 07:02:11' },
      ],
      promptQuestions: [
        'Does this artifact relate to any of the four HR questions?',
        'Is there anything here that adjusts the timeline of suspect activity?',
      ],
      relevance: 'red-herring',
      supportsQuestionIds: [],
    },
  ],

  conclusionChoices: {
    q1: [
      {
        id: 'q1-yes',
        label: 'Yes',
        correct: true,
      },
      {
        id: 'q1-no',
        label: 'No',
        correct: false,
      },
    ],
    q2: [
      {
        id: 'q2-yes',
        label: 'Yes',
        correct: true,
      },
      {
        id: 'q2-no',
        label: 'No',
        correct: false,
      },
    ],
    q3: [
      {
        id: 'q3-yes',
        label: 'Yes',
        correct: true,
      },
      {
        id: 'q3-no',
        label: 'No',
        correct: false,
      },
    ],
    q4: [
      {
        id: 'q4-yes',
        label: 'Yes',
        correct: true,
      },
      {
        id: 'q4-no',
        label: 'No',
        correct: false,
      },
    ],
  },

  debriefNarrative: [
    'On **Friday** at **08:02**, Sarah logged into her workstation as `MERIDIAN\\smorgan`. At **14:31** she opened `meridian_alpha_design_v7.docx` from the engineering file share. At **14:42**, `7zFM.exe` ran on the laptop for the first time ever.',
    'At **15:03** a `SanDisk Cruzer Glide 32GB` USB drive was attached for the first time on record. Eight minutes later, at **15:11**, the same design document was opened again, this time from `E:\\` on that USB drive. The LNK records the volume label `CRUZER` and a serial number that lines up exactly with the USBSTOR record. The device was disconnected at **15:18**.',
    'At **16:47** Sarah sent an email from her work account to her personal Gmail address with a `project_archive.7z` attachment. A second exfiltration channel.',
    'On **Saturday morning** at **09:14**, she typed her personal Google Drive URL into Edge. Seven minutes later the Google Drive sync client uploaded `meridian_alpha_design_v7.docx` to her personal account. A third channel.',
    'At **09:55** Saturday she searched `how to securely delete files windows`. Seven minutes later, at **10:02**, the staging archive `project_archive.7z` was placed in the Recycle Bin from her local `C:\\Users\\smorgan\\Documents\\Work\\` folder. That archive is the same file 7-Zip produced Friday afternoon and that the outbound email carried as an attachment.',
    'Three independent witness types tell the same exfiltration story (USB, cloud, email), and two independent witnesses tell the cleanup story (the recycle-bin record and the deletion-search query).',
  ],

}
