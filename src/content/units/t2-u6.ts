import type { Doc, Unit } from '../types'

/* ---------- Documents reused across exercises ---------- */

const anaOffer: Doc = {
  kind: 'offer',
  title: "Harlow State University: 2027-28 aid offer",
  subtitle: "Student: Ana Torres · First year, living on campus",
  rows: [
    { label: "Cost of attendance", value: "$27,000", strong: true },
    { label: "Tuition and fees", value: "$11,200", indent: true },
    { label: "Housing and food", value: "$12,600", indent: true },
    { label: "Books, transportation, personal", value: "$3,200", indent: true },
    { label: "Federal Pell Grant", value: "$4,500" },
    { label: "State grant", value: "$2,000" },
    { label: "Harlow Merit Scholarship", value: "$5,000" },
    { label: "Federal Work-Study", value: "$2,400" },
    { label: "Federal Direct Subsidized Loan", value: "$3,500" },
    { label: "Federal Direct Unsubsidized Loan", value: "$2,000" },
    { label: "Total aid offered", value: "$19,400", strong: true },
  ],
  note: "Work-study is paid as you work. Loans must be repaid with interest.",
}

const loanTable: Doc = {
  kind: 'table',
  title: "Two $3,500 federal loans after 4 years of school",
  subtitle: "Example rate: 5% a year · No payments during school",
  rows: [
    { label: "Subsidized loan borrowed", value: "$3,500" },
    { label: "Interest charged to you in school", value: "$0", indent: true },
    { label: "Owed when you leave school", value: "$3,500", strong: true },
    { label: "Unsubsidized loan borrowed", value: "$3,500" },
    { label: "Interest added in school (4 × $175)", value: "$700", indent: true },
    { label: "Owed when you leave school", value: "$4,200", strong: true },
  ],
  note: "Simplified to whole years. Real federal rates are set each year.",
}

const twoOffers: Doc = {
  kind: 'table',
  title: "Two aid offers for the same student",
  subtitle: "First-year costs and aid",
  rows: [
    { label: "Alder Ridge College: cost of attendance", value: "$58,000", strong: true },
    { label: "Grants and scholarships", value: "$41,000", indent: true },
    { label: "Federal loans offered", value: "$5,500", indent: true },
    { label: "Bayford State University: cost of attendance", value: "$26,000", strong: true },
    { label: "Grants and scholarships", value: "$6,000", indent: true },
    { label: "Federal loans offered", value: "$5,500", indent: true },
  ],
  note: "Net price = cost of attendance minus grants and scholarships.",
}

const listings: Doc = {
  kind: 'table',
  title: "Listings Tariq is considering",
  subtitle: "Monthly rent · Utilities not included",
  rows: [
    { label: "Studio, Elm Street (alone)", value: "$1,150" },
    { label: "One-bedroom near work (alone)", value: "$1,050" },
    { label: "Two-bedroom, Pine Avenue (whole unit)", value: "$1,700" },
    { label: "Pine Avenue split with a roommate", value: "$850 each", indent: true },
  ],
  note: "Tariq's coworker Luis is also looking for a place.",
}

const moveIn: Doc = {
  kind: 'receipt',
  title: "Tallgrass Property Group: move-in charges",
  subtitle: "Unit 2B, 418 Pine Avenue · Tariq Hassan and Luis Ortega",
  rows: [
    { label: "First month's rent", value: "$1,700" },
    { label: "Security deposit (refundable)", value: "$1,700" },
    { label: "Application fees (2 × $45)", value: "$90" },
    { label: "Total due at lease signing", value: "$3,490", strong: true },
  ],
  note: "Rent is due on the 1st of each month.",
}

const bills: Doc = {
  kind: 'table',
  title: "Unit 2B: shared monthly bills (estimate)",
  subtitle: "Split evenly between Tariq and Luis",
  rows: [
    { label: "Electricity", value: "$95" },
    { label: "Natural gas", value: "$45" },
    { label: "Water and sewer", value: "$50" },
    { label: "Internet", value: "$60" },
    { label: "Total", value: "$250", strong: true },
  ],
  note: "Electric and gas bills change with the season.",
}

const depositReturn: Doc = {
  kind: 'statement',
  title: "Tallgrass Property Group: security deposit return",
  subtitle: "Unit 2B · Lease ended after 12 months",
  rows: [
    { label: "Security deposit held", value: "$1,700" },
    { label: "Carpet cleaning, bedroom stain", value: "-$150", indent: true },
    { label: "Replace broken blinds, living room", value: "-$60", indent: true },
    { label: "Amount returned", value: "$1,490", strong: true },
  ],
  note: "Hallway floor scratch and bathroom tile were on the move-in checklist: no charge.",
}

const quizOffer: Doc = {
  kind: 'offer',
  title: "Westmere University: 2027-28 aid offer",
  subtitle: "First year · Living on campus",
  rows: [
    { label: "Cost of attendance", value: "$24,000", strong: true },
    { label: "Federal Pell Grant", value: "$3,500" },
    { label: "Westmere Grant", value: "$3,500" },
    { label: "Community scholarship", value: "$3,000" },
    { label: "Federal Work-Study", value: "$2,000" },
    { label: "Federal Direct Loans", value: "$5,500" },
    { label: "Total aid offered", value: "$17,500", strong: true },
  ],
}

