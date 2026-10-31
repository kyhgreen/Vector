import type { Doc, Unit } from '../types'

/* Documents reused across exercises (each exercise shows on its own screen). */

const andreQuote: Doc = {
  kind: 'offer',
  title: 'Copperleaf Insurance: auto quote',
  subtitle: 'Driver: Ethan Morales, 18 · 2015 sedan',
  rows: [
    { label: 'Liability coverage', value: 'Included in both' },
    { label: 'Option A deductible', value: '$500' },
    { label: 'Option A monthly premium', value: '$145.00', strong: true },
    { label: 'Option B deductible', value: '$1,000' },
    { label: 'Option B monthly premium', value: '$120.00', strong: true },
  ],
  note: 'The deductible applies to repairs to your own car after a covered accident.',
}

const andreClaim: Doc = {
  kind: 'statement',
  title: 'Copperleaf Insurance: auto claim summary',
  subtitle: 'Policyholder: Ethan Morales · Option A',
  rows: [
    { label: 'Damage', value: 'Rear bumper and trunk lid' },
    { label: 'Your deductible', value: '$500' },
    { label: 'Parts', value: '$1,380' },
    { label: 'Labor', value: '$920' },
    { label: 'Total repair estimate', value: '$2,300', strong: true },
  ],
}

const andreRenters: Doc = {
  kind: 'statement',
  title: 'Copperleaf Insurance: renters claim summary',
  subtitle: 'Policyholder: Ethan Morales · $17 a month',
  rows: [
    { label: 'Loss', value: 'Laptop stolen from apartment' },
    { label: 'Your deductible', value: '$250' },
    { label: 'Approved replacement cost', value: '$1,100', strong: true },
  ],
}

const lenaReport: Doc = {
  kind: 'table',
  title: 'Credit report: accounts summary',
  subtitle: 'Lena Haddad · Report date Oct 3',
  rows: [
    { label: 'Cedar Valley CU secured card', value: '$45' },
    { label: 'Opened Jun 2026', value: 'Paid on time', indent: true },
    { label: 'Summit Ridge Auto Finance loan', value: '$14,800' },
    { label: 'Opened Feb 2026', value: '60 days late', indent: true },
    { label: 'Collection: Westbrook Wireless', value: '$412' },
    { label: 'Reported Apr 2026', value: 'Unpaid', indent: true },
    { label: 'Total balances reported', value: '$15,257', strong: true },
  ],
  note: 'Free reports from all three bureaus: AnnualCreditReport.com',
}

const jasmineOffer: Doc = {
  kind: 'offer',
  title: 'Crestline Talent Group: job offer',
  subtitle: 'To: Jasmine Cole · Sent by text message',
  rows: [
    { label: 'Position', value: 'Remote personal assistant' },
    { label: 'Pay', value: '$35 an hour' },
    { label: 'Hours', value: 'Flexible, about 10 a week' },
    { label: 'Interview', value: 'Not required' },
    { label: 'First task', value: 'Buy supplies with a check we mail you' },
    { label: 'Respond by', value: 'Within 24 hours' },
    { label: 'Estimated weekly pay', value: '$350', strong: true },
  ],
}

const jasmineStatement: Doc = {
  kind: 'statement',
  title: 'Lakeshore Bank: checking activity',
  subtitle: 'Account holder: Jasmine Cole',
  rows: [
    { label: 'Starting balance', value: '$320.00' },
    { label: 'Mar 3: check deposit', value: '+$1,950.00' },
    { label: 'Mar 5: payment app transfer', value: '-$1,700.00' },
    { label: 'Mar 16: check returned, counterfeit', value: '-$1,950.00' },
    { label: 'Mar 16: returned item fee', value: '-$15.00' },
    { label: 'Ending balance', value: '-$1,395.00', strong: true },
  ],
}

const graceSnapshot: Doc = {
  kind: 'table',
  title: "Grace's money snapshot, Oct 1",
  subtitle: 'Grace Kim, age 19',
  rows: [
    { label: 'Checking', value: '$640' },
    { label: 'Savings', value: '$1,850' },
    { label: 'Car (resale value)', value: '$4,500' },
    { label: 'Total assets', value: '$6,990', strong: true },
    { label: 'Car loan', value: '$3,200' },
    { label: 'Credit card balance', value: '$310' },
    { label: 'Total liabilities', value: '$3,510', strong: true },
  ],
}

