export interface AnnouncementSpec {
  section: string
  specifications: string[]
}

export const ANNOUNCEMENT_SPECIFICATIONS: AnnouncementSpec[] = [
  {
    section: `Public Announcement`,
    specifications: [
      `
        Intended to be received by anyone visiting the website.
      `,
      `
        The announcement board shall contain all published within recent 3 months only.
      `,
      `
        If an announcement is about maintenance schedule, then release notes if any<br>
        need to be specified, it also may subject to change after the actual maintenance completed.
      `,
      `
        The announcements shown don't need to display creator/editor information.
      `,
    ]
  },
  {
    section: `Real-time Announcement`,
    specifications: [
      `
        Intended to be received by users who have unlocked the latest race meeting.
      `,
      `
        The announcement is about the tips for the race meeting and usually contains<br>
        short information. It should be sent to each active client that connects to Websocket.
      `,
      `
        The announcements shown need to display the creator, date/time and message.
      `,
      `
        The announcements can not be modified by anyone once sent out.
      `,
    ]
  },
]