const unit: Unit = {
  id: 't2-u6',
  tier: 2,
  order: 6,
  title: 'College & Big Choices',
  tagline: "Learn how to pay for school, borrow carefully, and plan a first apartment.",
  color: 'teal',
  emoji: '🎓',

  guidebook: {
    intro:
      "College, trade school, and a first apartment are some of the largest costs you will face early on. This unit covers financial aid, student loans, how to judge whether a path is worth its cost, and what moving out actually costs.",
    keyIdeas: [
      {
        title: "Gift aid first",
        body: "Grants and scholarships don't have to be repaid, and work-study is a part-time job. Use these before you borrow.",
      },
      {
        title: "File the FAFSA every year",
        body: "The FAFSA is free at studentaid.gov and opens in the fall before the school year. There's no income limit to apply, and the federal government, many states, and many colleges use it.",
      },
      {
        title: "Federal loans before private",
        body: "Federal loans have fixed rates, no credit check for most undergraduates, and more protections. Subsidized loans don't build interest while you're in school at least half-time; unsubsidized loans do.",
      },
      {
        title: "Compare net price, not sticker price",
        body: "Net price is the cost of attendance minus grants and scholarships. Weigh it against what the path is likely to pay, and whether you're likely to finish.",
      },
      {
        title: "Moving out costs more than rent",
        body: "Plan for first month's rent, a security deposit, fees, furniture, and utilities. A common guideline keeps rent at or below 30% of your gross income.",
      },
    ],
    funFacts: [
      "The first word in FAFSA is \"Free,\" so you should never pay a website to file it.",
      "The Pell Grant is named after Claiborne Pell, a senator from Rhode Island who pushed for college aid.",
      "One long-running contest has awarded scholarship money for prom outfits made out of duct tape.",
      "\"Tuition\" comes from a Latin word about guarding or looking after someone, and it's related to \"tutor.\"",
      "The \"board\" in \"room and board\" is an old word for a table, so the phrase means a place to sleep plus meals.",
      "Many states limit how large a security deposit can be, set a deadline for returning it, or both.",
    ],
    words: [
      { term: "FAFSA", meaning: "The free federal form for college aid" },
      { term: "Grant", meaning: "School money you usually don't repay, often based on need" },
      { term: "Scholarship", meaning: "School money you don't repay, often for grades, talents, or need" },
      { term: "Work-study", meaning: "A part-time job that helps pay for school" },
      { term: "Subsidized loan", meaning: "A federal loan where the government pays the interest during school" },
      { term: "Unsubsidized loan", meaning: "A federal loan that builds interest from the day it's paid out" },
      { term: "Cosigner", meaning: "A person who is legally responsible for a loan if you don't pay" },
      { term: "Net price", meaning: "Cost of attendance minus grants and scholarships" },
      { term: "Security deposit", meaning: "Refundable money a landlord holds against unpaid rent or damage" },
      { term: "Lease", meaning: "A contract to rent a place for a set time" },
    ],
  },

  lessons: [
    /* ---------------- Lesson 1: Paying for college ---------------- */
    {
      id: 't2-u6-l1',
      title: 'Paying for College',
      description: 'FAFSA, grants, scholarships, work-study, and reading an aid offer.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u6-l1-e1',
          emoji: '🎓',
          title: 'Four ways to pay for school',
          body: "Most students pay for college with a mix of four things:\n\n- Grants: money you usually don't repay, often based on financial need\n- Scholarships: money you don't repay, awarded for grades, talents, need, or other criteria\n- Work-study: a part-time job, often on campus, for students with financial need\n- Loans: money you borrow and repay with interest\n\nUse **grants and scholarships** first, and borrow only for what's left.",
          example: "A school costs $20,000 a year. A $6,000 grant and a $2,000 scholarship leave $12,000 to cover. The $8,000 from the grant and scholarship never has to be repaid.",
        },
        {
          type: 'sort',
          id: 't2-u6-l1-e2',
          prompt: "Sort each type of aid. Gift aid is money you don't have to repay or work for.",
          buckets: ['Gift aid', 'Earned', 'Borrowed'],
          items: [
            { text: 'Federal Pell Grant', bucket: 0 },
            { text: 'State grant', bucket: 0 },
            { text: 'Local club scholarship', bucket: 0 },
            { text: 'Federal Work-Study', bucket: 1 },
            { text: 'Federal Direct Loan', bucket: 2 },
            { text: 'Private student loan', bucket: 2 },
          ],
          explain:
            "Grants and scholarships are gift aid. Work-study pays you for hours you actually work. Loans are borrowed and repaid with interest, even when a college lists them as \"aid.\"",
        },
        {
          type: 'teach',
          id: 't2-u6-l1-e3',
          emoji: '📝',
          title: 'Meet the FAFSA',
          body: "The **FAFSA** (Free Application for Federal Student Aid) decides whether you can get federal grants, work-study, and federal loans. Many states and colleges use it for their own aid too.\n\n- It's free at studentaid.gov\n- It opens in the **fall** before the school year\n- You file it again every year you want aid\n\nMost high school students need to include a parent's financial information.",
        },
        {
          type: 'tf',
          id: 't2-u6-l1-e4',
          statement: 'You have to pay a fee to file the FAFSA.',
          answer: false,
          explain:
            "False. The first F stands for Free. A site that charges you to file is not the official one. File at studentaid.gov.",
        },
        {
          type: 'mc',
          id: 't2-u6-l1-e5',
          prompt: "Diego's parents both work full-time and earn a solid income. He plans to skip the FAFSA because he assumes he won't qualify. What is he missing?",
          choices: [
            { text: "There's no income limit, and some aid isn't based on need", correct: true },
            { text: 'Nothing. The FAFSA is mainly for low-income families', why: "This is a common belief, but there's no income limit to apply. Unsubsidized federal loans aren't based on need, and many colleges use the FAFSA for their own aid." },
            { text: "He should wait until he's accepted somewhere to file", why: 'Filing late can cost him. Some state and college aid is limited and goes to students who file early.' },
            { text: 'He only needs to file once, for his first year', why: 'The FAFSA is filed again for every school year you want aid.' },
          ],
          explain:
            "Diego should file. It's free, there's no income limit, and it's required for federal loans and many college grants.",
        },
        {
          type: 'teach',
          id: 't2-u6-l1-e6',
          emoji: '📄',
          title: 'Reading an aid offer',
          body: "After you're admitted and your FAFSA is processed, a college sends an **aid offer** (sometimes called an award letter). It lists every kind of aid together.\n\nThe **total aid** line adds grants, scholarships, work-study, and loans. Only the grants and scholarships are money you keep without working or repaying. You can accept or decline each loan separately.",
          doc: anaOffer,
        },
        {
          type: 'number',
          id: 't2-u6-l1-e7',
          prompt: "Using Ana's aid offer, how much does she get in gift aid (grants and scholarships only)?",
          answer: 11500,
          prefix: '$',
          explain:
            "$4,500 + $2,000 + $5,000 = $11,500. Work-study and loans count toward the $19,400 total, but they aren't gift aid.",
          doc: anaOffer,
        },
        {
          type: 'mc',
          id: 't2-u6-l1-e8',
          prompt: "Ana's friend sees the $19,400 total and says her first year will only cost $7,600. What's wrong with that?",
          choices: [
            { text: '$5,500 of the total is loans she has to repay', correct: true },
            { text: 'Nothing. $27,000 minus $19,400 is $7,600', why: 'The subtraction is right, but it treats loans and work-study like discounts. She repays the $5,500 in loans and has to work to earn the $2,400.' },
            { text: 'The cost of attendance leaves out housing and food', why: 'This offer includes $12,600 for housing and food. The problem is how the aid is being counted.' },
            { text: 'Work-study money goes to the college, not to her', why: "Work-study is usually paid to the student as a paycheck. It helps with costs, but only for hours she works." },
          ],
          explain:
            "Total aid is not the same as free money. Of Ana's $19,400, $11,500 is gift aid, $2,400 has to be earned, and $5,500 is borrowed.",
          doc: anaOffer,
        },
        {
          type: 'number',
          id: 't2-u6-l1-e9',
          prompt: "Ana's work-study job at the campus library pays $15 an hour. How many hours must she work to earn the full $2,400 on her offer?",
          answer: 160,
          suffix: 'hours',
          explain:
            "$2,400 ÷ $15 = 160 hours. Across a school year of about 30 weeks, that's a little over 5 hours a week. Work-study pays only for hours worked, so $2,400 is the most she can earn from it.",
          doc: anaOffer,
        },
        {
          type: 'teach',
          id: 't2-u6-l1-e10',
          emoji: '🏆',
          title: 'Finding scholarships',
          body: "Scholarships come from colleges, employers, community groups, and local businesses. Some reward grades, some reward talents or activities, and some are based on need.\n\nLocal scholarships often draw fewer applicants than national ones, so your chances can be better.\n\nA real scholarship never asks you to pay a fee to apply or to receive the money.",
          example: 'A local civic club offers $500 for a one-page essay. If the application takes you 4 hours, that works out to $125 an hour.',
        },
        {
          type: 'tf',
          id: 't2-u6-l1-e11',
          statement: 'A scholarship that charges a $99 processing fee before paying out is probably real, since processing costs money.',
          answer: false,
          explain:
            "False. Paying to receive a scholarship is a common scam, and the FTC warns about it. Legitimate scholarships don't charge you to apply or to collect.",
        },
        {
          type: 'teach',
          id: 't2-u6-l1-e12',
          emoji: '🏛️',
          funFact: true,
          title: 'The stories behind the money',
          body: "The federal **Pell Grant** is named after Claiborne Pell, a senator from Rhode Island who pushed for college aid.\n\nScholarships can also be very specific. One long-running contest has awarded scholarship money for prom outfits made out of duct tape.",
        },
        {
          type: 'scenario',
          id: 't2-u6-l1-e13',
          emoji: '✍️',
          setup:
            'Your counselor mentions a $1,000 scholarship from a local credit union. It needs a 500-word essay and is due in two weeks, the same week as two big tests.',
          question: 'What do you do?',
          choices: [
            {
              text: 'Skip it, since $1,000 is small compared to tuition',
              outcome: "You save a few hours, but you pass up $1,000 you wouldn't have to borrow or earn. Small local awards add up when you apply to several.",
            },
            {
              text: 'Pay a $60 service to find and apply to scholarships for you',
              outcome: 'You pay for help you can get free. Your counselor, the college aid office, and free search tools list the same kinds of awards.',
            },
            {
              text: 'Write the essay this weekend, before test week',
              best: true,
              outcome: 'It takes about four hours. Local awards often have fewer applicants than national ones, and you can reuse the essay for other applications.',
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 2: Student loans ---------------- */
    {
      id: 't2-u6-l2',
      title: 'Student Loans',
      description: 'Federal vs. private, subsidized vs. unsubsidized, and how much to borrow.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u6-l2-e1',
          emoji: '🏦',
          title: 'Federal and private loans',
          body: "A student loan is borrowed money you repay with **interest**, the cost of borrowing.\n\n- Federal loans come from the US Department of Education, and you apply through the FAFSA. Rates are fixed, most undergraduate loans need no credit check, and there are more options if repayment gets hard.\n- Private loans come from banks, credit unions, and online lenders. The rate depends on your credit, and many students need a **cosigner**.",
        },
        {
          type: 'sort',
          id: 't2-u6-l2-e2',
          prompt: 'Federal or private? Sort each feature.',
          buckets: ['Federal', 'Private'],
          items: [
            { text: 'Apply through the FAFSA', bucket: 0 },
            { text: 'Rate set by federal law', bucket: 0 },
            { text: 'Usually no credit check', bucket: 0 },
            { text: 'Rate based on your credit', bucket: 1 },
            { text: 'Often needs a cosigner', bucket: 1 },
            { text: 'Offered by banks and lenders', bucket: 1 },
          ],
          explain:
            "Federal undergraduate loans have rates set by law, so everyone borrowing that year gets the same rate. Private lenders price loans on your credit, or your cosigner's, so offers vary widely.",
        },
        {
          type: 'mc',
          id: 't2-u6-l2-e3',
          prompt: 'Why do financial aid counselors usually suggest federal loans before private ones?',
          choices: [
            { text: 'Fixed rates, no credit check for most, and more protections', correct: true },
            { text: "Federal loans don't charge interest", why: "This mixes up federal loans with subsidized loans. All federal loans charge interest. On subsidized loans, the government pays it while you're in school at least half-time." },
            { text: 'Private loans always have higher interest rates', why: 'Not always. A borrower with strong credit or a strong cosigner may get a lower private rate. The bigger difference is the protections and repayment options.' },
            { text: 'You can borrow as much as you need in federal loans', why: 'Federal loans have yearly and total limits, which is one reason some students also look at private loans.' },
          ],
          explain:
            "Federal loans have fixed rates, don't require a credit history for most undergraduates, and offer more options if repayment gets hard. Private loans usually can't match all of that.",
        },
        {
          type: 'teach',
          id: 't2-u6-l2-e4',
          emoji: '⏳',
          title: 'Subsidized vs. unsubsidized',
          body: "Federal loans for undergraduates come in two types:\n\n- **Subsidized**: for students with financial need. The government pays the interest while you're in school at least half-time.\n- **Unsubsidized**: not based on need. Interest starts adding up as soon as the money is paid out, including while you're in class.\n\nThe table shows the same $3,500 borrowed both ways.",
          doc: loanTable,
        },
        {
          type: 'number',
          id: 't2-u6-l2-e5',
          prompt: 'You borrow $5,000 in unsubsidized loans at an example rate of 5% a year and make no payments. About how much interest builds up over 4 years of school?',
          answer: 1000,
          prefix: '$',
          explain:
            "5% of $5,000 is $250 a year. Over 4 years that's $1,000, so you would owe about $6,000 when you leave school.",
        },
        {
          type: 'tf',
          id: 't2-u6-l2-e6',
          statement: "Interest on an unsubsidized loan doesn't start until after you graduate.",
          answer: false,
          explain:
            "False. Interest starts when the loan is paid out. Paying the interest as it builds keeps the balance from growing. On $5,000 at 5%, that's about $21 a month.",
        },
        {
          type: 'match',
          id: 't2-u6-l2-e7',
          prompt: 'Match each loan term to its meaning.',
          pairs: [
            { left: 'Subsidized', right: 'Government pays interest during school' },
            { left: 'Unsubsidized', right: 'Interest builds from the start' },
            { left: 'Cosigner', right: "Legally responsible if you don't pay" },
            { left: 'Grace period', right: 'Months before repayment begins' },
          ],
          explain:
            "A cosigner is more than a reference. If you miss payments, the lender can collect from them, and their credit can be hurt too.",
        },
        {
          type: 'teach',
          id: 't2-u6-l2-e8',
          emoji: '🧮',
          title: 'Borrow only what you need',
          body: "An aid offer shows the most you can borrow, not the amount you have to take. You can accept **part** of a loan or decline it.\n\nA common rule of thumb is to keep total student debt below what you expect to earn in your first year of work.\n\nFederal loans for undergraduates have a six-month **grace period** after you leave school before payments are due.",
        },
        {
          type: 'mc',
          id: 't2-u6-l2-e9',
          prompt: 'Your aid offer includes $5,500 in federal loans. After grants, savings, and summer job money, you still need $3,000. What should you do?',
          choices: [
            { text: 'Accept $3,000 of the loans and decline the rest', correct: true },
            { text: 'Accept all $5,500 so you have a cushion', why: 'Every extra dollar borrowed adds interest. If you run short later in the year, you can often ask the aid office about borrowing more.' },
            { text: 'Accept it all, since unsubsidized interest waits until graduation', why: 'Unsubsidized interest starts when the money is paid out, so the extra $2,500 costs you from the first day.' },
            { text: 'Decline the loans and put $3,000 on a credit card', why: 'Credit card rates are often above 20%, much higher than federal student loan rates, with fewer protections.' },
          ],
          explain:
            "Borrow what you need, not what you're offered. Less borrowed means less interest and smaller payments later.",
        },
        {
          type: 'tf',
          id: 't2-u6-l2-e10',
          statement: 'If you leave college before finishing, you still have to repay your student loans.',
          answer: true,
          explain:
            'True. Loans are owed whether or not you earn the degree. Borrowing and then leaving without one is one of the hardest situations for former students.',
        },
        {
          type: 'scenario',
          id: 't2-u6-l2-e11',
          emoji: '💻',
          setup:
            "After grants and scholarships, you're $2,000 short for your first year. Your FAFSA is filed. An online ad promises private student loans \"approved in 5 minutes.\"",
          question: 'What should you do first?',
          choices: [
            {
              text: "Apply for the private loan, since it's quick",
              outcome: "With little credit history, you'd likely need a cosigner, and your rate depends on credit. You'd also give up the protections federal loans offer.",
            },
            {
              text: "Ask the aid office about federal loans you haven't accepted",
              best: true,
              outcome: 'You can still accept part of the unsubsidized loan on your offer. It has a fixed rate and federal repayment options.',
            },
            {
              text: 'Charge it to a credit card and pay it off slowly',
              outcome: 'At a rate above 20%, $2,000 grows quickly, and minimum payments can stretch the debt out for years.',
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 3: Is it worth it? ---------------- */
    {
      id: 't2-u6-l3',
      title: 'Weighing Cost and Payoff',
      description: 'Net price, finishing, and paths besides a four-year degree.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u6-l3-e1',
          emoji: '🏷️',
          title: 'Sticker price vs. net price',
          body: "A college's **cost of attendance** is the full yearly cost: tuition, fees, housing, food, books, and transportation. People often call it the sticker price.\n\n**Net price** is the cost of attendance minus grants and scholarships. It's what you actually have to cover with savings, work, or loans.\n\nMost colleges post a net price calculator on their website so you can estimate it before you apply.",
          example: 'Cost of attendance: $28,000. Minus a $10,000 grant and a $2,000 scholarship, the net price is $16,000.',
        },
        {
          type: 'number',
          id: 't2-u6-l3-e2',
          prompt: 'Using the two offers, what is the net price at Alder Ridge College for the year?',
          answer: 17000,
          prefix: '$',
          explain:
            "$58,000 minus $41,000 in grants and scholarships is $17,000. The $5,500 in loans isn't subtracted, because it has to be repaid.",
          doc: twoOffers,
        },
        {
          type: 'mc',
          id: 't2-u6-l3-e3',
          prompt: 'Which school has the lower net price for this student, and by how much?',
          choices: [
            { text: 'Alder Ridge, by $3,000', correct: true },
            { text: 'Bayford State, by $32,000', why: 'That compares sticker prices. After grants and scholarships, Alder Ridge costs $17,000 and Bayford State costs $20,000.' },
            { text: 'Alder Ridge, by $35,000', why: "That's the difference in grants and scholarships. Net price also depends on each school's cost: $17,000 versus $20,000." },
            { text: 'They cost the same, since both offer $5,500 in loans', why: "Loans don't change the net price. Subtract only grants and scholarships: $17,000 versus $20,000." },
          ],
          explain:
            'Alder Ridge: $58,000 minus $41,000 is $17,000. Bayford State: $26,000 minus $6,000 is $20,000. The school with the higher sticker price costs this student $3,000 less.',
          doc: twoOffers,
        },
        {
          type: 'teach',
          id: 't2-u6-l3-e4',
          emoji: '📈',
          title: 'Finishing matters',
          body: "On average, people with a **bachelor's degree** earn more and are unemployed less often than people whose highest education is a high school diploma.\n\nThat's an average, not a promise. The payoff depends on what you study, what you pay, and whether you **finish**. Borrowing and then leaving without a degree means carrying the debt without most of the benefit.",
        },
        {
          type: 'mc',
          id: 't2-u6-l3-e5',
          prompt: 'Which of these usually leaves a student worst off financially?',
          choices: [
            { text: 'Borrowing $20,000 and leaving without a degree', correct: true },
            { text: "Borrowing $20,000 and finishing a bachelor's degree", why: 'The debt is the same, but finishing gives you the degree that higher average earnings depend on.' },
            { text: 'Taking five years to finish instead of four', why: 'An extra year adds cost, but you still finish with the degree. Debt with no degree is usually harder.' },
            { text: 'Starting at community college, then transferring', why: 'This often lowers the total cost, as long as your credits transfer.' },
          ],
          explain:
            'Debt without a degree means paying the cost while missing most of the payoff. Choosing a path you can finish matters as much as the price.',
        },
        {
          type: 'sort',
          id: 't2-u6-l3-e6',
          prompt: 'Is each item a cost or a payoff of going to college?',
          buckets: ['Cost', 'Payoff'],
          items: [
            { text: 'Tuition and fees', bucket: 0 },
            { text: 'Textbooks and supplies', bucket: 0 },
            { text: 'Wages missed while in class', bucket: 0 },
            { text: 'Higher average earnings', bucket: 1 },
            { text: 'Lower average unemployment', bucket: 1 },
            { text: 'Skills for a career', bucket: 1 },
          ],
          explain:
            "Time is a cost too. Hours spent in class are hours you aren't earning, which is an opportunity cost. A path pays off when the benefits outweigh all of the costs.",
        },
        {
          type: 'teach',
          id: 't2-u6-l3-e7',
          emoji: '🔧',
          title: 'Paths besides a four-year degree',
          body: "- **Community college**: much lower tuition on average, and open to most students with a diploma or GED. You can earn a two-year associate degree or transfer to a four-year school.\n- **Trade school**: training for jobs like electrician, welder, or HVAC technician, often in two years or less.\n- **Apprenticeship**: a paid job where you learn a skilled trade at work, usually with classes on the side.",
        },
        {
          type: 'number',
          id: 't2-u6-l3-e8',
          prompt: 'Tuition at a state university is $11,000 a year. Community college tuition is $4,000 a year. How much tuition do you save by taking your first two years at community college?',
          answer: 14000,
          prefix: '$',
          explain:
            '$11,000 minus $4,000 is $7,000 a year, times 2 years is $14,000. Before you count on it, check that your credits will transfer.',
        },
        {
          type: 'scenario',
          id: 't2-u6-l3-e9',
          emoji: '🚗',
          setup:
            "You enjoy working on cars and have thought about becoming an auto technician. Most of your friends are applying to four-year schools, and you feel pressure to do the same.",
          question: "What's the best next step?",
          choices: [
            {
              text: 'Apply to the same schools as your friends and decide later',
              outcome: "You could spend years and thousands of dollars on a path you weren't sure you wanted.",
            },
            {
              text: 'Compare cost, training time, and starting pay for each path',
              best: true,
              outcome: 'You look at an auto technician program, an apprenticeship, and a four-year degree side by side, then choose using real numbers.',
            },
            {
              text: 'Skip training and look for a shop job after graduation',
              outcome: 'Some shops hire entry-level helpers, but without training or certification, pay and chances to advance are usually limited.',
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 4: Moving out (connected story) ---------------- */
    {
      id: 't2-u6-l4',
      title: 'Tariq Moves Out',
      description: 'Rent, deposits, a roommate, and utilities, one decision at a time.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u6-l4-e1',
          emoji: '🔑',
          title: "Tariq's plan",
          body: "Tariq is 19 and works full-time as an electrical apprentice. He earns **$3,200 a month** before taxes and has $3,500 saved. He wants to move out of his family's apartment.\n\nA common guideline is to keep rent at or below **30%** of your gross (before-tax) income. Many landlords also look for gross income of about 3 times the rent.",
        },
        {
          type: 'number',
          id: 't2-u6-l4-e2',
          prompt: "Using the 30% guideline, what's the most Tariq should spend on rent each month?",
          answer: 960,
          prefix: '$',
          explain:
            '30% of $3,200 is $960. Keeping rent under that leaves room for food, transportation, savings, and everything else.',
        },
        {
          type: 'mc',
          id: 't2-u6-l4-e3',
          prompt: "Which option keeps Tariq's rent within his $960 guideline?",
          choices: [
            { text: 'Splitting the Pine Avenue two-bedroom with Luis', correct: true },
            { text: 'The one-bedroom near work at $1,050', why: "It's only $90 over, but that's about 33% of his income. A landlord might approve him, since $3,200 is more than 3 times $1,050, but it's above his own guideline." },
            { text: 'The studio on Elm Street at $1,150', why: '$1,150 is about 36% of his income, $190 over his limit.' },
            { text: 'None of them. He should wait until he earns more', why: 'His $850 share of the two-bedroom fits under $960.' },
          ],
          explain:
            'His share of the Pine Avenue unit is $850, about 27% of his gross income. A roommate is one way to bring rent under the guideline.',
          doc: listings,
        },
        {
          type: 'teach',
          id: 't2-u6-l4-e4',
          emoji: '🧾',
          title: 'Move-in costs',
          body: "Tariq and Luis are approved for the Pine Avenue unit. Before they get the keys, the landlord collects:\n\n- First month's rent\n- A **security deposit**, here equal to one month's rent\n- An application fee for each adult\n\nThe deposit is refundable. The landlord holds it and can keep part of it for unpaid rent or damage beyond normal wear and tear.",
          doc: moveIn,
        },
        {
          type: 'number',
          id: 't2-u6-l4-e5',
          prompt: 'Tariq and Luis split the move-in charges evenly. How much does Tariq pay at lease signing?',
          answer: 1745,
          prefix: '$',
          explain:
            "$3,490 ÷ 2 = $1,745. That's more than double his monthly rent share of $850.",
          doc: moveIn,
        },
        {
          type: 'tf',
          id: 't2-u6-l4-e6',
          statement: "The $1,700 security deposit on this bill is a fee Tariq and Luis won't get back.",
          answer: false,
          explain:
            'False. A security deposit is refundable. The landlord can keep part of it for unpaid rent or damage beyond normal wear and tear and returns the rest after move-out. Many states set a deadline for returning it.',
          doc: moveIn,
        },
        {
          type: 'mc',
          id: 't2-u6-l4-e7',
          prompt: 'Tariq had $3,500 saved. After paying his $1,745 move-in share, he spends $900 on a bed, a desk, and kitchen basics. How much savings is left?',
          choices: [
            { text: '$855', correct: true },
            { text: '$1,755', why: 'That subtracts his move-in share but forgets the $900 for furniture and kitchen basics.' },
            { text: '$2,600', why: 'That counts the furniture but leaves out his $1,745 move-in share.' },
            { text: "He'd be $890 short", why: 'That uses the full $3,490 move-in bill. Tariq pays only his half, $1,745.' },
          ],
          explain:
            "$3,500 minus $1,745 minus $900 is $855. That's about one month of his rent share, a thin cushion. One-time moving costs are easy to underestimate.",
        },
        {
          type: 'teach',
          id: 't2-u6-l4-e8',
          emoji: '💡',
          title: 'Bills and a shared lease',
          body: "**Utilities** are the services that keep a home running: electricity, gas, water, sewer, and trash. Some rentals include a few in the rent, so ask. Bills can rise in summer or winter.\n\nAndre and Luis both signed the **lease**. On a shared lease, each tenant is often responsible for the full rent, not just their half. A written roommate agreement sets who pays what, and when.",
        },
        {
          type: 'number',
          id: 't2-u6-l4-e9',
          prompt: "Using the bills estimate, what is Tariq's share of the shared bills each month?",
          answer: 125,
          prefix: '$',
          explain:
            '$250 ÷ 2 = $125. Add that to his $850 rent share, and his housing costs come to about $975 a month, more than rent alone.',
          doc: bills,
        },
        {
          type: 'fill',
          id: 't2-u6-l4-e10',
          sentence: 'If Luis moves out early, the landlord can often ask Tariq for the ___ rent, because they both signed the ___.',
          answers: ['full', 'lease'],
          bank: ['full', 'lease', 'half', 'roommate agreement', 'rental application'],
          explain:
            "On a shared lease, each tenant is often responsible for the whole rent. The roommate agreement is only between Tariq and Luis, and the landlord isn't part of it.",
        },
        {
          type: 'mc',
          id: 't2-u6-l4-e11',
          prompt: 'What should Tariq and Luis put in their written roommate agreement?',
          choices: [
            { text: 'How rent and each bill are split, and the due dates', correct: true },
            { text: "Nothing. They're coworkers and get along well", why: "Getting along now doesn't settle who pays when the electric bill jumps in July. Writing it down prevents arguments later." },
            { text: 'Only the rent split, since the bills change each month', why: 'Bills that change are where disagreements usually start. Agree on a split, such as evenly, and on who pays each company.' },
          ],
          explain:
            'A good agreement covers rent, each bill, due dates, and who pays each company. It turns assumptions into a plan both people signed.',
        },
        {
          type: 'mc',
          id: 't2-u6-l4-e12',
          prompt: 'On move-in day, Tariq finds a scratched floor in the hallway and a cracked tile in the bathroom. What should he do?',
          choices: [
            { text: 'Photograph both and note them on the move-in checklist', correct: true },
            { text: 'Repair them himself so the place looks nice', why: "He would pay for damage he didn't cause and still have no record that it was there before him." },
            { text: 'Mention it to the landlord in person', why: 'A conversation is easy to forget a year later. Dated photos and a written checklist are proof.' },
            { text: "Nothing. Damage that was already there can't be charged", why: "It shouldn't be, but without a record, it can be hard to prove the damage was there before he moved in." },
          ],
          explain:
            'Dated photos and a signed checklist protect his deposit. If the landlord later points to old damage, he can show it was there on day one.',
        },
        {
          type: 'number',
          id: 't2-u6-l4-e13',
          prompt: 'After 12 months, Luis takes a job in another city, and they both move out. They split the returned deposit evenly. How much does Tariq get back?',
          answer: 745,
          prefix: '$',
          explain:
            "$1,490 ÷ 2 = $745. The hallway floor and bathroom tile weren't charged, because they were on the move-in checklist.",
          doc: depositReturn,
        },
        {
          type: 'scenario',
          id: 't2-u6-l4-e14',
          emoji: '🏠',
          setup:
            "Tariq needs a new place. He got a raise and now earns $3,400 a month before taxes. He has his $745 deposit refund plus savings for move-in costs.",
          question: 'Which choice fits his budget best?',
          choices: [
            {
              text: 'Rent the $1,150 studio on Elm Street alone',
              outcome: "That's about 34% of his income. It's possible but tighter, and he pays the full deposit and move-in costs himself.",
            },
            {
              text: 'Share a two-bedroom with a new roommate at $850 each',
              best: true,
              outcome: 'His rent is 25% of his gross income, and a written roommate agreement sets the bill split from the start.',
            },
            {
              text: 'Rent a $1,600 one-bedroom he likes better',
              outcome: "That's about 47% of his gross income, which leaves little for bills, food, and savings.",
            },
          ],
        },
      ],
    },
  ],

  quiz: {
    passPercent: 70,
    exercises: [
      {
        type: 'mc',
        id: 't2-u6-q-e1',
        prompt: 'Which of these do you NOT have to repay?',
        choices: [
          { text: 'A Federal Pell Grant', correct: true },
          { text: 'A Federal Direct Subsidized Loan', why: "Subsidized means the government pays the interest while you're in school. You still repay the amount you borrowed." },
          { text: 'A Federal Direct Unsubsidized Loan', why: "All loans are repaid, and this one builds interest from the day it's paid out." },
          { text: 'A private student loan from a credit union', why: 'Private loans are repaid with interest, often with a cosigner who is also responsible.' },
        ],
        explain: 'Grants like the Pell Grant are gift aid. Every loan, federal or private, has to be repaid.',
      },
      {
        type: 'tf',
        id: 't2-u6-q-e2',
        statement: "If your family earns above a certain income, you aren't allowed to file the FAFSA.",
        answer: false,
        explain:
          "False. There's no income limit to apply. Some aid, like unsubsidized federal loans, isn't based on need, and many colleges use the FAFSA for their own aid.",
      },
      {
        type: 'match',
        id: 't2-u6-q-e3',
        prompt: 'Match each term to its meaning.',
        pairs: [
          { left: 'Work-study', right: 'Part-time job that helps pay for school' },
          { left: 'Subsidized loan', right: 'Government pays interest during school' },
          { left: 'Unsubsidized loan', right: 'Interest builds from day one' },
          { left: 'Net price', right: 'Cost after grants and scholarships' },
          { left: 'Security deposit', right: 'Refundable money held against damage' },
        ],
        explain: "These terms show up on aid offers and leases. Knowing them helps you understand what you're signing.",
      },
      {
        type: 'number',
        id: 't2-u6-q-e4',
        prompt: 'You borrow $6,000 in unsubsidized federal loans at an example rate of 5% a year. About how much interest builds up in the first year?',
        answer: 300,
        prefix: '$',
        explain:
          "5% of $6,000 is $300. On an unsubsidized loan, that interest builds while you're still in school.",
      },
      {
        type: 'tf',
        id: 't2-u6-q-e5',
        statement: 'You must accept the full loan amount on your aid offer or turn down the loan completely.',
        answer: false,
        explain:
          'False. You can accept part of a loan. Borrowing only what you need means less interest to repay.',
      },
      {
        type: 'number',
        id: 't2-u6-q-e6',
        prompt: 'What is the net price on this aid offer?',
        answer: 14000,
        prefix: '$',
        explain:
          "Subtract only grants and scholarships: $24,000 minus $10,000 is $14,000. Work-study must be earned and loans must be repaid, so they don't lower the net price.",
        doc: quizOffer,
      },
      {
        type: 'mc',
        id: 't2-u6-q-e7',
        prompt: 'Maria plans to spend two years at community college, then transfer to a state university. What should she check first?',
        choices: [
          { text: 'That her credits will transfer to the university', correct: true },
          { text: "That the university's sticker price is under $30,000", why: "Sticker price isn't what she'll pay. Net price, after grants and scholarships, matters more." },
          { text: 'Whether she can skip the FAFSA at community college', why: 'Community college students can get federal aid too, so she should still file the FAFSA.' },
          { text: 'Whether the community college has the lowest tuition nearby', why: "Lower tuition helps, but the savings disappear if her credits don't transfer and she has to retake classes." },
        ],
        explain:
          "Credits that don't transfer mean paying for the same classes twice. Advisors at both schools can confirm which credits will count.",
      },
      {
        type: 'sort',
        id: 't2-u6-q-e8',
        prompt: 'Is each a one-time move-in cost or a monthly bill?',
        buckets: ['One-time', 'Monthly'],
        items: [
          { text: 'Security deposit', bucket: 0 },
          { text: 'Application fee', bucket: 0 },
          { text: 'Moving truck rental', bucket: 0 },
          { text: 'Rent', bucket: 1 },
          { text: 'Electric bill', bucket: 1 },
          { text: 'Water bill', bucket: 1 },
        ],
        explain:
          'Move-in costs come all at once, before the monthly bills start. A first-apartment budget needs savings for both.',
      },
      {
        type: 'number',
        id: 't2-u6-q-e9',
        prompt: "You earn $2,800 a month before taxes. Using the 30% guideline, what's the most you'd want to spend on rent?",
        answer: 840,
        prefix: '$',
        explain: '30% of $2,800 is $840. Splitting a larger place with a roommate is one way to stay under that amount.',
      },
      {
        type: 'scenario',
        id: 't2-u6-q-e10',
        emoji: '📧',
        setup:
          "You get an email: \"Congratulations! You've been selected for a guaranteed $10,000 scholarship. Pay a $49 processing fee to claim it.\" You never applied.",
        question: 'What should you do?',
        choices: [
          {
            text: "Pay the $49, since it's small next to $10,000",
            outcome: "The $49 is gone, and the scholarship never arrives. Real scholarships don't charge you to collect.",
          },
          {
            text: 'Reply and ask for proof before paying',
            outcome: "They send an official-looking certificate and a deadline. It's still a scam, and replying tells them your email address is active.",
          },
          {
            text: "Don't respond, and report it at ReportFraud.ftc.gov",
            best: true,
            outcome: 'You keep your money and your information, and the report helps the FTC track the scam.',
          },
        ],
      },
    ],
  },
}

export default unit
