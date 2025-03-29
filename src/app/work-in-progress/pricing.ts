export interface PricingSpec {
  section: string
  specifications: string[]
}

export const PRICING_SPECIFICATIONS: PricingSpec[] = [
  {
    section: `Model`,
    specifications: [
      `"Pay as you use" to attract customers by eliminating long-term commitment.`,
      `Use subscription to ensure the minimum revenue.`,
      `Use golds as product balance to contribute to the majority of revenue.`,
      `Use competition game to boost revenue after reaching certain number of active regular users.`,
      `Introduce promotion sales during summer off-season & CNY holiday.`,
    ]
  },
  {
    section: `Subscription`,
    specifications: [
      `A basic monthly subscription fee is HK$ 99 for every 30 days of service.`,
      `A reminder will be given when subscription is about to expire in 7 days or less.`,
      `All functionalities require an active subscription for an account.`,
      `
        Subscription alone can only access basic functionalities, to unlock a new<br>
        race meeting require certain amount of golds in addition to active subscription.
      `,
      `
        To support more payment methods, subscription will sell like golds<br>
        in the sense of "balance", rather than monthly deduction from credit card.
      `,
      `
        To prevent over-subscription that affects future pricing change,<br>
        subscription can only be purchase/renew/extend once (for extra 30 days)<br>
        when it is about to expire in 60 days or less.
      `,
    ]
  },
  {
    section: `Gold`,
    specifications: [
      `Golds are the currency of the product.`,
      `Golds are NOT interchangeable with the subscription.`,
      `
        Golds are used to unlock a new race meeting that has not concluded yet.<br>
        A concluded race meeting: 1 hour after the post time of the final race.
      `,
      `
        Unlocking a race meeting requires the same amount of golds as<br>
        the total number of the races on that race day (8 to 11 golds).
      `,
      `
        Golds can also be used for renaming the nickname of an account,<br>
        participate in the game competition as entry fee to possibly earn more golds.
      `,
      `Unlike subscription, there is no limit on how many golds can be purchased.`,
      `
        Golds are selling in the form of singular or packs:<br>
        Singular:            1 gold  => HK$ 7.0/ea<br>
        1-day Pack:         10 golds => HK$ 6.5/ea<br>
        4-day Pack:         40 golds => HK$ 6.4/ea<br>
        Monthly Pack:       80 golds => HK$ 6.3/ea<br>
        Bi-monthly Pack:   160 golds => HK$ 6.2/ea<br>
        Half Season Pack:  415 golds => HK$ 6.1/ea<br>
        Whole Season Pack: 830 golds => HK$ 6.0/ea
      `,
    ]
  },
  {
    section: `Payment`,
    specifications: [
      `There is no shopping cart feature, only 1 item can be purchased at a time.`,
      `For singular gold, a quantity can be specified during the checkout.`,
      `Supported payment methods: Credit Card > AlipayHK > Payme > FPS`,
      `
        After payment successful, instruct user to refresh the page<br>
        and/or redirect user to home page with a countdown timer of 9 seconds.
      `,
    ]
  },
  {
    section: `Redemption`,
    specifications: [
      `A channel for user to redeem his "coupon" like a gift card.`,
      `Redemption code must be issued from our system.`,
      `1 redemption code can be used once only.`,
      `Redemption can be either subscriptions or golds for a certain days or amount.`,
    ]
  },
  {
    section: `Order History`,
    specifications: [
      `
        To display user's purchasing history listed in the most<br> 
        recent first order and a pagination size of 12.
      `,
      `
        Each order item shall include but not limit to below information:<br>
        order #, date/time, status, product description, cost, payment method, etc.
      `,
    ]
  },
  {
    section: `New User`,
    specifications: [
      `
        System will automatically credit a 3-day subscription and 10 golds<br>
        to each newly successfully registered user account.
      `,
    ]
  },
]
