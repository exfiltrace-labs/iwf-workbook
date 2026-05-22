import type { CustodyCase } from './types'

/**
 * Lab 4.2 case data. The scenario, every transfer event's narrative and
 * field definitions, and the canonical answers are all here so the UI
 * components stay focused on rendering.
 *
 * Story: David Carter, a senior software engineer at Halcyon Industries, is
 * suspected of exfiltrating proprietary source code. His company laptop
 * is seized during a scheduled HR meeting on Tuesday, March 17, 2026.
 * The student documents the chain of custody as the device passes through
 * HR, the forensic examiner, the lab, the imaging workstation, the
 * evidence locker (for the original), and the analysis workstation (for
 * the resulting forensic image).
 */

// Option order is intentionally NOT chronological. If the lists were
// arranged in case-narrative order, the correct answer for the first row
// would always land at position 0 and a careless student could "guess
// the first option" their way through the seizure row. Order is shuffled
// so no row's correct answer is at position 0 and there is no obvious
// pattern in the positions across rows.

const PERSONNEL = [
  'Tom Brennan, IT Help Desk',
  'David Carter, Senior Software Engineer',
  'Mary Chen, HR Director',
  'Alex Rivera, Senior Forensic Examiner',
  'Sgt. Alvarez, Evidence Locker Custodian',
  'Diana Park, Network Security Lead',
  'Ravi Patel, Junior Analyst',
]

const WHAT_OPTIONS = [
  'Backup tape from corporate server',
  'Original Dell Latitude 5430 (S/N DL-5430-XR8K2P9)',
  'Forensic image (E01 file from S/N DL-5430-XR8K2P9)',
  'Working copy of forensic image',
  'Powered-on laptop with active session',
]

const HOW_OPTIONS_PHYSICAL = [
  'Direct hand-off, no documentation',
  'Powered down and locked in HR office cabinet',
  'Carried openly through the office without a bag',
  'Hand-to-hand transfer in tamper-evident bag with signed receipt',
  'Sent via interoffice mail in unsealed folder',
  'Sealed evidence bag inside locked transport case',
  'Hardware write-blocker on isolated imaging workstation',
  'Emailed as an attachment to personal address',
  'Tamper-evident bag with new evidence tag, signed handover',
  'Encrypted file copy with hash re-verification',
]

const WHY_OPTIONS = [
  'Routine IT maintenance',
  'Forensic imaging and hash verification',
  'Initial seizure for HR review',
  'Personal review by suspect',
  'Storage of original evidence pending case closure',
  'Backup for disaster recovery',
  'Analysis of forensic image',
  'Handoff to forensic examiner for imaging',
  'Transport to forensic lab for processing',
]

const WHERE_OPTIONS = [
  'Suspect\'s home residence',
  'Halcyon Industries HR office',
  'Off-site cloud storage',
  'Forensic lab, analysis workstation',
  'Halcyon Industries IT closet',
  'Central evidence locker',
  'In transit from Halcyon HQ to forensic lab',
  'Forensic lab, imaging workstation',
]

const ORIGINAL_DEVICE = 'Original Dell Latitude 5430 (S/N DL-5430-XR8K2P9)'
const FORENSIC_IMAGE = 'Forensic image (E01 file from S/N DL-5430-XR8K2P9)'

const SHA256 = '3a7bd3e2b8f5f5e8c4d9a1b6e7c2f4d5a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3'

