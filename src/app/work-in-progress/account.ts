export interface AccountSpec {
  section: string
  specifications: string[]
}

export const ACCOUNT_SPECIFICATIONS: AccountSpec[] = [
  {
    section: `Login & Logout`,
    specifications: [
      `User can login with the verified phone number or email address and the password.`,
      `User can logout manually or automatically after 1 hour of inactivity.`,
      `Authentication & Authorization with Keycloak or Okta or other IAM for SSO.`,
      `Each request shall carry JWT access token, refresh token in header.`,
    ]
  },
  {
    section: `Registration`,
    specifications: [
      `
        User needs to choose to create the account with an email address or<br>
        a local phone number, in either case, they need to be verified with an OTP.
      `,
      `
        User needs to choose a password with strength check and double-input,<br>
        the password will require 8 to 16 characters which coming from<br>
        at least 3 out of 4 categories below:<br>
        - 26 Upper-case English Character<br>
        - 26 Lower-case English Character<br>
        - 10 Digits: 0 to 9<br>
        - 30 Special Characters Except Single & Double Quote [' & "]
      `,
      `
        User needs to come up with a nickname that has not been registered<br>
        in system which consists of 6 to 12 lower and/or upper case characters,<br>
        Regex: [a-zA-Z]{6,12}
      `,
      `
        Once all conditions are satisfied, the account will be created with<br>
        an unmodifiable user identifier and inactive status.`,
      `
        The user identifier is different from the email address and phone so that<br>
        email address and/or phone number can be changed as user needed in the future.
      `,
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
