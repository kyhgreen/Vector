import type { Doc, Unit } from "../types"

/* ---------- Documents (repeated on each exercise that uses them) ---------- */

const fundSummary: Doc = {
  kind: "table",
  title: "Fairline 500 Index ETF: fund summary",
  subtitle: "Fact sheet from the fund company",
  rows: [
    { label: "Fund type", value: "Index ETF" },
    { label: "Index it tracks", value: "S&P 500" },
    { label: "Holdings", value: "About 500 large US companies" },
    { label: "How holdings are chosen", value: "Follows the index list" },
    { label: "When it trades", value: "Any time the market is open" },
    { label: "Expense ratio", value: "0.05% a year", strong: true },
  ],
  note: "Past returns do not guarantee future returns.",
}

const crashStatement: Doc = {
  kind: "statement",
  title: "Fernhill Investing: quarterly statement, Jan 1 to Mar 31",
  subtitle: "Custodial account · Broad stock index fund",
  rows: [
    { label: "Shares owned", value: "20" },
    { label: "Price per share, Jan 1", value: "$50.00" },
    { label: "Account value, Jan 1", value: "$1,000.00" },
    { label: "Price per share, Mar 31", value: "$40.00" },
    { label: "Change this quarter", value: "-$200.00" },
    { label: "Account value, Mar 31", value: "$800.00", strong: true },
  ],
  note: "Values change with the market. You only lock in a loss if you sell.",
}

const jalenStub: Doc = {
  kind: "paystub",
  title: "Maple Row Market: pay stub, Dec 16 to 31",
  subtitle: "Employee: Jalen Brooks · Part-time cashier",
  rows: [
    { label: "Hours this period", value: "24 hrs" },
    { label: "Rate", value: "$12.50/hr" },
    { label: "Gross pay this period", value: "$300.00" },
    { label: "Year-to-date gross pay", value: "$4,200.00", strong: true },
    { label: "Year-to-date taxes withheld", value: "$321.30" },
    { label: "Federal income tax", value: "$0.00", indent: true },
    { label: "Social Security (6.2%)", value: "$260.40", indent: true },
    { label: "Medicare (1.45%)", value: "$60.90", indent: true },
    { label: "Year-to-date net pay", value: "$3,878.70", strong: true },
  ],
  note: "Last pay stub of the year.",
}

const jalenOffer: Doc = {
  kind: "offer",
  title: "Pinecrest Supply Co.: job offer summary",
  subtitle: "Candidate: Jalen Brooks · Warehouse coordinator",
  rows: [
    { label: "Pay rate", value: "$17.50/hr" },
    { label: "Schedule", value: "40 hrs/week" },
    { label: "Yearly pay (52 weeks)", value: "$36,400" },
    { label: "Pay schedule", value: "Every 2 weeks (26 paychecks)" },
    { label: "401(k) employer match", value: "100% of what you put in, up to 4% of pay" },
    { label: "Match is added", value: "Each paycheck" },
    { label: "Gross pay per paycheck", value: "$1,400", strong: true },
  ],
  note: "Your contributions and the match are invested in the funds you choose.",
}

const novaPitch: Doc = {
  kind: "offer",
  title: "NovaYield Club: member invitation",
  subtitle: "Forwarded to you by a classmate",
  rows: [
    { label: "Investment", value: "NovaYield token" },
    { label: "Promised return", value: "25% a month, guaranteed" },
    { label: "Minimum to join", value: "$250" },
    { label: "Referral bonus", value: "$40 for each friend who joins" },
    { label: "Withdrawals", value: "Allowed after 6 months" },
    { label: "Offer ends", value: "Tonight at midnight" },
  ],
  note: "Spots are limited. Please keep this within the group.",
}

const feeTable: Doc = {
  kind: "table",
  title: "Comparing two funds",
  subtitle: "Both funds hold the same S&P 500 companies",
  rows: [
    { label: "Your balance", value: "$10,000" },
    { label: "Cedar 500 Index Fund", value: "0.05% a year" },
    { label: "Summit Select 500 Fund", value: "1.00% a year" },
  ],
  note: "Fees are taken from your balance whether the fund gains or loses.",
}

