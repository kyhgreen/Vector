import type { Doc, Unit } from '../types'

/* ---------- Documents shared across exercises ---------- */

const lakeshoreFees: Doc = {
  kind: 'table',
  title: 'Lakeshore Bank: Everyday Checking fees',
  rows: [
    { label: 'Monthly maintenance fee', value: '$12.00' },
    { label: 'Waived with direct deposits of', value: '$500+ a month', indent: true },
    { label: 'Or a minimum daily balance of', value: '$1,500', indent: true },
    { label: 'Out-of-network ATM fee', value: '$3.00 each' },
    { label: 'Overdraft fee', value: '$34.00 per item' },
    { label: 'Debit card overdraft coverage', value: 'Only if you opt in' },
    { label: 'Paper statements', value: '$2.00 a month' },
  ],
  note: 'Account owners under 18 need an adult co-owner.',
}

const cedarValleyTeen: Doc = {
  kind: 'table',
  title: 'Cedar Valley Credit Union: Teen Checking',
  rows: [
    { label: 'Monthly maintenance fee', value: '$0' },
    { label: 'Credit union ATMs', value: 'Free' },
    { label: 'Other ATMs', value: '$1.50 each' },
    { label: 'Debit purchase over your balance', value: 'Declined, no fee' },
    { label: 'Ages', value: '13 to 17, with an adult co-owner' },
    { label: 'Who can join', value: 'Live, work, or attend school in Cedar Valley County' },
  ],
  note: 'Deposits insured by the NCUA up to $250,000 per depositor, per institution, per ownership category.',
}

const ficoWeights: Doc = {
  kind: 'table',
  title: 'What goes into a FICO score',
  rows: [
    { label: 'Payment history', value: '35%' },
    { label: 'Amounts owed (utilization)', value: '30%' },
    { label: 'Length of credit history', value: '15%' },
    { label: 'New credit', value: '10%' },
    { label: 'Credit mix', value: '10%' },
    { label: 'Total', value: '100%', strong: true },
  ],
  note: 'FICO scores range from 300 to 850. Higher is better.',
}

const reportDetail: Doc = {
  kind: 'table',
  title: 'Your credit report: account detail',
  subtitle: 'Ridgeway Bank credit card · Opened Jan 2026',
  rows: [
    { label: 'Account status', value: 'Open' },
    { label: 'Credit limit', value: '$600' },
    { label: 'Balance', value: '$85' },
    { label: 'May 2026 payment', value: 'On time' },
    { label: 'Jun 2026 payment', value: '30 days late', strong: true },
    { label: 'Jul 2026 payment', value: 'On time' },
    { label: 'Aug 2026 payment', value: 'On time' },
  ],
  note: 'Free report from AnnualCreditReport.com.',
}

const danielaOffer: Doc = {
  kind: 'offer',
  title: 'Northfield Bank Starter Card: your terms',
  subtitle: 'Cardholder: Daniela Ortiz, age 19 · Income: $1,150 a month (part-time)',
  rows: [
    { label: 'Credit limit', value: '$800' },
    { label: 'Annual fee', value: '$0' },
    { label: 'Purchase APR', value: '23.99%' },
    { label: 'Grace period on purchases', value: '25 days' },
    { label: 'Cash advance APR', value: '28.99%' },
    { label: 'Cash advance fee', value: '$10 or 5%, whichever is more' },
    { label: 'Grace period on cash advances', value: 'None' },
    { label: 'Late payment fee', value: 'Up to $30' },
  ],
  note: 'Applicants under 21 must show their own income.',
}

const danielaOctober: Doc = {
  kind: 'statement',
  title: 'Northfield Starter Card: October statement',
  subtitle: 'Daniela Ortiz · Payment due Nov 22',
  rows: [
    { label: 'Previous balance', value: '$0.00' },
    { label: 'Purchases', value: '$312.40' },
    { label: 'Gas, Coastline Fuel', value: '$41.25', indent: true },
    { label: 'Used textbook', value: '$118.50', indent: true },
    { label: 'Groceries', value: '$86.15', indent: true },
    { label: 'Work shoes', value: '$66.50', indent: true },
    { label: 'Interest charged', value: '$0.00' },
    { label: 'New balance', value: '$312.40', strong: true },
    { label: 'Minimum payment due', value: '$25.00', strong: true },
    { label: 'Credit limit', value: '$800.00' },
    { label: 'Available credit', value: '$487.60' },
  ],
  note: 'Purchase APR: 23.99%. Late payment fee: up to $30.',
}

const danielaNovember: Doc = {
  kind: 'statement',
  title: 'Northfield Starter Card: November statement',
  subtitle: 'Daniela Ortiz · Payment due Dec 22',
  rows: [
    { label: 'Previous balance', value: '$312.40' },
    { label: 'Payment received', value: '-$25.00' },
    { label: 'Purchases', value: '$0.00' },
    { label: 'Interest charged', value: '$5.75' },
    { label: 'New balance', value: '$293.15', strong: true },
    { label: 'Minimum payment due', value: '$25.00', strong: true },
    { label: 'Credit limit', value: '$800.00' },
    { label: 'Available credit', value: '$506.85' },
  ],
  note: "Interest was charged because October's balance was not paid in full.",
}