export const CASE: CustodyCase = {
  scenario: {
    title: 'Halcyon Industries · Suspected Source Code Exfiltration',
    suspect: 'David Carter',
    evidenceSummary: 'Dell Latitude 5430 laptop, S/N DL-5430-XR8K2P9',
  },
  caseHeader: {
    caseId: 'MS-2026-014',
    leadExaminer: 'Alex Rivera, Senior Forensic Examiner',
    submitter: 'Mary Chen, HR Director',
    deviceMake: 'Dell',
    deviceModel: 'Latitude 5430',
    serialNumber: 'DL-5430-XR8K2P9',
  },
  events: [
    {
      id: 'seizure',
      step: '1',
      title: 'Initial seizure',
      narrative: [
        'On Tuesday, March 17, 2026 at **09:15 UTC**, **Mary Chen** (HR Director) entered the conference room where David Carter was attending a scheduled HR meeting. She informed him that his employment status was under review and that company property was being temporarily retained.',
        'She seized his Dell Latitude 5430 laptop, serial number `DL-5430-XR8K2P9`, powered it off, and walked it back to her HR office. The laptop was locked in a secure cabinet pending forensic examination.',
      ],
      chain: 'shared',
      fields: [
        {
          id: 'released-by',
          label: 'Released by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'David Carter, Senior Software Engineer',
        },
        {
          id: 'received-by',
          label: 'Received by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Mary Chen, HR Director',
        },
        {
          id: 'when',
          label: 'Date and time',
          type: 'text',
          correct: '2026-03-17 09:15 UTC',
          accept: [
            '2026-03-17 09:15',
            '2026-03-17 9:15 UTC',
            '2026-03-17 09:15Z',
            '2026-03-17T09:15Z',
          ],
          placeholder: 'YYYY-MM-DD HH:MM UTC',
        },
        {
          id: 'what',
          label: 'Item transferred',
          type: 'dropdown',
          options: WHAT_OPTIONS,
          correct: ORIGINAL_DEVICE,
        },
        {
          id: 'where',
          label: 'Location',
          type: 'dropdown',
          options: WHERE_OPTIONS,
          correct: 'Halcyon Industries HR office',
        },
        {
          id: 'why',
          label: 'Reason for transfer',
          type: 'dropdown',
          options: WHY_OPTIONS,
          correct: 'Initial seizure for HR review',
        },
        {
          id: 'how',
          label: 'Method',
          type: 'dropdown',
          options: HOW_OPTIONS_PHYSICAL,
          correct: 'Powered down and locked in HR office cabinet',
        },
      ],
    },
    {
      id: 'handoff',
      step: '2',
      title: 'Onsite handoff to forensic examiner',
      narrative: [
        'At **11:30 UTC** the same morning, you (Alex Rivera, Senior Forensic Examiner) arrived at the Halcyon Industries HR office. Mary Chen retrieved the laptop from the locked cabinet and handed it to you in person.',
        'You inspected the device for signs of tampering and confirmed the model and serial number `DL-5430-XR8K2P9`. You then sealed it in a tamper-evident evidence bag with evidence tag `E-2026-014-A`. Both parties signed the chain of custody form.',
      ],
      chain: 'shared',
      fields: [
        {
          id: 'released-by',
          label: 'Released by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Mary Chen, HR Director',
        },
        {
          id: 'received-by',
          label: 'Received by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'when',
          label: 'Date and time',
          type: 'text',
          correct: '2026-03-17 11:30 UTC',
          accept: [
            '2026-03-17 11:30',
            '2026-03-17 11:30Z',
            '2026-03-17T11:30Z',
          ],
          placeholder: 'YYYY-MM-DD HH:MM UTC',
        },
        {
          id: 'what',
          label: 'Item transferred',
          type: 'dropdown',
          options: WHAT_OPTIONS,
          correct: ORIGINAL_DEVICE,
        },
        {
          id: 'where',
          label: 'Location',
          type: 'dropdown',
          options: WHERE_OPTIONS,
          correct: 'Halcyon Industries HR office',
        },
        {
          id: 'why',
          label: 'Reason for transfer',
          type: 'dropdown',
          options: WHY_OPTIONS,
          correct: 'Handoff to forensic examiner for imaging',
        },
        {
          id: 'how',
          label: 'Method',
          type: 'dropdown',
          options: HOW_OPTIONS_PHYSICAL,
          correct: 'Hand-to-hand transfer in tamper-evident bag with signed receipt',
        },
      ],
    },
    {
      id: 'transport',
      step: '3',
      title: 'Transport to forensic lab',
      narrative: [
        'At **13:00 UTC** you departed the Halcyon Industries campus with the bagged laptop secured inside a locked transport case. You drove directly to the forensic lab without any stops.',
        'On arrival you confirmed the tamper-evident seal was intact and logged the device into the lab\'s intake system. Even when the same examiner remains in custody, transport between locations is a documented step on the form.',
      ],
      chain: 'shared',
      fields: [
        {
          id: 'released-by',
          label: 'Released by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'received-by',
          label: 'Received by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'when',
          label: 'Date and time',
          type: 'text',
          correct: '2026-03-17 13:00 UTC',
          accept: [
            '2026-03-17 13:00',
            '2026-03-17 13:00Z',
            '2026-03-17T13:00Z',
          ],
          placeholder: 'YYYY-MM-DD HH:MM UTC',
        },
        {
          id: 'what',
          label: 'Item transferred',
          type: 'dropdown',
          options: WHAT_OPTIONS,
          correct: ORIGINAL_DEVICE,
        },
        {
          id: 'where',
          label: 'Location',
          type: 'dropdown',
          options: WHERE_OPTIONS,
          correct: 'In transit from Halcyon HQ to forensic lab',
        },
        {
          id: 'why',
          label: 'Reason for transfer',
          type: 'dropdown',
          options: WHY_OPTIONS,
          correct: 'Transport to forensic lab for processing',
        },
        {
          id: 'how',
          label: 'Method',
          type: 'dropdown',
          options: HOW_OPTIONS_PHYSICAL,
          correct: 'Sealed evidence bag inside locked transport case',
        },
      ],
    },
    {
      id: 'imaging',
      step: '4',
      title: 'Forensic imaging',
      narrative: [
        'At **14:30 UTC** you began the imaging process on a dedicated, isolated forensic workstation. A hardware write-blocker was inserted between the laptop\'s drive and the imaging system.',
        'You acquired a bit-for-bit forensic image in E01 format. After acquisition completed, you computed a SHA-256 hash of both the original drive and the image. The hashes matched, confirming integrity.',
        'Record the hash on the form so future verification can prove the image was not altered. The hash is `3a7bd3e2b8f5f5e8c4d9a1b6e7c2f4d5a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3`.',
      ],
      chain: 'shared',
      fields: [
        {
          id: 'released-by',
          label: 'Released by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'received-by',
          label: 'Received by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'when',
          label: 'Date and time',
          type: 'text',
          correct: '2026-03-17 14:30 UTC',
          accept: [
            '2026-03-17 14:30',
            '2026-03-17 14:30Z',
            '2026-03-17T14:30Z',
          ],
          placeholder: 'YYYY-MM-DD HH:MM UTC',
        },
        {
          id: 'what',
          label: 'Item transferred',
          type: 'dropdown',
          options: WHAT_OPTIONS,
          correct: ORIGINAL_DEVICE,
        },
        {
          id: 'where',
          label: 'Location',
          type: 'dropdown',
          options: WHERE_OPTIONS,
          correct: 'Forensic lab, imaging workstation',
        },
        {
          id: 'why',
          label: 'Reason for transfer',
          type: 'dropdown',
          options: WHY_OPTIONS,
          correct: 'Forensic imaging and hash verification',
        },
        {
          id: 'how',
          label: 'Method',
          type: 'dropdown',
          options: HOW_OPTIONS_PHYSICAL,
          correct: 'Hardware write-blocker on isolated imaging workstation',
        },
        {
          id: 'sha256',
          label: 'SHA-256 hash',
          type: 'text',
          correct: SHA256,
          placeholder: '64-character hex string',
          helpText:
            'Recording the hash on the chain-of-custody form is what lets a third party prove the image was not altered after acquisition.',
        },
      ],
    },
    {
      id: 'storage-original',
      step: '5a',
      title: 'Original device to evidence locker',
      narrative: [
        'At **16:00 UTC**, with imaging complete, the original laptop was placed back into a tamper-evident evidence bag with new evidence tag `E-2026-014-B`.',
        'You walked it to the central evidence locker and handed it to Sgt. Alvarez, the evidence locker custodian. Both parties signed the chain of custody form. The original device will remain in the locker pending case closure.',
      ],
      chain: 'original',
      fields: [
        {
          id: 'released-by',
          label: 'Released by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'received-by',
          label: 'Received by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Sgt. Alvarez, Evidence Locker Custodian',
        },
        {
          id: 'when',
          label: 'Date and time',
          type: 'text',
          correct: '2026-03-17 16:00 UTC',
          accept: [
            '2026-03-17 16:00',
            '2026-03-17 16:00Z',
            '2026-03-17T16:00Z',
          ],
          placeholder: 'YYYY-MM-DD HH:MM UTC',
        },
        {
          id: 'what',
          label: 'Item transferred',
          type: 'dropdown',
          options: WHAT_OPTIONS,
          correct: ORIGINAL_DEVICE,
        },
        {
          id: 'where',
          label: 'Location',
          type: 'dropdown',
          options: WHERE_OPTIONS,
          correct: 'Central evidence locker',
        },
        {
          id: 'why',
          label: 'Reason for transfer',
          type: 'dropdown',
          options: WHY_OPTIONS,
          correct: 'Storage of original evidence pending case closure',
        },
        {
          id: 'how',
          label: 'Method',
          type: 'dropdown',
          options: HOW_OPTIONS_PHYSICAL,
          correct: 'Tamper-evident bag with new evidence tag, signed handover',
        },
      ],
    },
    {
      id: 'storage-image',
      step: '5b',
      title: 'Forensic image to analysis workstation',
      narrative: [
        'At **16:15 UTC** you copied the forensic image (E01 file) from the imaging workstation to your analysis workstation over an encrypted file transfer.',
        'After the copy completed, you re-computed the SHA-256 hash of the image and verified it matched the hash recorded during acquisition. The image is now staged for analysis on the analysis workstation.',
        'From this step forward, the forensic image is documented separately from the original device. Each evidence item has its own row on the form.',
      ],
      chain: 'image',
      fields: [
        {
          id: 'released-by',
          label: 'Released by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'received-by',
          label: 'Received by',
          type: 'dropdown',
          options: PERSONNEL,
          correct: 'Alex Rivera, Senior Forensic Examiner',
        },
        {
          id: 'when',
          label: 'Date and time',
          type: 'text',
          correct: '2026-03-17 16:15 UTC',
          accept: [
            '2026-03-17 16:15',
            '2026-03-17 16:15Z',
            '2026-03-17T16:15Z',
          ],
          placeholder: 'YYYY-MM-DD HH:MM UTC',
        },
        {
          id: 'what',
          label: 'Item transferred',
          type: 'dropdown',
          options: WHAT_OPTIONS,
          correct: FORENSIC_IMAGE,
        },
        {
          id: 'where',
          label: 'Location',
          type: 'dropdown',
          options: WHERE_OPTIONS,
          correct: 'Forensic lab, analysis workstation',
        },
        {
          id: 'why',
          label: 'Reason for transfer',
          type: 'dropdown',
          options: WHY_OPTIONS,
          correct: 'Analysis of forensic image',
        },
        {
          id: 'how',
          label: 'Method',
          type: 'dropdown',
          options: HOW_OPTIONS_PHYSICAL,
          correct: 'Encrypted file copy with hash re-verification',
        },
      ],
    },
  ],
}
