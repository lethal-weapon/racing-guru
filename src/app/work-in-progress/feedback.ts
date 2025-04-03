export interface FeedbackSpec {
  section: string
  specifications: string[]
}

export const FEEDBACK_SPECIFICATIONS: FeedbackSpec[] = [
  {
    section: `Requirements`,
    specifications: [
      `
        A channel for customer to provide product feedback with reward incentive.<br>
        It's not intended to process urgent matters like account access or payment issues.
      `,
      `
        1 user can only submit up to 1 feedback ticket every 30 days,<br>
        and the ticket can not be modified once submitted.
      `,
      `
        A submitted feedback ticket will be processed within 5 working days,<br>
        and granted 0 to 5 golds as reward depending on the content quality it contains.
      `,
      `
        A feedback ticket can be broken down into up to 5 paragraphs as<br>
        a user chooses since it could contain substantial text information.
      `,
      `
        A page is required to display user's feedback history listed in the most<br> 
        recent first order and a pagination size of 12.
      `,
      `
        Each feedback ticket shall include but not limit to below information:<br>
        feedback ticket #, date/time, status, rewards, paragraphs, etc.
      `,
    ]
  },
]