const securedOffer: Doc = {
  kind: 'offer',
  title: 'Cedar Valley Credit Union: Secured card',
  subtitle: 'For members 18 and older',
  rows: [
    { label: 'Security deposit', value: '$300' },
    { label: 'Credit limit', value: '$300' },
    { label: 'Annual fee', value: '$0' },
    { label: 'Purchase APR', value: '25.49%' },
    { label: 'Payments reported to', value: 'All three credit bureaus' },
    { label: 'Applicants under 21', value: 'Must show own income' },
  ],
  note: 'Your deposit is returned when you close the card with a $0 balance.',
}

const ridgewaySeptember: Doc = {
  kind: 'statement',
  title: 'Ridgeway Bank card: September statement',
  rows: [
    { label: 'Previous balance', value: '$0.00' },
    { label: 'Purchases', value: '$186.20' },
    { label: 'Interest charged', value: '$0.00' },
    { label: 'New balance', value: '$186.20', strong: true },
    { label: 'Minimum payment due', value: '$25.00' },
    { label: 'Payment due date', value: 'Oct 18' },
  ],
}

const unit: Unit = {
  id: 't2-u3',
  tier: 2,
  order: 3,
  title: 'Banking & Credit',
  tagline: 'Choose a bank account, read a card statement, and start building credit.',
  color: 'purple',
  emoji: '💳',

  guidebook: {
    intro:
      "This unit covers where to keep your money and how borrowing works. You'll compare bank and credit union accounts, read a credit report and a credit card statement, and learn the steps teens can take to start building credit.",
    keyIdeas: [
      {
        title: 'Banks and credit unions both work',
        body: 'Most banks are for-profit businesses owned by shareholders. Credit unions are nonprofits owned by their members, and they often charge lower fees. Look for FDIC (banks) or NCUA (credit unions) insurance, which covers up to $250,000 per depositor, per institution, per ownership category.',
      },
      {
        title: 'Read the fee list first',
        body: 'Monthly maintenance fees, out-of-network ATM fees, and overdraft fees add up over a year. Many can be avoided by picking an account that fits how you use money. Banks need you to opt in before charging overdraft fees on ATM withdrawals and one-time debit purchases.',
      },
      {
        title: 'Your credit report is your borrowing record',
        body: 'Equifax, Experian, and TransUnion each keep a report listing your loans, cards, balances, and payment history. You can see all three free every week at AnnualCreditReport.com, and checking your own report never lowers your score.',
      },
      {
        title: 'What moves a FICO score',
        body: 'Scores run from 300 to 850. Payment history is 35% and amounts owed is 30%, so paying on time and keeping utilization under 30% (lower is better) matter most.',
      },
      {
        title: 'Pay the full statement balance',
        body: 'Paying the full statement balance by the due date means no interest on purchases. Paying only the minimum avoids a late fee, but the rest collects interest at an APR that is often above 20%.',
      },
      {
        title: 'Starting credit as a teen',
        body: "Before 18, a parent can add you as an authorized user on their card. At 18, a secured card is a common first card. Under 21, you need your own income (or a cosigner, which most card companies don't allow) to get a card in your name.",
      },
    ],
    funFacts: [
      'Credit union members are part-owners, and members generally get one vote each, no matter how much they have deposited.',
      "Equifax, Experian, and TransUnion each keep their own report on you, and the three reports don't always match.",
      "Your credit report doesn't show your bank balance or your grades. It tracks borrowing.",
      'Most late payments can stay on a credit report for up to seven years.',
      'An authorized user gets a card with their own name on it, but the main cardholder is the one who owes the bill.',
    ],
    words: [
      { term: 'Credit union', meaning: 'A nonprofit, member-owned place to bank' },
      { term: 'Overdraft', meaning: 'Spending more than your account balance, often for a fee' },
      { term: 'Credit report', meaning: 'Your record of loans, cards, balances, and payments' },
      { term: 'Credit bureau', meaning: 'A company that keeps credit reports (Equifax, Experian, TransUnion)' },
      { term: 'Credit score', meaning: 'A number that sums up your report (FICO: 300 to 850)' },
      { term: 'Credit utilization', meaning: 'The share of your credit limit you are using' },
      { term: 'APR', meaning: 'The yearly interest rate on money you borrow' },
      { term: 'Grace period', meaning: 'Time to pay the full balance with no interest on purchases' },
      { term: 'Authorized user', meaning: "Someone allowed to use another person's credit card" },
      { term: 'Secured card', meaning: 'A credit card backed by your own cash deposit' },
    ],
  },

  lessons: [
    /* ---------------- Lesson 1: Choosing a bank or credit union (12) ---------------- */
    {
      id: 't2-u3-l1',
      title: 'Choosing Where to Bank',
      description: 'Compare banks and credit unions, read a fee schedule, and avoid overdraft fees.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u3-l1-e1',
          emoji: '🏦',
          title: 'Banks and credit unions',
          body: "Banks and credit unions both offer checking accounts, savings accounts, and debit cards.\n\n- **Banks** are mostly for-profit businesses owned by shareholders.\n- **Credit unions** are nonprofits owned by their members, the people who bank there.\n\nCredit unions often charge lower fees. To join one, you have to qualify, usually based on where you live, work, or go to school.",
          example: 'Cedar Valley Credit Union accepts anyone who lives, works, or attends school in Cedar Valley County. A student in the next county over would need to look for a different one.',
        },
        {
          type: 'mc',
          id: 't2-u3-l1-e2',
          prompt: 'Who owns a credit union?',
          choices: [
            { text: 'Its members, the people who have accounts there', correct: true },
            { text: 'The NCUA, the federal agency that insures it', why: "The NCUA insures deposits at most credit unions, but it doesn't own them. Members do." },
            { text: 'Shareholders who buy its stock', why: 'That describes most banks. A credit union has no outside shareholders.' },
            { text: 'Its largest depositors', why: 'Members generally get one vote each, whether they have $5 or $50,000 deposited.' },
          ],
          explain: 'Credit unions are member-owned nonprofits. Because they are not earning profits for shareholders, they often pass savings back to members as lower fees or better rates.',
        },
        {
          type: 'tf',
          id: 't2-u3-l1-e3',
          statement: "Money in a credit union usually isn't insured, because a credit union isn't a bank.",
          answer: false,
          explain: 'False. Banks are insured by the FDIC and most credit unions by the NCUA. Both cover up to $250,000 per depositor, per institution, per ownership category.',
        },
        {
          type: 'teach',
          id: 't2-u3-l1-e4',
          emoji: '📄',
          title: 'Read the fee schedule',
          body: "Every account has a fee schedule. The fees that matter most:\n\n- **Monthly maintenance fee**: charged just for having the account. Many banks waive it if you meet a condition, like direct deposit or a minimum balance.\n- **Out-of-network ATM fee**: your bank may charge one, and the ATM's owner may charge another.\n\nIf you're under 18, most banks require a parent or guardian as a co-owner.",
          example: 'Teen and student accounts often have no monthly fee. Ask for them by name when you compare.',
          doc: lakeshoreFees,
        },
        {
          type: 'number',
          id: 't2-u3-l1-e5',
          prompt: 'Your part-time job will direct deposit about $320 a month, and you usually keep around $400 in checking. What would this account cost you in maintenance fees over a year?',
          answer: 144,
          prefix: '$',
          explain: "$320 is below the $500 direct deposit requirement, and $400 is below the $1,500 balance requirement, so the fee isn't waived. $12 × 12 months = $144 a year.",
          doc: lakeshoreFees,
        },
        {
          type: 'mc',
          id: 't2-u3-l1-e6',
          prompt: "You use an out-of-network ATM twice a month. Lakeshore charges its fee, and the ATM's owner charges $2.50 each time. What do these withdrawals cost you per month?",
          choices: [
            { text: '$11.00', correct: true },
            { text: '$6.00', why: "That counts only Lakeshore's $3.00 fee twice. The ATM owner's $2.50 is charged on top of it each time." },
            { text: '$5.50', why: "That's the cost of one withdrawal. You made two." },
            { text: '$5.00', why: "That counts only the ATM owner's fee. Lakeshore's $3.00 applies to each withdrawal too." },
          ],
          explain: 'Each withdrawal costs $3.00 + $2.50 = $5.50, and two of them cost $11.00 a month. Over a year, that is $132.',
          doc: lakeshoreFees,
        },
        {
          type: 'tf',
          id: 't2-u3-l1-e7',
          statement: 'At 16, you can usually open a checking account by yourself, without an adult on the account.',
          answer: false,
          explain: "False. Most banks and credit unions require a parent or guardian as a co-owner until you're 18. Teen accounts are set up for exactly that.",
        },
        {
          type: 'teach',
          id: 't2-u3-l1-e8',
          emoji: '⚠️',
          title: 'How overdrafts work',
          body: "An **overdraft** happens when you spend more than your account balance. The bank may cover the payment and then charge a fee. Some banks charge $30 or more each time, and some charge nothing.\n\nFor ATM withdrawals and one-time debit card purchases, a bank needs you to **opt in** before it can charge an overdraft fee. If you don't opt in, a purchase that's too big usually just gets declined.",
          example: 'You have $8 and buy a $10 burrito. If the bank covers it and charges a $35 fee, that burrito cost you $45.',
        },
        {
          type: 'mc',
          id: 't2-u3-l1-e9',
          prompt: 'You have $20 in checking and swipe your debit card for $26. You never opted in to overdraft coverage. What most likely happens?',
          choices: [
            { text: 'The purchase is declined', correct: true },
            { text: 'It goes through, and the bank charges a $34 fee', why: "That can happen only if you opted in. Without your OK, the bank can't charge an overdraft fee on a one-time debit purchase." },
            { text: 'The cashier runs it as a credit card purchase instead', why: "Even when a debit card is run as 'credit' at the register, the money still comes from your checking account." },
          ],
          explain: 'Without an opt-in, a one-time debit purchase that would overdraw your account usually gets declined. You can pay another way, and you avoid the fee.',
        },
        {
          type: 'number',
          id: 't2-u3-l1-e10',
          prompt: 'Now suppose you had opted in at Lakeshore. The $26 purchase goes through, and the overdraft fee is charged. What did that purchase cost you in total?',
          answer: 60,
          prefix: '$',
          explain: '$26 for the purchase + $34 for the overdraft fee = $60. Opting out, or keeping a small cushion in checking, would have avoided the fee.',
          doc: lakeshoreFees,
        },
        {
          type: 'fill',
          id: 't2-u3-l1-e11',
          sentence: 'An overdraft happens when you spend more than your account ___. For one-time debit purchases, the bank needs you to ___ before it can charge an overdraft fee.',
          answers: ['balance', 'opt in'],
          bank: ['balance', 'opt in', 'credit limit', 'opt out', 'routing number'],
          explain: 'An overdraft means spending past your balance. For ATM withdrawals and one-time debit purchases, no opt-in means no overdraft fee.',
        },
        {
          type: 'scenario',
          id: 't2-u3-l1-e12',
          emoji: '🥐',
          setup: "You're 16, live in Cedar Valley County, and just started at Fern Street Bakery, which pays about $320 a month by direct deposit. You're choosing between Lakeshore Everyday Checking ($12 a month unless waived) and this account.",
          question: 'Which account makes the most sense?',
          choices: [
            {
              text: 'Cedar Valley Teen Checking, with a parent as co-owner',
              best: true,
              outcome: 'No monthly fee, free credit union ATMs, and insured deposits. A purchase that would overdraw the account is declined instead of costing you a fee.',
            },
            {
              text: 'Lakeshore, since direct deposit will waive the fee',
              outcome: "Your $320 a month is below Lakeshore's $500 requirement, so you'd pay $12 a month, or $144 a year.",
            },
            {
              text: 'No account for now; keep your pay as cash at home',
              outcome: "The bakery pays by direct deposit, so you'd still need an account. Cash at home also isn't insured if it's lost or stolen.",
            },
          ],
          doc: cedarValleyTeen,
        },
      ],
    },

    /* ---------------- Lesson 2: Credit reports & scores (10) ---------------- */
    {
      id: 't2-u3-l2',
      title: 'Credit Reports and Scores',
      description: "What's on your credit report and what affects your score.",
      exercises: [
        {
          type: 'teach',
          id: 't2-u3-l2-e1',
          emoji: '📋',
          title: 'What a credit report shows',
          body: "**Credit** means borrowing money now and paying it back later.\n\nYour **credit report** is the record of how you've handled that: your loans and cards, how much you owe, and whether you've paid on time. Three credit bureaus, Equifax, Experian, and TransUnion, each keep a report on you.\n\nLenders and landlords read it to decide whether to lend or rent to you.",
          example: 'Two people apply for the same apartment. One has two years of on-time payments. The other has several late payments. The landlord will likely see the first applicant as less risky.',
        },
        {
          type: 'sort',
          id: 't2-u3-l2-e2',
          prompt: 'Does it appear on your credit report?',
          buckets: ['On it', 'Not on it'],
          items: [
            { text: 'Credit card balances', bucket: 0 },
            { text: 'A late loan payment', bucket: 0 },
            { text: 'Your car loan', bucket: 0 },
            { text: 'Your checking balance', bucket: 1 },
            { text: 'Your savings balance', bucket: 1 },
            { text: 'Your school grades', bucket: 1 },
          ],
          explain: "A credit report tracks borrowing: loans, cards, balances, and payment history. Money in checking or savings is your own, not borrowed, so it isn't on the report.",
        },
        {
          type: 'tf',
          id: 't2-u3-l2-e3',
          statement: 'You have exactly one credit report, and the federal government keeps it.',
          answer: false,
          explain: "False. Three private companies, Equifax, Experian, and TransUnion, each keep their own report on you, and the three don't always match.",
        },
        {
          type: 'teach',
          id: 't2-u3-l2-e4',
          emoji: '🎯',
          title: 'How a score is figured',
          body: 'A **credit score** sums up your report in one number. The common FICO score runs from **300 to 850**, and higher is better.\n\nThe table shows how much each part of your report counts. Paying on time and keeping balances low together make up almost two-thirds of the score.',
          doc: ficoWeights,
        },
        {
          type: 'mc',
          id: 't2-u3-l2-e5',
          prompt: 'Which factor carries the most weight in a FICO score?',
          choices: [
            { text: 'Payment history', correct: true },
            { text: 'Amounts owed', why: 'Close. Amounts owed is 30%, second to payment history at 35%.' },
            { text: 'Length of credit history', why: "That counts for 15%. It matters, but it isn't the biggest factor." },
            { text: 'Your income', why: "Income isn't part of a FICO score. Someone with a high income who pays late can score lower than a teen who always pays on time." },
          ],
          explain: 'Payment history is 35% of a FICO score. Every on-time payment adds to it, and a missed one can hurt for years.',
        },
        {
          type: 'teach',
          id: 't2-u3-l2-e6',
          emoji: '📊',
          title: 'Credit utilization',
          body: "**Credit utilization** is the share of your credit limit you're using. If you owe $300 on a card with a $1,000 limit, your utilization is 30%.\n\nA common guideline is to keep it **under 30%**, and lower is better. Utilization is a big part of the amounts owed factor, which is 30% of your score.",
          example: 'With more than one card, add up all your balances and divide by all your limits. $200 owed across $2,000 in total limits is 10%.',
        },
        {
          type: 'number',
          id: 't2-u3-l2-e7',
          prompt: "You have two cards. Card A: $300 balance, $1,500 limit. Card B: $200 balance, $500 limit. What's your overall utilization? (Whole number.)",
          answer: 25,
          suffix: '%',
          explain: '$500 in total balances ÷ $2,000 in total limits = 0.25, or 25%. That is under 30% overall, even though Card B on its own is at 40%.',
        },
        {
          type: 'teach',
          id: 't2-u3-l2-e8',
          emoji: '🔍',
          funFact: true,
          title: 'Checking your credit is free',
          body: 'You can get your reports from all three bureaus for free, every week, at **AnnualCreditReport.com**.\n\nLooking at your own report or score is a **soft inquiry**, and it never lowers your score. A **hard inquiry** happens when you apply for a loan or a credit card, and it can lower your score a little for a while.',
        },
        {
          type: 'mc',
          id: 't2-u3-l2-e9',
          prompt: 'Which of these is a hard inquiry that can lower your score a little?',
          choices: [
            { text: 'Applying for a new credit card', correct: true },
            { text: "Checking your score in your bank's app", why: "Looking at your own score is a soft inquiry. It doesn't affect your score." },
            { text: 'Downloading your report from AnnualCreditReport.com', why: 'Pulling your own report is a soft inquiry, no matter how often you do it.' },
          ],
          explain: 'Hard inquiries come from applying for credit. Checking your own credit is always a soft inquiry, so you can check as often as you like.',
        },
        {
          type: 'scenario',
          id: 't2-u3-l2-e10',
          emoji: '📬',
          setup: 'You pull your free credit report and see your June card payment marked 30 days late. You paid it on June 10, before the due date, and you still have the confirmation email.',
          question: 'What should you do?',
          choices: [
            {
              text: 'Dispute it with the credit bureau and include your confirmation',
              best: true,
              outcome: 'The bureau has to investigate. If the late mark is wrong, it must be corrected or removed.',
            },
            {
              text: 'Close the card so the late payment comes off',
              outcome: "Closing the account doesn't erase its history. The late mark stays, and you lose that card's available credit.",
            },
            {
              text: "Leave it, since one late payment won't matter much",
              outcome: 'Payment history is the biggest part of your score, and a late mark can stay on your report for up to seven years.',
            },
          ],
          doc: reportDetail,
        },
      ],
    },

    /* ---------------- Lesson 3: Credit cards, as a connected story (14) ---------------- */
    {
      id: 't2-u3-l3',
      title: "Daniela's First Credit Card",
      description: 'Follow one cardholder through her terms, two statements, and a car repair.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u3-l3-e1',
          emoji: '💳',
          title: 'Credit card vs. debit card',
          body: "Daniela is 19 and works part-time at Westgate Pharmacy. She just got her first credit card.\n\n- A **debit card** spends money already in your checking account.\n- A **credit card** borrows the card company's money, which you pay back later.\n\nThe **credit limit** is the most you can owe on the card at once. Because Daniela is under 21, she had to show her own income to qualify.",
          doc: danielaOffer,
        },
        {
          type: 'mc',
          id: 't2-u3-l3-e2',
          prompt: "Daniela's card has a 23.99% purchase APR. What does that number tell her?",
          choices: [
            { text: "The yearly interest rate on balances she doesn't pay off", correct: true },
            { text: 'The share of her $800 limit she can spend', why: 'That sounds like utilization, which is a different idea. APR is an interest rate.' },
            { text: 'A charge added to every purchase she makes', why: "APR isn't charged on each purchase. It applies to balances she doesn't pay in full by the due date." },
            { text: 'The interest the bank pays her for using the card', why: "That's closer to APY on a savings account. With a credit card, Daniela is the one who pays interest." },
          ],
          explain: 'APR is the yearly cost of borrowing. If Daniela pays her full statement balance by the due date each month, she pays no purchase interest at all.',
          doc: danielaOffer,
        },
        {
          type: 'tf',
          id: 't2-u3-l3-e3',
          statement: "Because Daniela's card has a $0 annual fee, she can't be charged anything for using it.",
          answer: false,
          explain: 'False. The annual fee is only one cost. Her terms also list interest on unpaid balances, a late fee of up to $30, and a cash advance fee. Paying in full and on time avoids most of them.',
          doc: danielaOffer,
        },
        {
          type: 'teach',
          id: 't2-u3-l3-e4',
          emoji: '🗓️',
          title: 'Reading the statement',
          body: "Each month the card company sends a **statement**. It lists what you bought, your new balance, a minimum payment, and a due date.\n\nIf you pay the full statement balance by the due date, you pay no interest on those purchases. That window is the **grace period**.\n\nHere is Daniela's first statement.",
          doc: danielaOctober,
        },
        {
          type: 'mc',
          id: 't2-u3-l3-e5',
          prompt: 'Which payment by Nov 22 means Daniela pays no interest on her October purchases?',
          choices: [
            { text: '$312.40, the full new balance', correct: true },
            { text: '$25.00, the minimum payment due', why: 'The minimum avoids a late fee, but the other $287.40 would start collecting interest.' },
            { text: '$487.60, the available credit', why: "Available credit is how much more she could borrow. It isn't what she owes." },
            { text: '$156.20, half the balance', why: "Paying half helps, but interest would still be charged on the half she didn't pay." },
          ],
          explain: 'Only the full statement balance, paid by the due date, keeps the grace period working.',
          doc: danielaOctober,
        },
        {
          type: 'tf',
          id: 't2-u3-l3-e6',
          statement: "Daniela's October balance uses less than 30% of her credit limit.",
          answer: false,
          explain: 'False. $312.40 ÷ $800 is about 39%, above the common 30% guideline. Utilization changes as her balance changes, so paying the card down brings it back under.',
          doc: danielaOctober,
        },
        {
          type: 'teach',
          id: 't2-u3-l3-e7',
          emoji: '📉',
          title: 'The minimum payment',
          body: "The **minimum payment** is the smallest amount you can pay by the due date without a late fee. It is not the amount that avoids interest.\n\nWhatever you don't pay is charged interest at the card's APR. A 23.99% APR works out to about 2% a month.\n\nIn November, Daniela decides to pay only the $25.00 minimum and keep the rest of her paycheck.",
        },
        {
          type: 'mc',
          id: 't2-u3-l3-e8',
          prompt: 'Daniela pays the $25.00 minimum on time. What happens next?',
          choices: [
            { text: 'She avoids a late fee, but $287.40 collects interest', correct: true },
            { text: 'She owes no interest, because she paid on time', why: 'Paying on time avoids a late fee. Avoiding interest takes paying the full balance.' },
            { text: 'She is charged a late fee for not paying in full', why: 'The minimum is enough to avoid a late fee. The cost of paying less than the full balance is interest.' },
            { text: 'Her next statement shows a $0 balance', why: 'She paid $25.00 of a $312.40 balance, so most of it is still owed.' },
          ],
          explain: '$312.40 - $25.00 = $287.40 still on the card, and that amount is charged interest until she pays it off.',
          doc: danielaOctober,
        },
        {
          type: 'number',
          id: 't2-u3-l3-e9',
          prompt: 'About how much interest will the leftover $287.40 collect in one month at about 2%? (Round to the nearest dollar.)',
          answer: 6,
          tolerance: 0.5,
          prefix: '$',
          explain: '2% of $287.40 is about $5.75, which rounds to $6. That is the cost of carrying the balance for one month.',
        },
        {
          type: 'number',
          id: 't2-u3-l3-e10',
          prompt: "Here is Daniela's November statement. She paid $25.00 and bought nothing new. By how much did her balance actually go down?",
          answer: 19.25,
          tolerance: 0.01,
          prefix: '$',
          explain: '$312.40 - $293.15 = $19.25. She paid $25.00, but $5.75 of interest was added, so her balance fell by only $19.25.',
          doc: danielaNovember,
        },
        {
          type: 'scenario',
          id: 't2-u3-l3-e11',
          emoji: '🧾',
          setup: "It's December. Daniela's card balance is $293.15. After her paycheck, she has $640 in checking, and $180 of other bills are due this week. Her card payment is due Dec 22.",
          question: 'How should she handle the card?',
          choices: [
            {
              text: 'Pay the full $293.15 by the due date',
              best: true,
              outcome: 'She still has $166.85 after her bills. With the balance paid off, it stops collecting interest each month.',
            },
            {
              text: 'Pay the $25.00 minimum again',
              outcome: 'If she keeps paying $25 a month, it takes about 14 months to clear the balance and costs about $44 in interest.',
            },
            {
              text: 'Pay $150 now and the rest next month',
              outcome: 'Better than the minimum. The remaining $143.15 collects about $3 of interest before she pays it off.',
            },
          ],
          doc: danielaNovember,
        },
        {
          type: 'teach',
          id: 't2-u3-l3-e12',
          emoji: '🏧',
          title: 'Cash advances cost more',
          body: "A credit card can also take cash out of an ATM. This is a **cash advance**, and it usually costs much more than a purchase.\n\nLook at Daniela's terms: a cash advance fee, a higher APR (28.99%), and no grace period, so interest starts the day she takes the cash.",
          doc: danielaOffer,
        },
        {
          type: 'number',
          id: 't2-u3-l3-e13',
          prompt: "In January, Daniela's car needs a $300 repair. If she took a $300 cash advance, what would the fee be under her card's terms?",
          answer: 15,
          prefix: '$',
          explain: '5% of $300 is $15, which is more than $10, so the fee is $15. Interest at 28.99% would also start right away.',
          doc: danielaOffer,
        },
        {
          type: 'scenario',
          id: 't2-u3-l3-e14',
          emoji: '🚗',
          setup: "Daniela paid off her card in December, so her balance is $0. She has $400 in an emergency savings account. The mechanic needs $300 for the repair by Friday.",
          question: "What's her best way to pay?",
          choices: [
            {
              text: 'Pay the $300 from her emergency savings',
              best: true,
              outcome: 'No fee and no interest. Her savings drops to $100, and she can rebuild it over the next few paychecks.',
            },
            {
              text: 'Take a $300 cash advance on her card',
              outcome: 'She pays a $15 fee right away, and interest at 28.99% starts the same day.',
            },
            {
              text: 'Charge the repair and pay the $25 minimum each month',
              outcome: 'The $300 balance uses 37.5% of her limit and collects interest every month she carries it.',
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 4: Building credit as a teen (9) ---------------- */
    {
      id: 't2-u3-l4',
      title: 'Building Credit as a Teen',
      description: 'How to start a credit history before and right after you turn 18.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u3-l4-e1',
          emoji: '🌱',
          title: 'Starting from no history',
          body: "Lenders want proof that you pay back what you borrow. If you've never borrowed, there's no record yet, and you may not have a credit report at all. That's normal for a teenager.\n\nNo credit is not the same as bad credit. It just means lenders have nothing to look at yet. Debit cards and savings accounts don't help here, because they use your own money.",
          example: "Starting a small history early means you aren't at zero when you apply for an apartment, a car loan, or your own card.",
        },
        {
          type: 'tf',
          id: 't2-u3-l4-e2',
          statement: 'Using your debit card for every purchase helps build your credit score.',
          answer: false,
          explain: "False. A debit card spends your own money, so there's no borrowing to report. Debit purchases don't appear on your credit report.",
        },
        {
          type: 'teach',
          id: 't2-u3-l4-e3',
          emoji: '🤝',
          title: 'Becoming an authorized user',
          body: "You generally can't open your own credit card until 18. A parent can add you as an **authorized user** on their card instead.\n\nYou get a card with your name on it, and the account's history can show up on your credit report. Your parent still owes the bill.\n\nThis works both ways. On-time payments can help you, and late payments or a maxed-out card can hurt you.",
          example: 'Your mom adds you to her card when you are 15. She pays in full every month and keeps the balance low. By 18, you may already have a few years of history.',
        },
        {
          type: 'mc',
          id: 't2-u3-l4-e4',
          prompt: "You're 16 and want to start building credit. What's the most realistic first step?",
          choices: [
            { text: "Become an authorized user on a parent's card", correct: true },
            { text: 'Apply for a student credit card in your own name', why: "Card companies generally require you to be 18 to open your own card." },
            { text: 'Put all your spending on a debit card', why: "Debit cards spend your own money, so nothing is reported to the credit bureaus." },
            { text: 'Keep a high balance in a savings account', why: "Saving is a good habit, but savings aren't borrowing, so they don't appear on a credit report." },
          ],
          explain: "Being an authorized user on a parent's well-managed card is the usual way to start a credit history before 18.",
        },
        {
          type: 'tf',
          id: 't2-u3-l4-e5',
          statement: "If the parent who added you as an authorized user starts paying late, it can hurt your credit too.",
          answer: true,
          explain: "True. The account's history can show up on your report, and that includes late payments and high balances. Choose a card that is paid on time and kept low.",
        },
        {
          type: 'teach',
          id: 't2-u3-l4-e6',
          emoji: '🔐',
          title: 'At 18: a secured card',
          body: "A common first card at 18 is a **secured card**. You put down a cash deposit, and that deposit usually becomes your credit limit. Use the card a little, pay on time, and you build a payment history.\n\nIf you're under 21, you need your own income (or a cosigner, which most card companies don't allow) to get a card in your name.",
          doc: securedOffer,
        },
        {
          type: 'number',
          id: 't2-u3-l4-e7',
          prompt: "What's the highest balance on this card that keeps you at or under 30% utilization?",
          answer: 90,
          prefix: '$',
          explain: '30% of $300 is $90. Staying well below that, like $20 to $40 of gas each month, is even better.',
          doc: securedOffer,
        },
        {
          type: 'mc',
          id: 't2-u3-l4-e8',
          prompt: 'A friend says you should leave a small balance on your card each month so your credit grows faster. What is true?',
          choices: [
            { text: 'Paying in full builds the same history with no interest', correct: true },
            { text: 'A small carried balance raises your score more', why: 'This is a common myth. Your score rewards on-time payments and low balances, not paying interest.' },
            { text: 'Paying in full makes the card look unused', why: 'A card you use and pay off is an active, well-managed account.' },
            { text: 'Bureaus only count accounts that charge you interest', why: 'Bureaus record your payments and balances. Interest paid is not something your score rewards.' },
          ],
          explain: 'You build credit by using the card and paying on time. Paying the full balance does that and costs $0 in interest.',
        },
        {
          type: 'scenario',
          id: 't2-u3-l4-e9',
          emoji: '🎂',
          setup: "You're 18 and have had this secured card for six months, paying in full every time. A coworker says you'll build credit faster if you charge close to the full $300 each month.",
          question: 'What do you do?',
          choices: [
            {
              text: 'Keep charging a small amount and pay it in full',
              best: true,
              outcome: 'Your utilization stays low, your payments stay on time, and you pay no interest.',
            },
            {
              text: 'Charge close to $300 each month, then pay it off',
              outcome: 'Your balance may be reported near 100% of your limit, which can lower your score even though you pay on time.',
            },
            {
              text: 'Apply for three more cards to speed things up',
              outcome: "That's three hard inquiries at once, which can lower your score for a while, plus three more bills to track.",
            },
          ],
          doc: securedOffer,
        },
      ],
    },
  ],

  quiz: {
    passPercent: 70,
    exercises: [
      {
        type: 'mc',
        id: 't2-u3-q-e1',
        prompt: 'Why do many people consider a credit union when choosing where to bank?',
        choices: [
          { text: 'Credit unions often charge lower fees', correct: true },
          { text: 'Credit union accounts never have any fees', why: 'Credit unions can still charge fees. Read the fee list, the same as you would at a bank.' },
          { text: 'Anyone can join any credit union', why: 'Credit unions have membership rules, usually based on where you live, work, or go to school.' },
          { text: "Credit union deposits don't need insurance", why: 'Most credit unions are insured by the NCUA, up to $250,000 per depositor, per institution, per ownership category.' },
        ],
        explain: 'Credit unions are member-owned nonprofits, so they often pass savings back as lower fees and better rates. Banks can be a good fit too, so compare the fees.',
      },
      {
        type: 'tf',
        id: 't2-u3-q-e2',
        statement: 'Banks need your permission before charging overdraft fees on ATM withdrawals and one-time debit card purchases.',
        answer: true,
        explain: "True. You have to opt in first. If you don't, a purchase that's too big usually just gets declined.",
      },
      {
        type: 'number',
        id: 't2-u3-q-e3',
        prompt: "Your bank charges $2.50 for an out-of-network ATM, and the ATM's owner charges $3.00. You do this four times a month. What's the monthly cost?",
        answer: 22,
        prefix: '$',
        explain: 'Each withdrawal costs $2.50 + $3.00 = $5.50. Four withdrawals cost $22 a month, or $264 a year.',
      },
      {
        type: 'match',
        id: 't2-u3-q-e4',
        prompt: 'Match each credit term to its meaning.',
        pairs: [
          { left: 'Credit report', right: 'Record of your borrowing and payments' },
          { left: 'Credit score', right: 'One number that sums up your report' },
          { left: 'Credit bureau', right: 'Company that keeps credit reports' },
          { left: 'Hard inquiry', right: 'Credit check when you apply to borrow' },
          { left: 'Utilization', right: 'Share of your credit limit in use' },
        ],
        explain: 'Bureaus keep the reports, scores sum them up, and utilization and payment history are the biggest things a score looks at.',
      },
      {
        type: 'mc',
        id: 't2-u3-q-e5',
        prompt: 'Your card has a $1,200 limit. Which balance keeps you under the common 30% utilization guideline?',
        choices: [
          { text: '$300', correct: true },
          { text: '$400', why: '$400 ÷ $1,200 is about 33%, just over the line.' },
          { text: '$480', why: '$480 ÷ $1,200 is 40%.' },
          { text: '$600', why: '$600 ÷ $1,200 is 50%, half the limit.' },
        ],
        explain: '30% of $1,200 is $360. A $300 balance is 25%, which is under the guideline. Lower is even better.',
      },
      {
        type: 'fill',
        id: 't2-u3-q-e6',
        sentence: 'A FICO score runs from ___ to 850, and the factor that counts the most is ___ history.',
        answers: ['300', 'payment'],
        bank: ['300', 'payment', '100', '500', 'income', 'balance'],
        explain: 'FICO scores range from 300 to 850. Payment history is 35% of the score, the largest factor.',
      },
      {
        type: 'mc',
        id: 't2-u3-q-e7',
        prompt: 'Which payment by the due date avoids interest on these purchases?',
        choices: [
          { text: '$186.20, the full new balance', correct: true },
          { text: '$25.00, the minimum payment', why: 'The minimum avoids a late fee, but the remaining $161.20 would collect interest.' },
          { text: '$100.00, more than half the balance', why: 'Interest would still be charged on the $86.20 left unpaid.' },
          { text: 'Any amount, as long as it is paid on time', why: 'Paying on time avoids a late fee. Only the full statement balance avoids interest.' },
        ],
        explain: 'Paying the full statement balance by the due date keeps you in the grace period, so purchases cost no interest.',
        doc: ridgewaySeptember,
      },
      {
        type: 'number',
        id: 't2-u3-q-e8',
        prompt: 'You carry a $450 balance on a card with a 24% APR, about 2% a month. About how much interest is that for one month?',
        answer: 9,
        tolerance: 0.5,
        prefix: '$',
        explain: '2% of $450 is $9. That charge repeats every month the balance stays unpaid.',
      },
      {
        type: 'mc',
        id: 't2-u3-q-e9',
        prompt: 'Which of these builds your credit history?',
        choices: [
          { text: 'Paying a credit card bill on time every month', correct: true },
          { text: 'Using a debit card for all your purchases', why: 'Debit uses your own money, so nothing is reported to the credit bureaus.' },
          { text: 'Keeping $500 in a savings account', why: "Savings are useful for emergencies, but they aren't borrowing, so they don't appear on a credit report." },
          { text: 'Leaving a small balance on the card each month', why: 'This is a myth. Paying in full builds the same history and costs no interest.' },
        ],
        explain: 'Credit history comes from borrowing and paying it back on time. Payment history is the largest part of a FICO score.',
      },
      {
        type: 'scenario',
        id: 't2-u3-q-e10',
        emoji: '🤝',
        setup: "You're 16. Your dad offers to add you as an authorized user on his credit card. He pays the full balance every month and has never missed a due date.",
        question: 'Is this a good way to start building credit?',
        choices: [
          {
            text: 'Yes, his on-time history can help build yours',
            best: true,
            outcome: 'You could reach 18 with a credit history already started. It is still his bill, so agree with him on how you will use the card.',
          },
          {
            text: 'No, authorized users have to pay the whole bill',
            outcome: 'Your dad, as the main cardholder, owes the bill. You get the account history and a card with your name on it.',
          },
          {
            text: "No, a parent's card can't appear on your report",
            outcome: "It can. The account's history can show up on an authorized user's report, which is why his on-time record could help you.",
          },
        ],
      },
    ],
  },
}

export default unit
