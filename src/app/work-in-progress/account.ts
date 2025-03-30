export interface AccountSpec {
  section: string
  specifications: string[]
}

export const ACCOUNT_SPECIFICATIONS: AccountSpec[] = [
  {
    section: `Login & Logout`,
    specifications: [
      `Authentication & Authorization with Keycloak or Okta or other IAM for SSO.`,
      `Each request shall carry JWT access token, refresh token in header.`,
      `User can logout manually or automatically after 1 hour of inactivity.`,
      `
        Once logout in any session, all sessions for that account<br>
        including websockets should be logout and closed.
      `,
    ]
  },
  {
    section: `Registration`,
    specifications: [
      `
        User needs to come up with a nickname that has not been registered<br>
        in system which consists of 6 to 12 lower and/or upper case characters,<br>
        Regex: [a-zA-Z]{6,12}
      `,
      `
        User needs to fill in an email address & local phone number<br>
        but don't need to verify them during registration.
      `,
      `User account will be created with an inactive status.`
    ]
  },
  {
    section: `Management`,
    specifications: [
      `
        Both email address & local phone number need to be verified,<br>
        so that the account can be considered as active,<br>
        so that the account can be rewarded with the defined benefits,<br>
        so that the account can purchase products from the store.
      `,
      `Nickname can be changed once every 90 days with a cost of 50 golds.`,
    ]
  },
]