const unit: Unit = {
  id: "t2-u5",
  tier: 2,
  order: 5,
  title: "Investing for Real",
  tagline: "Learn how index funds, retirement accounts, and fees work, and how to spot hype.",
  color: "pink",
  emoji: "📊",

  guidebook: {
    intro:
      "This unit covers how long-term investing works in practice: index funds, diversification, retirement accounts, and fees. It also shows how to recognize hype and offers that are too good to be true.",
    keyIdeas: [
      {
        title: "Index funds follow a list",
        body: "An index fund buys what is on a list, like the S&P 500, so one purchase gives you a share of hundreds of companies. ETFs and mutual funds can both be index funds.",
      },
      {
        title: "Diversify",
        body: "Spreading your money across many companies, industries, and countries means one bad result can't do much damage.",
      },
      {
        title: "Match money to your timeline",
        body: "Money you need within a few years belongs in savings. Money for decades from now can be invested and given time to recover from drops. Selling in a panic locks in losses.",
      },
      {
        title: "Get the full match",
        body: "A 401(k) is a retirement plan through a job. If your employer matches contributions, putting in enough to get the full match adds money you would otherwise miss.",
      },
      {
        title: "A Roth IRA needs earned income",
        body: "You contribute money you've already paid tax on, and qualified withdrawals in retirement are tax-free. You can put in up to your earned income or the yearly limit, whichever is lower. Under 18, an adult opens a custodial Roth IRA with you.",
      },
      {
        title: "Watch fees, question hype",
        body: "Crypto and meme stocks are speculation, and guaranteed high returns are a warning sign. A fund's expense ratio is taken every year, so a lower fee leaves you more.",
      },
    ],
    funFacts: [
      "The first index fund for everyday investors launched in 1976. Critics called it \"Bogle's Folly,\" and index funds now hold trillions of dollars.",
      "The first US ETF launched in 1993 and tracked the S&P 500.",
      "The name \"401(k)\" comes from the section of the US tax code that created it.",
      "In 2010, a programmer paid 10,000 bitcoin for two pizzas. The value of those coins has since swung by hundreds of millions of dollars.",
      "Bitcoin's creator used the name Satoshi Nakamoto, and nobody has proven who that really is.",
      "In 1920, Charles Ponzi promised 50% returns in 45 days. That type of fraud now carries his name.",
    ],
    words: [
      { term: "Index fund", meaning: "A fund that holds what's on a market list, like the S&P 500." },
      { term: "ETF", meaning: "Exchange-traded fund. It trades all day, like a stock." },
      { term: "Expense ratio", meaning: "A fund's yearly fee, as a percent of your balance." },
      { term: "Diversification", meaning: "Spreading money across many investments to limit the damage from any one." },
      { term: "Risk tolerance", meaning: "How much up and down you can handle without selling in a panic." },
      { term: "Time horizon", meaning: "How long until you need the money." },
      { term: "Bear market", meaning: "Prices down 20% or more from a peak." },
      { term: "401(k)", meaning: "A retirement plan offered through a job." },
      { term: "Employer match", meaning: "Money your employer adds to your 401(k) when you contribute." },
      { term: "Roth IRA", meaning: "A retirement account funded with taxed money. Qualified withdrawals are tax-free." },
    ],
  },

  lessons: [
    /* ---------------- Lesson 1: Index funds & ETFs ---------------- */
    {
      id: "t2-u5-l1",
      title: "Index Funds and ETFs",
      description: "How one purchase can give you a small share of hundreds of companies.",
      exercises: [
        {
          type: "teach",
          id: "t2-u5-l1-e1",
          emoji: "🧺",
          title: "What a fund is",
          body: "A **fund** pools money from many investors and uses it to buy a large group of investments. When you buy into a fund, you own a small share of everything it holds.\n\nThat means one purchase spreads your money across many companies instead of betting on one.",
          example: "You put $50 into a fund that owns 500 companies. Your $50 now owns a very small piece of all 500.",
        },
        {
          type: "mc",
          id: "t2-u5-l1-e2",
          prompt: "You put $100 into a stock fund. What do you own?",
          choices: [
            { text: "A small share of everything the fund holds", correct: true },
            {
              text: "One share of the fund's largest company",
              why: "Your money isn't placed in a single company. It's spread across everything the fund owns, in the same proportions as the fund.",
            },
            {
              text: "A loan to the fund that it repays with interest",
              why: "That describes a bond. Owning a stock fund means owning part of its investments, and their value can rise or fall.",
            },
            {
              text: "A $100 balance that can't go down",
              why: "That sounds like an insured savings account. A fund's value moves with the investments inside it.",
            },
          ],
          explain: "Each investor owns a portion of the whole fund. If the investments inside rise in value, so does your share. The same is true for drops.",
        },
        {
          type: "teach",
          id: "t2-u5-l1-e3",
          emoji: "📋",
          title: "Index funds follow a list",
          body: "An **index** is a list that tracks part of the market. The best known, the **S&P 500**, follows about 500 large US companies.\n\nAn **index fund** simply buys what is on its list. Nobody is paid to research and pick stocks, so index funds tend to have low fees. The goal is to match the market, not beat it.",
        },
        {
          type: "tf",
          id: "t2-u5-l1-e4",
          statement: "An S&P 500 index fund tries to beat the S&P 500 by choosing only its strongest companies.",
          answer: false,
          explain: "False. An index fund holds what is on its list, strong and weak companies alike. Its goal is to match the index, which keeps its costs low.",
        },
        {
          type: "teach",
          id: "t2-u5-l1-e5",
          emoji: "🔁",
          title: "ETFs and mutual funds",
          body: "Funds come in two common forms:\n\n- An **ETF** (exchange-traded fund) is bought and sold on a stock exchange any time the market is open, like a stock.\n- A **mutual fund** is priced once a day, after the market closes.\n\nMany of both kinds are index funds. ETF or mutual fund describes how you buy it, not what it holds.",
        },
        {
          type: "mc",
          id: "t2-u5-l1-e6",
          doc: fundSummary,
          prompt: "Your uncle is helping you pick a fund for your custodial account. Based on this summary, how does the fund decide what to own?",
          choices: [
            { text: "It holds the companies on the S&P 500 list", correct: true },
            {
              text: "A manager picks the 500 stocks likely to rise most",
              why: "That describes an actively managed fund. This summary says the holdings follow the index list.",
            },
            {
              text: "It buys the 500 cheapest stocks on the market",
              why: "Share price has nothing to do with it. The S&P 500 is a list of large US companies, and many have high share prices.",
            },
            {
              text: "It changes its holdings based on each day's news",
              why: "The summary says it follows the index list. An index fund changes holdings when the list changes, not when the headlines do.",
            },
          ],
          explain: "An index fund's holdings come from its index. For this fund, that's the S&P 500, about 500 large US companies.",
        },
        {
          type: "tf",
          id: "t2-u5-l1-e7",
          doc: fundSummary,
          statement: "According to this summary, you can only buy or sell this fund once a day, after the market closes.",
          answer: false,
          explain: "False. This is an ETF, so it trades any time the market is open. Pricing once a day after the close is how mutual funds work.",
        },
        {
          type: "sort",
          id: "t2-u5-l1-e8",
          prompt: "One company or many? Sort each investment.",
          buckets: ["One company", "Many companies"],
          items: [
            { text: "Harbor Point Foods stock", bucket: 0 },
            { text: "An S&P 500 index fund", bucket: 1 },
            { text: "Cobalt Games stock", bucket: 0 },
            { text: "A total stock market ETF", bucket: 1 },
            { text: "A worldwide stock index fund", bucket: 1 },
            { text: "Calloway Motors stock", bucket: 0 },
            { text: "A technology sector ETF", bucket: 1 },
          ],
          explain: "A single stock depends on one company. A fund spreads your money across many. A technology ETF still holds many companies, but all in one industry, which matters in the next lesson.",
        },
        {
          type: "teach",
          id: "t2-u5-l1-e9",
          emoji: "🏆",
          funFact: true,
          title: "The fund critics laughed at",
          body: "The first index fund for everyday investors launched in 1976. Critics called it **\"Bogle's Folly,\"** after its founder, John Bogle. They didn't believe investors would settle for simply matching the market.\n\nToday, index funds hold trillions of dollars.",
        },
        {
          type: "tf",
          id: "t2-u5-l1-e10",
          statement: "Over long periods, most fund managers who try to beat the market end up doing worse than it after fees.",
          answer: true,
          explain: "True. Beating the market year after year is hard, even for professionals. After their higher fees, most fall behind a simple index fund over long periods.",
        },
        {
          type: "scenario",
          id: "t2-u5-l1-e11",
          emoji: "🧃",
          setup: "You're 16 and saved $200 from your job at a juice bar. Your parent helped you open a custodial investing account, and this money is for the long term. A friend says his cousin's favorite stock can't lose.",
          question: "What do you do with the $200?",
          choices: [
            {
              text: "Put all $200 into the cousin's stock",
              outcome: "Your whole $200 now depends on one company. If it has a bad year, nothing else in your account balances it out.",
            },
            {
              text: "Split it among three tech stocks you've read about",
              outcome: "Three is better than one, but they're in the same industry and can fall together. You're also choosing based on articles, not a plan.",
            },
            {
              text: "Buy a broad index fund that holds hundreds of companies",
              best: true,
              outcome: "Your $200 is spread across hundreds of companies. Some will do badly, but no single one can sink your account.",
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 2: Diversification, risk & crashes ---------------- */
    {
      id: "t2-u5-l2",
      title: "Risk, Diversification, and Crashes",
      description: "Spread your money out and plan for drops before they happen.",
      exercises: [
        {
          type: "teach",
          id: "t2-u5-l2-e1",
          emoji: "🧩",
          title: "Spread your money out",
          body: "**Diversification** means spreading your money across many investments, so one bad result can't do much damage. A diversified mix includes different companies, different industries, and different countries.\n\nA single stock depends on one company. A broad fund depends on hundreds or thousands of them.",
          example: "You own one company and it drops 50%: your account drops 50%. You own 500 companies in equal amounts and one drops 50%: your account drops 0.1%.",
        },
        {
          type: "mc",
          id: "t2-u5-l2-e2",
          prompt: "Which of these is the most diversified?",
          choices: [
            { text: "A fund holding thousands of companies in many countries", correct: true },
            {
              text: "A fund holding 40 technology companies",
              why: "It is a fund, but every company is in one industry. A bad year for tech can hit all 40 at once.",
            },
            {
              text: "Shares of three different social media companies",
              why: "Three companies is better than one, but they face the same risks. News that hurts one often hurts all three.",
            },
            {
              text: "Shares of the company your parent works for",
              why: "Knowing a company well doesn't spread your risk. If it struggles, your parent's job and your investment could both be affected.",
            },
          ],
          explain: "Diversification means many companies across many industries and places. A broad index fund does that in one purchase.",
        },
        {
          type: "teach",
          id: "t2-u5-l2-e3",
          emoji: "⏳",
          title: "Risk tolerance and time horizon",
          body: "**Risk tolerance** is how much up and down you can handle without selling in a panic.\n\nYour **time horizon**, when you'll need the money, matters even more. Money you need within a few years belongs in savings, because stocks can drop right before you need to sell. Money you won't touch for decades has time to recover from drops.",
        },
        {
          type: "sort",
          id: "t2-u5-l2-e4",
          prompt: "Where does the money for each goal belong?",
          buckets: ["Savings", "Investing"],
          items: [
            { text: "Prom costs next month", bucket: 0 },
            { text: "Emergency fund", bucket: 0 },
            { text: "Car down payment next year", bucket: 0 },
            { text: "Retirement in 45 years", bucket: 1 },
            { text: "Money left alone 25 years", bucket: 1 },
          ],
          explain: "If you need it within a few years, keep it in savings so it's there on time. Money with decades to go can handle the market's drops.",
        },
        {
          type: "teach",
          id: "t2-u5-l2-e5",
          emoji: "📉",
          title: "When the market drops",
          doc: crashStatement,
          body: "Stock prices sometimes fall hard. A drop of 20% or more from a peak is called a **bear market**, and a rising market is a **bull market**.\n\nA drop is a loss on paper until you sell. If you hold, you still own the same number of shares, and their price can recover. People who **panic-sell** lock in the loss and often miss the recovery.",
        },
        {
          type: "number",
          id: "t2-u5-l2-e6",
          doc: crashStatement,
          prompt: "Use the statement. By what percent did the account's value fall this quarter?",
          answer: 20,
          suffix: "%",
          explain: "The account lost $200, and $200 is 20% of $1,000. A fall of 20% or more from a peak is the usual line for a bear market.",
        },
        {
          type: "number",
          id: "t2-u5-l2-e7",
          doc: crashStatement,
          prompt: "The account is now worth $800. What percent gain would bring it back to $1,000?",
          answer: 25,
          suffix: "%",
          explain: "It needs $200 more, and $200 is 25% of $800. A recovery has to be larger in percent than the drop, because it starts from a smaller amount.",
        },
        {
          type: "tf",
          id: "t2-u5-l2-e8",
          statement: "The US stock market has recovered from every past crash, so it is guaranteed to recover from the next one.",
          answer: false,
          explain: "False. It has recovered from every crash so far, but some recoveries took years, and past results don't guarantee future ones. That's why money you need soon stays out of stocks.",
        },
        {
          type: "scenario",
          id: "t2-u5-l2-e9",
          emoji: "📊",
          doc: crashStatement,
          setup: "This is your account, and you're investing it for the long term. You won't need the money for decades. Your friends are talking about selling before prices fall further.",
          question: "What do you do?",
          choices: [
            {
              text: "Sell all 20 shares at $40 and wait for things to settle",
              outcome: "You lock in the $200 loss. If the price climbs back to $50 before you buy again, you miss the recovery.",
            },
            {
              text: "Stop adding money until prices recover",
              outcome: "You keep your shares, but you skip buying at $40, below January's price. People who wait for the right moment often buy back at higher prices.",
            },
            {
              text: "Keep your 20 shares and keep investing on schedule",
              best: true,
              outcome: "You still own all 20 shares. If the price returns to $50, they're worth $1,000 again, and anything you bought at $40 is worth more than you paid.",
            },
            {
              text: "Move it all into one stock that has been rising",
              outcome: "You've traded a diversified fund for one company's risk. If that stock falls, nothing else in your account balances it out.",
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 3: Retirement accounts (connected story) ---------------- */
    {
      id: "t2-u5-l3",
      title: "Jalen Starts Saving for Retirement",
      description: "Follow one person from a part-time job to a first 401(k).",
      exercises: [
        {
          type: "teach",
          id: "t2-u5-l3-e1",
          emoji: "🗓️",
          title: "Why retirement accounts exist",
          body: "**Retirement accounts** are investment accounts with tax benefits, meant for money you'll use decades from now. Because they're built for the long term, taking money out early can mean taxes and penalties.\n\nStarting young matters because money invested at 17 has more than 40 years to grow.",
          example: "At about 8% a year, money doubles roughly every 9 years (the Rule of 72). Over 45 years that's five doublings, so $1,000 could become about $32,000. Real returns vary from year to year.",
        },
        {
          type: "tf",
          id: "t2-u5-l3-e2",
          statement: "Money in a retirement account can usually be taken out at any age with no extra taxes or penalties.",
          answer: false,
          explain: "False. Retirement accounts trade flexibility for tax benefits. For a 401(k), taking money out before about age 59½ usually means income tax plus a 10% penalty, with some exceptions.",
        },
        {
          type: "teach",
          id: "t2-u5-l3-e3",
          emoji: "🌱",
          title: "The Roth IRA",
          body: "A **Roth IRA** is a retirement account you open on your own, not through a job. You put in money you've already paid tax on, and qualified withdrawals in retirement are **tax-free**.\n\nYou need **earned income**, money paid to you for work. You can put in up to what you earned that year or the IRS yearly limit, whichever is lower. Under 18, an adult opens a **custodial Roth IRA** with you.",
        },
        {
          type: "sort",
          id: "t2-u5-l3-e4",
          prompt: "Jalen, 17, wants to open a custodial Roth IRA with his mom. Which of his money this year counts as earned income?",
          buckets: ["Earned income", "Not earned"],
          items: [
            { text: "Cashier paychecks", bucket: 0 },
            { text: "Paid dog walking", bucket: 0 },
            { text: "Weekend lawn mowing jobs", bucket: 0 },
            { text: "Birthday cash from his aunt", bucket: 1 },
            { text: "Interest on his savings", bucket: 1 },
            { text: "Selling his old bike", bucket: 1 },
          ],
          explain: "Earned income is pay for work, whether from an employer or from jobs like dog walking and mowing. Gifts, interest, and money from selling your own things don't count.",
        },
        {
          type: "mc",
          id: "t2-u5-l3-e5",
          doc: jalenStub,
          prompt: "Here is Jalen's last pay stub of the year. The IRS limit is higher than his earnings. What's the most he can put in his Roth IRA?",
          choices: [
            { text: "$4,200.00", correct: true },
            {
              text: "$3,878.70",
              why: "That's his take-home pay. The cap is based on what he earned, his gross pay, not what was left after Social Security and Medicare.",
            },
            {
              text: "$300.00",
              why: "That's only his last paycheck. The cap uses his earnings for the whole year.",
            },
            {
              text: "The full IRS yearly limit",
              why: "The cap is whichever is lower: earned income or the IRS limit. Jalen earned less than the limit, so his earnings set the cap.",
            },
          ],
          explain: "Jalen's cap is the lower of his earned income ($4,200) or the IRS limit. Since he earned less than the limit, $4,200 is the most he can contribute.",
        },
        {
          type: "scenario",
          id: "t2-u5-l3-e6",
          emoji: "🧮",
          setup: "Jalen has $2,600 in savings from his year of work. He needs $600 for a school laptop in March and wants to keep $500 as an emergency fund. The rest can go into his Roth IRA.",
          question: "How much should Jalen contribute?",
          choices: [
            {
              text: "$1,500, keeping $1,100 in savings",
              best: true,
              outcome: "His laptop money and emergency fund stay in savings, and $1,500 goes into his Roth IRA to be invested for the long term.",
            },
            {
              text: "All $2,600, since starting early matters most",
              outcome: "His Roth IRA gets more, but in March he has no laptop money and no cushion for a surprise expense.",
            },
            {
              text: "$4,200, his contribution limit",
              outcome: "He only has $2,600. The limit is the most he's allowed to put in, not an amount he has to reach.",
            },
            {
              text: "Nothing until he turns 18",
              outcome: "He keeps the money but gives up a year of growth. Age isn't the barrier, since a custodial Roth IRA works at 17.",
            },
          ],
        },
        {
          type: "number",
          id: "t2-u5-l3-e7",
          prompt: "Jalen puts in $1,500. At about 8% a year, it doubles about every 9 years. From age 17 to 62 is five doublings. About how much would it become?",
          answer: 48000,
          prefix: "$",
          explain: "$1,500 doubles to $3,000, then $6,000, $12,000, $24,000, and $48,000. Real returns go up and down, so this is an estimate, not a promise.",
        },
        {
          type: "teach",
          id: "t2-u5-l3-e8",
          emoji: "🏢",
          title: "A first job with a 401(k)",
          doc: jalenOffer,
          body: "After graduating, Jalen gets a full-time job offer. It includes a **401(k)**, a retirement plan through his employer. Contributions come straight out of each paycheck, often before income tax (he would pay that tax later, when he takes the money out).\n\nThe offer also includes an **employer match**: money the company adds to his 401(k) when he contributes.",
        },
        {
          type: "number",
          id: "t2-u5-l3-e9",
          doc: jalenOffer,
          prompt: "Jalen chooses to put in 4% of each paycheck. How many dollars is that per paycheck?",
          answer: 56,
          prefix: "$",
          explain: "4% of $1,400 is $56. That amount comes out of each paycheck and goes into his 401(k).",
        },
        {
          type: "mc",
          id: "t2-u5-l3-e10",
          doc: jalenOffer,
          prompt: "At 4%, how much goes into Jalen's 401(k) each paycheck in total, counting the match?",
          choices: [
            { text: "$112", correct: true },
            {
              text: "$56",
              why: "That's only Jalen's part. Pinecrest matches 100% of it, up to 4% of pay, so it adds another $56.",
            },
            {
              text: "$84",
              why: "That would be the total with a 50% match. This offer matches 100%, so the company adds the full $56.",
            },
          ],
          explain: "Jalen puts in $56 and Pinecrest adds $56, so $112 goes in every paycheck.",
        },
        {
          type: "number",
          id: "t2-u5-l3-e11",
          doc: jalenOffer,
          prompt: "Over a full year of 26 paychecks, how much match money does Pinecrest add at 4%?",
          answer: 1456,
          prefix: "$",
          explain: "$56 × 26 = $1,456. Jalen also puts in $1,456 himself, so $2,912 goes into his 401(k) in his first year.",
        },
        {
          type: "scenario",
          id: "t2-u5-l3-e12",
          emoji: "📝",
          doc: jalenOffer,
          setup: "Rent and car insurance are taking most of Jalen's pay. He wonders whether to change his 401(k) contribution. Each 1% of pay is $14 per paycheck.",
          question: "What should he do?",
          choices: [
            {
              text: "Keep contributing 4% so he gets the full match",
              best: true,
              outcome: "Pinecrest keeps adding $56 every paycheck, $1,456 over the year, on top of his own contributions.",
            },
            {
              text: "Drop to 2% to keep more of each paycheck",
              outcome: "His paycheck grows a little, but the match falls to $28. Over 26 paychecks, he gives up $728 of match money.",
            },
            {
              text: "Stop contributing until he earns more",
              outcome: "He keeps the $56 per paycheck, but loses the whole match: $1,456 over the year.",
            },
            {
              text: "Raise it to 8% to get a bigger match",
              outcome: "The match stops at 4% of pay, so Pinecrest still adds $56. The extra helps his savings but not the match, and his budget is already tight.",
            },
          ],
        },
        {
          type: "tf",
          id: "t2-u5-l3-e13",
          statement: "If Jalen doesn't contribute to his 401(k), Pinecrest pays him the match as extra cash instead.",
          answer: false,
          explain: "False. A match is tied to your own contributions. If you don't contribute, the money is never added, and it isn't paid out as cash.",
        },
        {
          type: "match",
          id: "t2-u5-l3-e14",
          prompt: "Match each term from Jalen's plan to its meaning.",
          pairs: [
            { left: "401(k)", right: "Retirement plan through a job" },
            { left: "Employer match", right: "Money your employer adds to yours" },
            { left: "Roth IRA", right: "Taxed now, tax-free qualified withdrawals" },
            { left: "Earned income", right: "Money paid to you for work" },
            { left: "Custodian", right: "Adult who manages a minor's account" },
          ],
          explain: "These five terms cover the basics of starting retirement savings, from a first part-time job to a first full-time one.",
        },
      ],
    },

    /* ---------------- Lesson 4: Hype vs. reality ---------------- */
    {
      id: "t2-u5-l4",
      title: "Hype vs. Reality",
      description: "How to judge crypto, meme stocks, big promises, and fund fees.",
      exercises: [
        {
          type: "teach",
          id: "t2-u5-l4-e1",
          emoji: "📣",
          title: "Why hype spreads",
          body: "Sometimes a coin, a stock, or a trading method gets heavily **hyped**, and your feed fills with screenshots of people who made money fast.\n\nYou rarely see the people who bought late and lost, because they don't post. Seeing only the winners is called **survivorship bias**. The worried feeling that everyone else is getting rich is **FOMO**, fear of missing out.",
        },
        {
          type: "mc",
          id: "t2-u5-l4-e2",
          prompt: "Your feed is full of 'I made $5,000 this week' posts. Why are they a poor guide for your own money?",
          choices: [
            { text: "You mostly see winners, since people who lose rarely post", correct: true },
            {
              text: "Recent big gains usually mean the price will keep rising",
              why: "Prices that rose fast can fall just as fast. Past gains don't predict future ones, and hyped investments often drop when the attention fades.",
            },
            {
              text: "So many posts show the investment is proven",
              why: "Lots of posts show that something is popular, not that it's a good investment. Popularity is exactly what hype creates.",
            },
            {
              text: "Screenshots of an app balance are reliable proof",
              why: "Screenshots are easy to edit or choose selectively. Even real ones show one moment, not the losses before or after.",
            },
          ],
          explain: "This is survivorship bias. The people who lost money are just as real, but you don't hear from them.",
        },
        {
          type: "teach",
          id: "t2-u5-l4-e3",
          emoji: "🚀",
          title: "Crypto and meme stocks",
          body: "**Crypto** is digital money that runs on a computer network instead of a government or bank. Its prices can rise or fall by large amounts, sometimes within days, and it isn't covered by FDIC insurance.\n\nA **meme stock** is a stock whose price jumps because of online hype rather than changes in the business. Both are **speculation**: high-risk bets on price moves, not long-term plans.",
        },
        {
          type: "tf",
          id: "t2-u5-l4-e4",
          statement: "Crypto you hold on an app is protected by FDIC insurance, like money in a bank account.",
          answer: false,
          explain: "False. FDIC insurance covers deposits at banks, not crypto. If the price crashes or the platform fails, there's no FDIC protection.",
        },
        {
          type: "teach",
          id: "t2-u5-l4-e5",
          emoji: "🕳️",
          funFact: true,
          title: "Where Ponzi schemes got their name",
          body: "In 1920, Charles Ponzi promised investors **50% returns in 45 days**. He paid early investors with money from newer investors, not from real profits. When new money slowed down, the scheme collapsed.\n\nAny scheme that works this way is now called a **Ponzi scheme**. Common warning signs: guaranteed high returns, pressure to act fast, and rewards for recruiting others.",
        },
        {
          type: "mc",
          id: "t2-u5-l4-e6",
          doc: novaPitch,
          prompt: "A classmate forwards you this invitation. What does the guaranteed 25% a month tell you?",
          choices: [
            { text: "It's a warning sign, since high returns always carry risk", correct: true },
            {
              text: "It's safe, because the guarantee is in writing",
              why: "A written promise from an unknown group protects you from nothing. Scams often put big guarantees in writing to look official.",
            },
            {
              text: "It's normal for new crypto tokens",
              why: "New tokens are among the riskiest things you can buy. A guaranteed return on one is a sign something is wrong.",
            },
            {
              text: "It's fine if you only put in the $250 minimum",
              why: "A smaller amount limits the damage, but it doesn't make the offer real. You would still likely lose the $250.",
            },
          ],
          explain: "No honest investment can guarantee 25% a month. High possible returns always come with risk, and a guarantee like this usually means early members are being paid with new members' money.",
        },
        {
          type: "number",
          id: "t2-u5-l4-e7",
          doc: novaPitch,
          prompt: "Ignoring compounding, 25% a month adds up to what percent in a year?",
          answer: 300,
          suffix: "%",
          explain: "25% × 12 months = 300% a year. The S&P 500 has averaged roughly 10% a year over the long run, with big drops along the way. A promise 30 times higher than that isn't believable.",
        },
        {
          type: "sort",
          id: "t2-u5-l4-e8",
          prompt: "Sort each line you might see in an investment pitch.",
          buckets: ["Red flag", "Normal"],
          items: [
            { text: "Guaranteed 25% a month", bucket: 0 },
            { text: "Offer ends tonight", bucket: 0 },
            { text: "Bonus for recruiting friends", bucket: 0 },
            { text: "Keep this within the group", bucket: 0 },
            { text: "Returns vary year to year", bucket: 1 },
            { text: "Expense ratio: 0.05% a year", bucket: 1 },
            { text: "Past returns aren't guaranteed", bucket: 1 },
          ],
          explain: "Honest investment materials describe risk and fees and make no guarantees. Pressure, secrecy, guarantees, and recruiting bonuses are signs of a scam.",
        },
        {
          type: "scenario",
          id: "t2-u5-l4-e9",
          emoji: "📱",
          doc: novaPitch,
          setup: "You have $300 saved toward a used bike. Your classmate says she already joined NovaYield and wants you to sign up tonight.",
          question: "What do you do?",
          choices: [
            {
              text: "Join with the $250 minimum and keep $50",
              outcome: "Your money is locked for six months under the club's rules. When new members stop joining, the payments stop, and your $250 is gone.",
            },
            {
              text: "Join, then recruit two friends to earn $80 back",
              outcome: "You pull your friends into the same losses. When the club stops paying, you've lost $250 and they've lost theirs.",
            },
            {
              text: "Ask the club for proof of its returns first",
              outcome: "They send screenshots and member testimonials. Those are easy to fake, and none of it explains how 25% a month is possible.",
            },
            {
              text: "Pass, and tell your classmate why it looks like a scam",
              best: true,
              outcome: "Your bike money stays safe. You can report the offer at ReportFraud.ftc.gov, and your classmate may avoid putting in more.",
            },
          ],
        },
        {
          type: "teach",
          id: "t2-u5-l4-e10",
          emoji: "🧾",
          title: "Fees add up",
          doc: feeTable,
          body: "Every fund charges a yearly fee called the **expense ratio**, shown as a percent of your balance. It's taken every year, in good years and bad ones.\n\nA 1% fee sounds small, but many broad index funds charge only a small fraction of 1%. Over decades, that difference can add up to thousands of dollars.",
        },
        {
          type: "number",
          id: "t2-u5-l4-e11",
          doc: feeTable,
          prompt: "How much would Summit Select charge on your $10,000 in one year?",
          answer: 100,
          prefix: "$",
          explain: "1% of $10,000 is $100. Cedar's 0.05% would cost $5 on the same balance. Even if your balance never grew, that's $1,000 versus $50 over 10 years.",
        },
        {
          type: "mc",
          id: "t2-u5-l4-e12",
          doc: feeTable,
          prompt: "Over 30 years, which fund will likely leave you with more money?",
          choices: [
            { text: "Cedar, the fund with the lower fee", correct: true },
            {
              text: "Summit Select, since a higher fee pays for better results",
              why: "Both funds hold the same companies, so they earn the same returns before fees. The higher fee simply comes out of yours.",
            },
            {
              text: "About the same, since the gap is under 1%",
              why: "Under 1% a year sounds small, but it's taken every year from a growing balance. Over 30 years, the gap can reach thousands of dollars.",
            },
            {
              text: "Whichever fund has the lower share price",
              why: "Share price doesn't change your return. What you keep depends on the fund's returns minus its fees.",
            },
          ],
          explain: "When two funds hold the same investments, the one with the lower fee leaves you more. Fees are one of the few parts of investing you control.",
        },
      ],
    },
  ],

  quiz: {
    passPercent: 70,
    exercises: [
      {
        type: "mc",
        id: "t2-u5-q-e1",
        prompt: "What does an S&P 500 index fund do?",
        choices: [
          { text: "Holds the S&P 500 companies to match its results", correct: true },
          {
            text: "Picks the 500 stocks expected to rise most each year",
            why: "No one picks stocks for it. It follows the index, which tracks about 500 large US companies.",
          },
          {
            text: "Guarantees a return of about 10% a year",
            why: "Nothing guarantees that. The S&P 500 has averaged roughly 10% a year over the long run, with big drops along the way.",
          },
          {
            text: "Lends money to 500 companies in exchange for interest",
            why: "That describes bonds. A stock index fund owns shares of companies, not loans to them.",
          },
        ],
        explain: "An index fund owns what is on its list. The aim is to match the market at a low cost.",
      },
      {
        type: "tf",
        id: "t2-u5-q-e2",
        statement: "An ETF can be bought and sold throughout the day while the market is open.",
        answer: true,
        explain: "True. That's what exchange-traded means. A mutual fund is priced once a day, after the market closes.",
      },
      {
        type: "number",
        id: "t2-u5-q-e3",
        prompt: "Your $2,000 investment falls 25% during a bear market. What is it worth now?",
        answer: 1500,
        prefix: "$",
        explain: "25% of $2,000 is $500, so it's worth $1,500. The loss is only locked in if you sell.",
      },
      {
        type: "tf",
        id: "t2-u5-q-e4",
        statement: "If an investment falls 20%, it needs to gain 20% to get back to where it started.",
        answer: false,
        explain: "False. It needs more. $1,000 down 20% is $800, and getting back to $1,000 takes a $200 gain, which is 25% of $800.",
      },
      {
        type: "mc",
        id: "t2-u5-q-e5",
        prompt: "Which plan best matches the money to its time horizon?",
        choices: [
          { text: "Keeping a car down payment due in 6 months in savings", correct: true },
          {
            text: "Investing next month's rent money in a stock index fund",
            why: "Stocks can drop within a month, and rent is due no matter what. Money you need soon belongs in savings.",
          },
          {
            text: "Keeping retirement money for 45 years away only in cash",
            why: "Cash won't drop, but over 45 years it will likely grow far less than invested money. Long-term money has time to recover from drops.",
          },
          {
            text: "Putting your emergency fund into a single stock",
            why: "An emergency fund has to be there the day you need it. One stock can fall sharply right when that happens.",
          },
        ],
        explain: "Money you need soon goes in savings so it's there on time. Money you won't need for decades can be invested and has time to recover.",
      },
      {
        type: "number",
        id: "t2-u5-q-e6",
        prompt: "You earn $30,000 a year. Your employer matches 50% of what you put in, up to 6% of pay. You put in $1,800. How much does your employer add?",
        answer: 900,
        prefix: "$",
        explain: "$1,800 is exactly 6% of $30,000, so all of it qualifies for the match. Half of $1,800 is $900.",
      },
      {
        type: "mc",
        id: "t2-u5-q-e7",
        prompt: "Leah, 16, earned $2,800 at a summer job and got $500 in birthday gifts. The IRS limit is higher. What's the most she can put in a custodial Roth IRA?",
        choices: [
          { text: "$2,800", correct: true },
          {
            text: "$3,300",
            why: "Gifts aren't earned income. Only the $2,800 she was paid for work counts.",
          },
          {
            text: "The full IRS yearly limit",
            why: "She can contribute up to her earned income or the IRS limit, whichever is lower. Her earnings are lower.",
          },
          {
            text: "$0, because she's under 18",
            why: "Minors can have a custodial Roth IRA with an adult. What matters is earned income, not age.",
          },
        ],
        explain: "Her cap is the lower of her earned income or the IRS limit. She earned $2,800 from work, so that's her maximum.",
      },
      {
        type: "tf",
        id: "t2-u5-q-e8",
        statement: "When many people in your feed post big gains from the same coin, that is good evidence it's a sound investment.",
        answer: false,
        explain: "False. People who lost money rarely post, so you mostly see the winners. Popularity shows hype, not whether a coin is a sound long-term investment.",
      },
      {
        type: "fill",
        id: "t2-u5-q-e9",
        prompt: "Pick the right term.",
        sentence: "A fund's yearly fee, shown as a percent of your balance, is called its ___.",
        answers: ["expense ratio"],
        bank: ["expense ratio", "interest rate", "APY", "share price"],
        explain: "The expense ratio is taken every year. On $10,000, a 1% expense ratio costs $100 a year, while 0.05% costs $5.",
      },
      {
        type: "scenario",
        id: "t2-u5-q-e10",
        emoji: "💻",
        setup: "An influencer says a meme stock will double this week. You have $400 saved for a used laptop you need for school next month.",
        question: "What do you do?",
        choices: [
          {
            text: "Invest the $400 and sell before you need the laptop",
            outcome: "The stock is down 40% when you sell. You have $240 and can't afford the laptop.",
          },
          {
            text: "Invest $200 and keep $200 in savings",
            outcome: "The stock falls 40%, and your $200 is worth $120. Now you're $80 short for the laptop.",
          },
          {
            text: "Keep all $400 in savings and buy the laptop next month",
            best: true,
            outcome: "You buy the laptop on time. Money you need next month isn't money to speculate with.",
          },
        ],
      },
    ],
  },
}

export default unit