const unit: Unit = {
  id: 't2-u7',
  tier: 2,
  order: 7,
  title: 'Protect Your Money',
  tagline: 'Learn how insurance, credit freezes, and scam awareness protect the money you earn.',
  color: 'orange',
  emoji: '🛡️',

  guidebook: {
    intro:
      "Earning and saving are only part of managing money. This unit covers the common ways people lose money they already have: an expensive accident, a stolen identity, or a scam. You'll learn how insurance works, how to lock down your credit, how to recognize scams aimed at teens, and how to measure where you stand with net worth.",
    keyIdeas: [
      {
        title: 'Insurance covers costs too big to pay alone',
        body: 'You pay a premium every month or year. If something covered goes wrong, you pay the deductible and the insurer pays the rest of the covered cost, up to the limits in your policy.',
      },
      {
        title: 'Pick a deductible you can pay',
        body: 'A higher deductible usually lowers your premium. That only helps if you could cover the deductible from savings on the day you need to.',
      },
      {
        title: 'A credit freeze blocks new accounts',
        body: "A credit freeze is free at Equifax, Experian, and TransUnion. It stops lenders from viewing your report, doesn't affect your score, and can be lifted when you apply for credit.",
      },
      {
        title: 'Guard your SSN, passwords, and codes',
        body: 'Your Social Security number can be used to open accounts in your name. Share it only when it is truly required, and never share a password or 2-factor code with anyone.',
      },
      {
        title: 'Scams share the same warning signs',
        body: 'Pressure to act fast, requests for secrecy, and payment by gift card, crypto, or wire transfer are red flags. A real job pays you. It never asks you to pay to start or to move money through your account.',
      },
      {
        title: 'Net worth is what you own minus what you owe',
        body: 'Subtract your liabilities from your assets to get your net worth. It is a snapshot of one day, and many people start adult life with a negative number because of student or car loans.',
      },
    ],
    funFacts: [
      "Modern insurance grew in part out of Edward Lloyd's coffee house in London in the late 1600s, where ship owners met people willing to insure their voyages.",
      'Before 2011, the first three digits of a Social Security number were tied to the state where the person applied. Since 2011, numbers have been assigned randomly.',
      'The "ph" in phishing is usually traced to "phone phreaks," early hackers who experimented with telephone systems.',
      'IdentityTheft.gov, run by the Federal Trade Commission, creates a step-by-step recovery plan for people whose identity has been stolen.',
      'Scammers ask for gift cards because once the numbers on the back are shared, the money can be spent quickly and is hard to get back.',
    ],
    words: [
      { term: 'Premium', meaning: 'What you pay regularly to keep insurance coverage' },
      { term: 'Deductible', meaning: 'What you pay toward a claim before insurance pays the rest' },
      { term: 'Claim', meaning: 'A request for your insurer to pay for a loss' },
      { term: 'Liability insurance', meaning: 'Pays for damage or injuries you cause to other people' },
      { term: 'Identity theft', meaning: 'Someone using your personal information to pretend to be you' },
      { term: 'Credit freeze', meaning: 'A free block on new credit accounts in your name' },
      { term: 'Phishing', meaning: 'Fake messages meant to trick you into sharing logins or personal information' },
      { term: 'Money mule', meaning: 'A person who moves stolen money for criminals, often without realizing it' },
      { term: 'Liability (debt)', meaning: 'Money you owe, such as a loan or credit card balance' },
      { term: 'Net worth', meaning: 'Your assets (what you own) minus your liabilities (what you owe)' },
    ],
  },

  lessons: [
    /* ---------------- Lesson 1: Insurance basics (connected story: Ethan) ---------------- */
    {
      id: 't2-u7-l1',
      title: 'Insurance Basics',
      description: 'Follow Ethan through a car insurance quote, a claim, health coverage, and renters insurance.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u7-l1-e1',
          emoji: '🚗',
          title: 'How insurance works',
          body: "**Insurance** is a contract. You pay a regular amount, and the insurance company agrees to pay for certain large losses if they happen.\n\nIt works because many people pay in, while only a few have an expensive loss in any given year. Their combined payments cover those losses.\n\nIn this lesson, you'll follow Ethan, 18, as he insures the used car he just bought.",
        },
        {
          type: 'mc',
          id: 't2-u7-l1-e2',
          prompt: 'What is the main reason people buy insurance?',
          choices: [
            { text: 'To swap a large, unpredictable cost for smaller, planned payments', correct: true },
            {
              text: 'To get money back in years without an accident',
              why: "Insurance isn't a savings account. In a year with no claims, your payments covered protection you didn't end up needing, and they aren't returned.",
            },
            {
              text: 'To have every bill paid, big or small',
              why: 'Policies cover specific risks up to set limits, and you usually pay a share first. Small costs are often paid out of pocket.',
            },
          ],
          explain: "Insurance protects you from a cost you couldn't cover on your own. Most years you pay and never file a claim, which means nothing went badly wrong.",
        },
        {
          type: 'teach',
          id: 't2-u7-l1-e3',
          emoji: '📄',
          title: 'Reading a quote',
          body: "Ethan's insurer sent him a quote with two options. Two terms decide the price:\n\n- **Premium**: what he pays every month to stay covered, even if nothing happens.\n- **Deductible**: what he pays toward a claim before insurance pays the rest.\n\nA **claim** is a request for the insurer to pay for a loss.",
          doc: andreQuote,
        },
        {
          type: 'number',
          id: 't2-u7-l1-e4',
          prompt: 'Option B costs less each month. Over a full year, how much less would Ethan pay in premiums with Option B?',
          answer: 300,
          prefix: '$',
          explain: "$145 minus $120 is $25 a month. Over 12 months, that's $300.",
          doc: andreQuote,
        },
        {
          type: 'teach',
          id: 't2-u7-l1-e5',
          emoji: '⚖️',
          title: 'The deductible tradeoff',
          body: 'A higher deductible usually lowers your premium, because you agree to pay more of each claim yourself.\n\nThat trade only works if you can pay the deductible when something happens. A good test is whether you could cover it from savings tomorrow without borrowing.\n\nAndre has **$700** in savings.',
        },
        {
          type: 'scenario',
          id: 't2-u7-l1-e6',
          emoji: '🚗',
          setup: 'Ethan has $700 saved. Option B would save him $300 a year in premiums, but its deductible is $1,000.',
          question: 'Which option should Ethan choose?',
          choices: [
            {
              text: 'Option A, since he could pay a $500 deductible today',
              best: true,
              outcome: 'He pays $25 more each month, but if he has a claim, he can cover his share from savings right away.',
            },
            {
              text: 'Option B, since $300 a year is real savings',
              outcome: 'He keeps more each month, but a claim in the next several months would leave him owing $1,000 with only $700 saved.',
            },
            {
              text: 'Option B, and save the $25 difference each month',
              outcome: 'A reasonable long-term plan, but it takes 12 months of saving $25 to grow $700 into $1,000. A claim before then leaves him short.',
            },
          ],
          doc: andreQuote,
        },
        {
          type: 'number',
          id: 't2-u7-l1-e7',
          prompt: 'Four months after choosing Option A, Ethan backs into a pole in a parking lot. Using the claim summary, how much will Copperleaf pay?',
          answer: 1800,
          prefix: '$',
          explain: '$2,300 minus his $500 deductible is $1,800. Ethan pays the first $500 from his savings, which leaves him with $200.',
          doc: andreClaim,
        },
        {
          type: 'mc',
          id: 't2-u7-l1-e8',
          prompt: 'Suppose Ethan had picked Option B instead. What would this same repair have cost him out of pocket?',
          choices: [
            { text: '$1,000', correct: true },
            {
              text: '$1,300',
              why: "That's what Copperleaf would pay under Option B: $2,300 minus $1,000. Ethan's share is the deductible.",
            },
            {
              text: '$500',
              why: '$500 is the Option A deductible. Under Option B, his share of each claim would be $1,000.',
            },
            {
              text: '$2,300',
              why: 'Insurance would still pay part of the bill. Ethan would pay the first $1,000, and Copperleaf would pay the other $1,300.',
            },
          ],
          explain: 'He would have owed $1,000 with only $700 saved. Four months of the cheaper premium would have saved him just $100, not enough to close the $300 gap.',
          doc: andreClaim,
        },
        {
          type: 'teach',
          id: 't2-u7-l1-e9',
          emoji: '🛣️',
          title: 'Coverage the law requires',
          body: "Ethan's policy also includes **liability** coverage. If he causes a crash, it pays for damage and injuries he causes to other people, up to the policy's limits.\n\nNearly every state requires drivers to carry liability insurance. Repairs to his own car, like the bumper, fall under a different part of the policy, which is where his deductible applied.",
        },
        {
          type: 'tf',
          id: 't2-u7-l1-e10',
          statement: "Ethan's liability coverage is what paid to fix his own bumper.",
          answer: false,
          explain: 'Liability pays for damage and injuries you cause to other people. The bumper repair came from the part of his policy that covers his own car, after his $500 deductible.',
        },
        {
          type: 'teach',
          id: 't2-u7-l1-e11',
          emoji: '🏠',
          title: 'Health and renters insurance',
          body: "**Health insurance** helps pay for doctor visits, prescriptions, and hospital care. Ethan is on his mother's plan, and under the Affordable Care Act he can usually stay on a parent's plan until age 26.\n\nAt 19, Ethan moves into an apartment. His landlord's insurance covers the building, not his belongings. **Renters insurance** covers his own things and often costs around $15 to $30 a month.",
        },
        {
          type: 'sort',
          id: 't2-u7-l1-e12',
          prompt: 'Which type of insurance would usually help pay?',
          buckets: ['Car', 'Health', 'Renters'],
          items: [
            { text: 'Another car you hit', bucket: 0 },
            { text: 'Your car hits a pole', bucket: 0 },
            { text: 'Urgent care for a sprain', bucket: 1 },
            { text: 'A yearly checkup', bucket: 1 },
            { text: 'Laptop stolen from your apartment', bucket: 2 },
            { text: 'Belongings ruined by fire', bucket: 2 },
          ],
          explain: 'Car insurance covers crashes, health insurance covers medical care, and renters insurance covers your belongings in a rental.',
        },
        {
          type: 'number',
          id: 't2-u7-l1-e13',
          prompt: "Later that year, Ethan's laptop is stolen from his apartment. Using the claim summary, how much will his renters insurance pay?",
          answer: 850,
          prefix: '$',
          explain: '$1,100 minus the $250 deductible is $850. His policy costs $17 a month, or $204 a year, so this one claim was worth far more than a year of premiums.',
          doc: andreRenters,
        },
        {
          type: 'fill',
          id: 't2-u7-l1-e14',
          sentence: 'Ethan pays his ___ every month to stay covered. When he files a ___, he pays the deductible first.',
          answers: ['premium', 'claim'],
          bank: ['premium', 'claim', 'deductible', 'policy', 'refund'],
          explain: 'The premium is the ongoing cost of coverage. The deductible only comes up when you file a claim.',
        },
      ],
    },

    /* ---------------- Lesson 2: Identity theft & credit freezes ---------------- */
    {
      id: 't2-u7-l2',
      title: 'Identity Theft and Credit Freezes',
      description: 'How identity theft happens, how to spot it on a credit report, and how to stop it.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u7-l2-e1',
          emoji: '🪪',
          title: 'What identity theft is',
          body: '**Identity theft** happens when someone uses your personal information to pretend to be you. They might open a credit card, take out a loan, or file a tax return in your name.\n\nThe most valuable piece is your **Social Security number** (SSN). Combined with your name and birth date, it can be enough to open new accounts.',
        },
        {
          type: 'mc',
          id: 't2-u7-l2-e2',
          prompt: 'A website running a free contest asks for your Social Security number to enter. What should you do?',
          choices: [
            { text: 'Skip it. A contest has no reason to need your SSN.', correct: true },
            {
              text: 'Enter it if the site looks professional and secure',
              why: 'Scam sites can look polished and still show a lock icon. However it looks, a contest has no legitimate need for your SSN.',
            },
            {
              text: 'Enter only the last four digits',
              why: "Partial numbers still help thieves piece together your identity, and a contest doesn't need any part of it.",
            },
          ],
          explain: "Share your SSN only when it's truly required, such as for a job, a bank account, or tax forms. When in doubt, ask why it's needed.",
        },
        {
          type: 'teach',
          id: 't2-u7-l2-e3',
          emoji: '🔐',
          title: 'Protect your logins',
          body: "Thieves also go after accounts you already have. A few habits block most attempts:\n\n- Use a different password for each important account. A password manager can keep track of them.\n- Turn on **2-factor login**, which asks for a one-time code as well as your password.\n- Never share a password or code. Real companies won't ask for them.",
        },
        {
          type: 'fill',
          id: 't2-u7-l2-e4',
          sentence: "A caller says they're from your bank's fraud team and asks for the ___ code they just texted you. You should ___ and call the number on your card.",
          answers: ['2-factor', 'hang up'],
          bank: ['2-factor', 'hang up', 'promo', 'read it back', 'confirm it'],
          explain: 'Your bank will never ask you for a 2-factor code. Anyone who asks is trying to get into your account. Hang up and call the number on the back of your card to check.',
        },
        {
          type: 'teach',
          id: 't2-u7-l2-e5',
          emoji: '📄',
          title: 'Check your credit report',
          body: "Most teens have no credit history yet, and nobody is watching for new accounts in their name. A stolen SSN can be misused for years before anyone notices. At 18, you can get free reports from all three bureaus at **AnnualCreditReport.com**, as often as weekly.\n\nLena, 18, just pulled her first report. The only account she has opened is a secured card from her credit union.",
          doc: lenaReport,
        },
        {
          type: 'tf',
          id: 't2-u7-l2-e6',
          statement: "Teens are rarely targeted by identity thieves, because they don't have a credit history yet.",
          answer: false,
          explain: 'An empty credit history is part of the appeal. A stolen teen SSN can be used for years before anyone checks, often until the teen applies for a first card or loan.',
        },
        {
          type: 'mc',
          id: 't2-u7-l2-e7',
          prompt: 'Lena has never had a car loan or a phone plan in her own name. Which items on her report point to identity theft?',
          choices: [
            { text: 'The auto loan and the collection', correct: true },
            {
              text: 'Only the auto loan',
              why: 'The collection matters too. A debt for a phone plan she never had means someone used her information to open it.',
            },
            {
              text: "The secured card, since it's new",
              why: "Lena opened that card herself, and it shows on-time payments. It's the one item that belongs on her report.",
            },
            {
              text: "None, since reports often include other people's accounts",
              why: 'Report errors do happen, but two accounts she never opened need to be checked right away as possible identity theft.',
            },
          ],
          explain: "Any account, loan, or debt you don't recognize is a warning sign. Lena should act before the late payments do more damage.",
          doc: lenaReport,
        },
        {
          type: 'scenario',
          id: 't2-u7-l2-e8',
          emoji: '📄',
          setup: 'Lena has found two accounts on her credit report that she never opened. The auto loan is already 60 days late.',
          question: 'What should she do first?',
          choices: [
            {
              text: 'Report it at IdentityTheft.gov and dispute the accounts',
              best: true,
              outcome: 'She gets a recovery plan and an identity theft report to send to the lender and the credit bureaus. Then she freezes her credit at all three bureaus.',
            },
            {
              text: 'Pay the $412 collection so it stops hurting her score',
              outcome: 'She pays a debt that was never hers. The fake auto loan stays on her report, and nothing stops the thief from opening more accounts.',
            },
            {
              text: 'Close her secured card to be safe',
              outcome: 'Her own card was never the problem. Closing it does nothing about the fake loan or the collection.',
            },
            {
              text: 'Wait a month to see if the accounts drop off',
              outcome: 'The loan keeps reporting missed payments in her name, and the record of late payments gets longer.',
            },
          ],
          doc: lenaReport,
        },
        {
          type: 'teach',
          id: 't2-u7-l2-e9',
          emoji: '🧊',
          title: 'The credit freeze',
          body: "A **credit freeze** stops lenders from viewing your credit report, which blocks most new accounts from being opened in your name.\n\n- It's free at Equifax, Experian, and TransUnion. Place one at each.\n- It doesn't affect your credit score.\n- You can lift it temporarily when you apply for credit.\n\nParents can also place a freeze for a child.",
        },
        {
          type: 'mc',
          id: 't2-u7-l2-e10',
          prompt: 'Lena freezes her credit at all three bureaus. What does the freeze protect her from?',
          choices: [
            { text: 'New credit accounts opened in her name', correct: true },
            {
              text: 'Charges on a card number that was already stolen',
              why: "A freeze doesn't affect existing accounts. A stolen card number has to be reported to the card's issuer.",
            },
            {
              text: 'Any change to her credit score',
              why: 'Her score still changes based on how she pays her own accounts. A freeze only limits who can view her report.',
            },
            {
              text: 'Phishing texts and scam calls',
              why: 'A freeze has nothing to do with her phone or email. She still needs to watch for scam messages.',
            },
          ],
          explain: "A freeze blocks new credit. It doesn't replace checking your accounts and credit reports regularly.",
        },
        {
          type: 'tf',
          id: 't2-u7-l2-e11',
          statement: 'To fully freeze her credit, Lena has to contact Equifax, Experian, and TransUnion separately.',
          answer: true,
          explain: "Each bureau keeps its own report, and a lender might check any one of them. A freeze at one bureau doesn't carry over to the other two.",
        },
      ],
    },

    /* ---------------- Lesson 3: Scams aimed at teens ---------------- */
    {
      id: 't2-u7-l3',
      title: 'Scams Aimed at Teens',
      description: 'Fake jobs, fake checks, money mules, and giveaway scams, and how to recognize them.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u7-l3-e1',
          emoji: '🎣',
          title: 'Why scammers target teens',
          body: "Scammers go after teens because many are looking for first jobs and side income, spend a lot of time online, and haven't seen these tricks before.\n\nMost scams share three signs:\n- **Pressure** to act right away\n- A request to keep it **secret**\n- Payment by gift card, crypto, or wire transfer",
        },
        {
          type: 'mc',
          id: 't2-u7-l3-e2',
          prompt: 'Which message is the clearest sign of a scam?',
          choices: [
            { text: '"Pay the $40 activation fee with a gift card."', correct: true },
            {
              text: '"Please fill out a W-4 before your first shift."',
              why: "Employers really do ask new hires for a W-4 so they can withhold taxes. It's a normal part of starting a job.",
            },
            {
              text: "\"Now that you're hired, we need your SSN for payroll.\"",
              why: 'After you are hired, an employer does need your SSN for tax forms. The warning sign is being asked before any interview or offer.',
            },
          ],
          explain: "Real businesses and government agencies don't take payment in gift cards. Once you share the card numbers, the money is usually gone for good.",
        },
        {
          type: 'teach',
          id: 't2-u7-l3-e3',
          emoji: '📱',
          title: "An offer that's too easy",
          body: "Jasmine, 17, posted her résumé on a job site. The next day, this offer arrives by text.\n\nReal employers usually interview you, give you time to decide, and never send you money to spend before you've done any work. Compare that with what this offer says.",
          doc: jasmineOffer,
        },
        {
          type: 'mc',
          id: 't2-u7-l3-e4',
          prompt: 'Several lines in this offer are warning signs. Which one is how the scammer plans to take her money?',
          choices: [
            { text: 'The check they will mail her for supplies', correct: true },
            {
              text: 'The $35 hourly pay',
              why: "Pay that high for a first job with no interview is a warning sign. It's there to get her interested, but it doesn't cost her anything by itself.",
            },
            {
              text: 'Skipping the interview',
              why: "Hiring with no interview is a red flag, because it lets them sign up anyone quickly. Still, skipping an interview doesn't take money from her. The check does.",
            },
            {
              text: 'The 24-hour deadline',
              why: 'The deadline is meant to rush her before she asks anyone for advice. It adds pressure, but the check is what will cost her money.',
            },
          ],
          explain: 'Together, these details match a common fake-job scam. The high pay and the deadline pull her in, and the check is where the loss happens, as the next card shows.',
          doc: jasmineOffer,
        },
        {
          type: 'teach',
          id: 't2-u7-l3-e5',
          emoji: '🏦',
          title: 'How the fake check works',
          body: "Jasmine accepts. A check for $1,950 arrives. Her \"manager\" says $250 is her first week's pay and asks her to send the other $1,700 to a supply vendor through a payment app.\n\nBanks must make deposited money available quickly, often within a couple of days. Finding out a check is fake can take weeks. Here is her statement.",
          doc: jasmineStatement,
        },
        {
          type: 'number',
          id: 't2-u7-l3-e6',
          prompt: 'Jasmine started with $320 of her own money. Counting the fee, how much of her own money did she lose?',
          answer: 1715,
          prefix: '$',
          explain: "The $1,950 was never real, so the bank took it back. She lost the $1,700 she sent plus the $15 fee, $1,715 in all. That's why her balance went from $320 to negative $1,395, which she now owes the bank.",
          doc: jasmineStatement,
        },
        {
          type: 'tf',
          id: 't2-u7-l3-e7',
          statement: 'If the money from a deposited check is available to spend, the bank has confirmed the check is real.',
          answer: false,
          explain: "Money can be available within days, while a fake check can take weeks to discover. Jasmine's check was deposited March 3 and returned March 16. If a check bounces, you owe the bank.",
          doc: jasmineStatement,
        },
        {
          type: 'teach',
          id: 't2-u7-l3-e8',
          emoji: '⚠️',
          title: 'The money mule request',
          body: "A week later, the same \"manager\" offers Jasmine a new task: receive payments into her bank account, keep 10%, and send the rest on.\n\nThis is a **money mule** request. The money is usually stolen. People who move it can have their bank accounts closed and can face legal trouble, even if they didn't know where the money came from. A real job never needs your account to move its money.",
        },
        {
          type: 'scenario',
          id: 't2-u7-l3-e9',
          emoji: '📱',
          setup: 'Jasmine\'s account is still $1,395 negative. The "manager" says forwarding payments will earn her about $300 a week, enough to clear the balance in five weeks.',
          question: 'What should Jasmine do?',
          choices: [
            {
              text: 'Stop replying, tell a parent, and report it at ReportFraud.ftc.gov',
              best: true,
              outcome: 'The scam stops here. She and a parent can talk with the bank about paying off the negative balance, and her report helps the FTC track the scheme.',
            },
            {
              text: 'Forward payments only until the $1,395 is covered',
              outcome: 'She ends up moving stolen money. Her bank can close her account, and she could face legal trouble on top of the debt she already has.',
            },
            {
              text: 'Agree, but only if they prove the money is legal',
              outcome: 'They send an official-looking document. People who faked a check can fake proof just as easily.',
            },
          ],
        },
        {
          type: 'teach',
          id: 't2-u7-l3-e10',
          emoji: '🎁',
          title: 'Giveaways and doubling offers',
          body: "Some scams promise to multiply your money. An account using a famous creator's name and photo posts that if you send crypto, you'll get double back. Others offer free game currency or a prize, but only after you log in on their site or pay a fee.\n\nReal giveaways never ask you to pay or to hand over a login. Crypto sent to a scammer is very hard to get back.",
        },
        {
          type: 'sort',
          id: 't2-u7-l3-e11',
          prompt: 'Scam or legitimate?',
          buckets: ['Scam', 'Legit'],
          items: [
            { text: 'Send crypto, get double back', bucket: 0 },
            { text: 'Prize that requires a fee', bucket: 0 },
            { text: 'Free coins for your login', bucket: 0 },
            { text: 'Forward payments, keep 10%', bucket: 0 },
            { text: 'Interview before a job offer', bucket: 1 },
            { text: 'Paycheck by direct deposit', bucket: 1 },
            { text: "W-4 form after you're hired", bucket: 1 },
          ],
          explain: 'Doubling money, paying to claim a prize, handing over a login, and forwarding payments are all scam patterns. Real employers interview you, then pay you through payroll.',
        },
        {
          type: 'teach',
          id: 't2-u7-l3-e12',
          emoji: '🐟',
          funFact: true,
          title: 'Where the word phishing comes from',
          body: 'Messages that try to trick you into sharing a login or personal information are called **phishing**. The "ph" spelling is usually traced to "phone phreaks," early hackers who experimented with telephone systems.',
        },
        {
          type: 'fill',
          id: 't2-u7-l3-e13',
          sentence: 'Report a scam at ___. If someone has used your personal information, go to ___.',
          answers: ['ReportFraud.ftc.gov', 'IdentityTheft.gov'],
          bank: ['ReportFraud.ftc.gov', 'IdentityTheft.gov', 'AnnualCreditReport.com', 'studentaid.gov'],
          explain: 'ReportFraud.ftc.gov is for reporting scams and fraud. IdentityTheft.gov, also run by the FTC, builds a recovery plan when your identity has been used. AnnualCreditReport.com is where you check your credit reports.',
        },
      ],
    },

    /* ---------------- Lesson 4: Net worth, giving back & your money plan ---------------- */
    {
      id: 't2-u7-l4',
      title: 'Net Worth and Your Money Plan',
      description: 'Measure what you own and owe, give carefully, and pull your whole plan together.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u7-l4-e1',
          emoji: '📊',
          title: 'Net worth: own minus owe',
          body: 'Your **net worth** is what you own (**assets**) minus what you owe (**liabilities**).\n\n- Assets: cash, savings, investments, a car you could sell\n- Liabilities: loans, credit card balances, money you owe a person\n\nIt is a snapshot of one day, not a grade. What matters most is whether it grows over time.',
        },
        {
          type: 'sort',
          id: 't2-u7-l4-e2',
          prompt: 'Asset or liability?',
          buckets: ['Asset', 'Liability'],
          items: [
            { text: 'Savings account balance', bucket: 0 },
            { text: 'Roth IRA balance', bucket: 0 },
            { text: 'A used car you own', bucket: 0 },
            { text: 'Student loan balance', bucket: 1 },
            { text: 'Credit card balance', bucket: 1 },
            { text: 'Car loan balance', bucket: 1 },
            { text: '$40 you owe a friend', bucket: 1 },
          ],
          explain: 'Assets have value and belong to you. Liabilities are debts. A car is an asset, and the loan on it is a separate liability.',
        },
        {
          type: 'number',
          id: 't2-u7-l4-e3',
          prompt: "Using Grace's snapshot, what is her net worth?",
          answer: 3480,
          prefix: '$',
          explain: '$6,990 in assets minus $3,510 in liabilities is $3,480.',
          doc: graceSnapshot,
        },
        {
          type: 'mc',
          id: 't2-u7-l4-e4',
          prompt: 'Grace uses $300 from checking to pay down her credit card. What happens to her net worth?',
          choices: [
            { text: 'It stays at $3,480', correct: true },
            {
              text: 'It rises to $3,780, because she owes less',
              why: 'She does owe $300 less, but she also has $300 less in checking. Both sides drop by the same amount.',
            },
            {
              text: 'It falls to $3,180, because her checking dropped',
              why: 'Her checking did drop, but her card balance fell by the same $300, so the two changes cancel out.',
            },
          ],
          explain: 'Paying a debt with cash lowers both sides by the same amount, so net worth stays the same. It still helps by shrinking the balance that could be charged interest.',
          doc: graceSnapshot,
        },
        {
          type: 'tf',
          id: 't2-u7-l4-e5',
          statement: 'A negative net worth means a person has made poor money choices.',
          answer: false,
          explain: 'Many people start adult life with a negative net worth because of student or car loans. Net worth is a snapshot. The direction it moves over time matters more.',
        },
        {
          type: 'teach',
          id: 't2-u7-l4-e6',
          emoji: '🤝',
          title: 'Giving back',
          body: 'A money plan can include **giving**: money, time (volunteering), or skills, like tutoring.\n\nBefore donating money, make sure the charity is real. Look it up yourself and give through its official website. Fake charities often appear right after disasters, sometimes with names that sound like well-known ones.',
        },
        {
          type: 'scenario',
          id: 't2-u7-l4-e7',
          emoji: '📩',
          setup: 'After a hurricane, you get a text: "Help families today. Donate $25 by gift card at this link." You want to help.',
          question: "What's the best way to give?",
          choices: [
            {
              text: 'Look up a charity you know and donate on its official site',
              best: true,
              outcome: "Your $25 reaches a real organization, and you didn't share any payment details with a stranger.",
            },
            {
              text: 'Use the link, but pay by credit card instead',
              outcome: 'A card is safer than a gift card, but the link could still be a fake charity collecting your card number.',
            },
            {
              text: 'Reply and ask whether the charity is real',
              outcome: 'A scammer will say yes. Checking the charity yourself is the reliable way to know.',
            },
          ],
        },
        {
          type: 'teach',
          id: 't2-u7-l4-e8',
          emoji: '🧭',
          title: 'Putting your plan together',
          body: 'A complete money plan has five parts:\n\n- **Earn**: a job, gig, or skill\n- **Budget**: decide where your money goes before you spend it\n- **Save**: start with an emergency fund\n- **Invest**: put long-term money in diversified funds\n- **Protect**: insurance, a credit freeze, and knowing the warning signs of scams\n\nRevisit your plan whenever your income or goals change.',
        },
        {
          type: 'match',
          id: 't2-u7-l4-e9',
          prompt: 'Match each tool to its job.',
          pairs: [
            { left: 'Budget', right: 'A plan for spending and saving' },
            { left: 'Emergency fund', right: 'Cash set aside for surprises' },
            { left: 'Insurance', right: 'Covers losses too big to pay alone' },
            { left: 'Credit freeze', right: 'Blocks new accounts in your name' },
            { left: 'Index fund', right: 'Long-term investing in many companies' },
          ],
          explain: 'Each tool handles a different part of your plan. Most people build them one at a time, starting with a budget and a small emergency fund.',
        },
      ],
    },
  ],

  quiz: {
    passPercent: 70,
    exercises: [
      {
        type: 'mc',
        id: 't2-u7-q-e1',
        prompt: 'What is a deductible?',
        choices: [
          { text: 'The amount you pay on a claim before insurance pays', correct: true },
          {
            text: 'Your monthly payment to keep coverage',
            why: "That's the premium. The deductible only comes up when you file a claim.",
          },
          {
            text: 'The most your insurer will pay for a claim',
            why: "That's the policy limit. The deductible is your share at the start of a claim.",
          },
          {
            text: 'Money returned to you after a year with no claims',
            why: "Premiums aren't refunded in a year without claims. The deductible is what you pay toward a claim.",
          },
        ],
        explain: 'You pay the deductible first, and insurance covers the rest of the covered cost. A higher deductible usually means a lower premium.',
      },
      {
        type: 'tf',
        id: 't2-u7-q-e2',
        statement: 'Liability car insurance pays for damage and injuries you cause to other people.',
        answer: true,
        explain: 'Liability covers harm you cause to others, up to your policy limits. Nearly every state requires drivers to carry it.',
      },
      {
        type: 'number',
        id: 't2-u7-q-e3',
        prompt: 'Someone breaks into your apartment and steals $1,200 of your belongings. Your renters insurance deductible is $250. How much will insurance pay?',
        answer: 950,
        prefix: '$',
        explain: "$1,200 minus the $250 deductible is $950. Your landlord's insurance covers the building, not your belongings.",
      },
      {
        type: 'mc',
        id: 't2-u7-q-e4',
        prompt: 'A company that has your information had a data breach that exposed your SSN. Which step blocks thieves from opening new credit in your name?',
        choices: [
          { text: 'Freeze your credit at all three bureaus', correct: true },
          {
            text: "Change your password for that company's site",
            why: 'A good idea, but someone with your SSN can still apply for credit elsewhere. A freeze blocks that.',
          },
          {
            text: 'Freeze your credit at one bureau',
            why: "Each bureau has its own report, and a lender could check one you didn't freeze. You need all three.",
          },
          {
            text: 'Close your checking account',
            why: "Your checking account isn't what's at risk here. New accounts in your name are, and a freeze blocks those.",
          },
        ],
        explain: "A freeze at Equifax, Experian, and TransUnion is free, doesn't affect your score, and stops lenders from viewing your report.",
      },
      {
        type: 'fill',
        id: 't2-u7-q-e5',
        sentence: 'A credit freeze costs ___, and you should place one at ___ bureaus.',
        answers: ['nothing', 'all three'],
        bank: ['nothing', 'all three', '$10 a year', 'one of the', 'two'],
        explain: 'Freezes are free at Equifax, Experian, and TransUnion. Each bureau keeps its own report, so you need a freeze at each one.',
      },
      {
        type: 'sort',
        id: 't2-u7-q-e6',
        prompt: 'Possible identity theft, or normal?',
        buckets: ['Warning sign', 'Normal'],
        items: [
          { text: 'Bill for an unknown card', bucket: 0 },
          { text: 'Collection call for unknown debt', bucket: 0 },
          { text: 'IRS says you already filed', bucket: 0 },
          { text: 'W-2 arrives from your job', bucket: 1 },
          { text: 'Alert for your own purchase', bucket: 1 },
          { text: 'Report lists your own card', bucket: 1 },
        ],
        explain: "Accounts, debts, or tax filings you don't recognize suggest someone is using your information. Records of things you actually did are normal.",
      },
      {
        type: 'scenario',
        id: 't2-u7-q-e7',
        emoji: '🎮',
        setup: "You're selling your old game console online for $150. The buyer mails you a check for $450 and asks you to send the extra $300 back through a payment app.",
        question: 'What should you do?',
        choices: [
          {
            text: 'Deposit it and send back the $300',
            outcome: 'The check is fake. The bank takes back the $450, and the $300 you sent is gone.',
          },
          {
            text: 'Wait until the money is available, then send $300',
            outcome: "The money shows up in a couple of days, so you send it. Weeks later the check is returned as fake, and you're out $300.",
          },
          {
            text: 'Decline the check and cancel the sale',
            best: true,
            outcome: 'The buyer disappears, since they never wanted the console. You keep the console and your money.',
          },
        ],
      },
      {
        type: 'mc',
        id: 't2-u7-q-e8',
        prompt: 'An online contact offers to pay you 10% for receiving money in your bank account and sending the rest to them. What is this?',
        choices: [
          { text: 'A money mule scheme', correct: true },
          {
            text: 'A payment-processing side job',
            why: "Real payment companies don't route money through a stranger's personal account. This is how criminals move stolen money.",
          },
          {
            text: 'Safe, as long as you never share your password',
            why: 'Moving the money is the problem, even if you never share a login. Your account is being used to move stolen funds.',
          },
        ],
        explain: 'Money mules move stolen money for criminals. It can get your bank account closed and lead to legal trouble.',
      },
      {
        type: 'number',
        id: 't2-u7-q-e9',
        prompt: 'You have $850 in savings and a laptop worth $400. You owe $375 on a phone payment plan. What is your net worth?',
        answer: 875,
        prefix: '$',
        explain: '$850 + $400 = $1,250 in assets. Minus the $375 you owe, your net worth is $875.',
      },
      {
        type: 'tf',
        id: 't2-u7-q-e10',
        statement: 'Using $200 from savings to pay down a credit card leaves your net worth unchanged.',
        answer: true,
        explain: 'Your savings drop by $200 and your debt drops by $200, so the difference between them stays the same. You also stop paying interest on that $200.',
      },
    ],
  },
}

export default unit
