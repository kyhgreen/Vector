import type { Doc, Unit } from '../types'

/* ---------- Documents used in more than one exercise ---------- */

const andreWeek1: Doc = {
  kind: 'paystub',
  title: 'Riverbend Garden Center: pay stub, June 15 to 21',
  subtitle: 'Employee: Andre Wilson · Hourly · Paid weekly',
  rows: [
    { label: 'Hours worked', value: '40 hrs' },
    { label: 'Pay rate', value: '$15.00 per hour' },
    { label: 'Gross pay', value: '$600.00', strong: true },
    { label: 'Total deductions', value: '$87.90' },
    { label: 'Federal income tax', value: '$30.00', indent: true },
    { label: 'State income tax', value: '$12.00', indent: true },
    { label: 'Social Security (6.2%)', value: '$37.20', indent: true },
    { label: 'Medicare (1.45%)', value: '$8.70', indent: true },
    { label: 'Net pay', value: '$512.10', strong: true },
  ],
  note: 'Year-to-date (YTD) totals since January 1: gross $600.00 · net $512.10',
}

const andreLog: Doc = {
  kind: 'table',
  title: "Andre's hours log, June 22 to 28",
  rows: [
    { label: 'Monday', value: '8 hrs' },
    { label: 'Tuesday', value: '10 hrs' },
    { label: 'Wednesday', value: '8 hrs' },
    { label: 'Thursday', value: '10 hrs' },
    { label: 'Friday', value: '8 hrs' },
    { label: 'Total', value: '44 hrs', strong: true },
  ],
  note: 'Tuesday and Thursday: stayed late to unload deliveries.',
}

const andreWeek2: Doc = {
  kind: 'paystub',
  title: 'Riverbend Garden Center: pay stub, June 22 to 28',
  subtitle: 'Employee: Andre Wilson · Hourly · Paid weekly',
  rows: [
    { label: 'Regular hours', value: '40 hrs' },
    { label: 'Overtime hours', value: '0 hrs' },
    { label: 'Pay rate', value: '$15.00 per hour' },
    { label: 'Gross pay', value: '$600.00', strong: true },
    { label: 'Total deductions', value: '$87.90' },
    { label: 'Federal income tax', value: '$30.00', indent: true },
    { label: 'State income tax', value: '$12.00', indent: true },
    { label: 'Social Security (6.2%)', value: '$37.20', indent: true },
    { label: 'Medicare (1.45%)', value: '$8.70', indent: true },
    { label: 'Net pay', value: '$512.10', strong: true },
  ],
  note: 'Year-to-date (YTD) totals since January 1: gross $1,200.00 · net $1,024.20',
}

const andreW2: Doc = {
  kind: 'statement',
  title: 'Form W-2 summary: Riverbend Garden Center',
  subtitle: 'Employee: Andre Wilson · Last calendar year',
  rows: [
    { label: 'Box 1: Wages, tips, other compensation', value: '$6,090.00', strong: true },
    { label: 'Box 2: Federal income tax withheld', value: '$311.00', strong: true },
    { label: 'Box 3: Social Security wages', value: '$6,090.00' },
    { label: 'Box 4: Social Security tax withheld', value: '$377.58' },
    { label: 'Box 5: Medicare wages and tips', value: '$6,090.00' },
    { label: 'Box 6: Medicare tax withheld', value: '$88.31' },
  ],
  note: '10 weeks at $600, plus $90 of corrected overtime.',
}

const sofiaLog: Doc = {
  kind: 'table',
  title: "Sofia's lawn care log, May to August",
  subtitle: 'Self-employed · Paid by neighbors',
  rows: [
    { label: 'Mowing, 3 neighbors', value: '$540.00' },
    { label: 'Hedge trimming', value: '$110.00' },
    { label: 'Total income', value: '$650.00', strong: true },
    { label: 'Gas', value: '$62.00' },
    { label: 'Trimmer line and blades', value: '$28.00' },
    { label: 'Total costs', value: '$90.00', strong: true },
  ],
}

const quizStub: Doc = {
  kind: 'paystub',
  title: 'Brightwater Car Wash: pay stub, Sept 1 to 14',
  subtitle: 'Employee: Chris Nguyen · Hourly · Paid every two weeks',
  rows: [
    { label: 'Hours worked', value: '25 hrs' },
    { label: 'Pay rate', value: '$14.00 per hour' },
    { label: 'Gross pay', value: '$350.00', strong: true },
    { label: 'Total deductions', value: '$32.03' },
    { label: 'Federal income tax', value: '$0.00', indent: true },
    { label: 'State income tax', value: '$5.25', indent: true },
    { label: 'Social Security (6.2%)', value: '$21.70', indent: true },
    { label: 'Medicare (1.45%)', value: '$5.08', indent: true },
    { label: 'Net pay', value: '$317.97', strong: true },
  ],
}

const unit: Unit = {
  id: 't2-u1',
  tier: 2,
  order: 1,
  title: 'Your First Paycheck',
  tagline: 'Learn how pay is calculated, what comes out of a paycheck, and how to file taxes.',
  color: 'green',
  emoji: '💸',

  guidebook: {
    intro:
      'A first job comes with a pay stub, a few tax forms, and a lot of new terms. This unit explains how your pay is calculated, why the amount you take home is smaller than what you earned, and what to do when tax season comes.',
    keyIdeas: [
      {
        title: 'Hourly vs. salary',
        body: 'Hourly pay is your rate times the hours you work, and most hourly workers earn 1.5 times their rate for hours over 40 in a week. A salary is a set yearly amount divided into equal paychecks.',
      },
      {
        title: 'Minimum wage and tips',
        body: 'The federal minimum wage is $7.25 an hour. Many states and cities set higher minimums, and the highest one that applies is what you are owed. Under federal law, tipped workers can be paid $2.13 an hour, but tips must bring them to at least $7.25, or the employer pays the difference.',
      },
      {
        title: 'Gross vs. net',
        body: 'Gross pay is what you earned. Net pay is what reaches your account after deductions. Compare every pay stub with your own record of hours, and report mistakes right away.',
      },
      {
        title: 'Taxes on every paycheck',
        body: 'Federal income tax (and state income tax in most states) is withheld based on your W-4. FICA takes 7.65% for Social Security and Medicare, even if you owe no income tax. Your W-2 summarizes the year.',
      },
      {
        title: 'Filing, refunds, and gig work',
        body: 'Tax Day is usually April 15. If more was withheld than you owe, filing a return gets the extra back. Gig income counts even when no form arrives, and net self-employment earnings of $400 or more in a year mean you owe self-employment tax.',
      },
    ],
    funFacts: [
      'The federal minimum wage started at 25 cents an hour in 1938. It has been $7.25 since 2009.',
      `The word "salary" is often linked to salt in ancient Rome, but historians aren't sure Roman soldiers were ever paid in salt.`,
      'If you are paid every two weeks, you get 26 paychecks a year, so a couple of months each year have three paydays.',
      'FICA stands for the Federal Insurance Contributions Act, the law behind the Social Security and Medicare taxes on your pay stub.',
      'The US has had a permanent federal income tax since 1913, when the 16th Amendment was ratified.',
    ],
    words: [
      { term: 'Gross pay', meaning: 'Your pay before anything is taken out' },
      { term: 'Net pay', meaning: 'The pay that reaches your account' },
      { term: 'Deductions', meaning: 'Money taken out of gross pay, mostly taxes' },
      { term: 'Overtime', meaning: '1.5 times your rate for hours over 40 in a week' },
      { term: 'Withholding', meaning: 'Tax your employer takes out and sends in for you' },
      { term: 'FICA', meaning: 'Social Security (6.2%) plus Medicare (1.45%)' },
      { term: 'W-4', meaning: 'The form that tells your employer how much income tax to withhold' },
      { term: 'W-2', meaning: 'Your yearly wage and tax summary, sent by January 31' },
      { term: '1099-NEC', meaning: 'A form that reports freelance or contract income' },
      { term: 'Tax refund', meaning: 'Money back when more tax was withheld than you owed' },
    ],
  },

  lessons: [
    /* ---------- Lesson 1: Getting paid ---------- */
    {
      id: 't2-u1-l1',
      title: 'Getting Paid',
      description: 'Hourly pay, salary, overtime, minimum wage, and tips.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u1-l1-e1',
          emoji: '⏰',
          title: 'Hourly pay and salary',
          body: 'Most jobs pay in one of two ways.\n\n- **Hourly**: you earn a set rate for each hour you work, so your pay changes with your schedule.\n- **Salary**: you earn a set amount per year, divided into equal paychecks.\n\nPart-time jobs at stores, restaurants, and pools usually pay hourly.',
          example: 'At $14 an hour, a 15-hour week pays $210 before deductions. A $39,000 salary paid every two weeks is $1,500 per paycheck before deductions.',
        },
        {
          type: 'sort',
          id: 't2-u1-l1-e2',
          prompt: 'Hourly or salary? Sort each job detail.',
          buckets: ['Hourly', 'Salary'],
          items: [
            { text: '$15.50 an hour', bucket: 0 },
            { text: '$48,000 a year', bucket: 1 },
            { text: 'Pay rises with extra shifts', bucket: 0 },
            { text: 'Same amount each paycheck', bucket: 1 },
            { text: 'Paid for hours clocked in', bucket: 0 },
            { text: 'Set yearly amount', bucket: 1 },
          ],
          explain: 'Hourly pay depends on how many hours you work. A salary is one yearly figure split evenly across paychecks.',
        },
        {
          type: 'mc',
          id: 't2-u1-l1-e3',
          prompt: 'You have two summer job offers. Which one pays more per week before deductions?',
          doc: {
            kind: 'offer',
            title: 'Two summer job offers',
            subtitle: 'Both pay every two weeks',
            rows: [
              { label: 'Lakeside Cinema', value: 'Concessions', strong: true },
              { label: 'Pay rate', value: '$16.00 per hour', indent: true },
              { label: 'Scheduled hours', value: '12 per week', indent: true },
              { label: 'Hilltop Market', value: 'Cashier', strong: true },
              { label: 'Pay rate', value: '$14.00 per hour', indent: true },
              { label: 'Scheduled hours', value: '20 per week', indent: true },
            ],
          },
          choices: [
            { text: 'Hilltop Market, because of the extra hours', correct: true },
            {
              text: 'Lakeside Cinema, because $16 an hour is the higher rate',
              why: 'The rate is only half of it. Lakeside pays 12 × $16 = $192 a week, while Hilltop pays 20 × $14 = $280.',
            },
            {
              text: 'They pay about the same each week',
              why: 'The rates are close, but the hours are not. The difference is $88 a week.',
            },
          ],
          explain: 'For an hourly job, weekly pay is rate × hours. Hilltop pays 20 × $14 = $280 and Lakeside pays 12 × $16 = $192, so the lower rate pays $88 more each week.',
        },
        {
          type: 'teach',
          id: 't2-u1-l1-e4',
          emoji: '⏱️',
          title: 'Overtime',
          body: 'Under federal law, most hourly workers earn **overtime** for hours over 40 in a workweek. Overtime pays **1.5 times** your regular rate.\n\nOnly the hours past 40 get the higher rate. The first 40 hours are paid at your normal rate.',
          example: 'You earn $16 an hour and work 44 hours. The first 40 hours pay $640. The 4 extra hours pay $24 each, or $96. Total: $736.',
        },
        {
          type: 'mc',
          id: 't2-u1-l1-e5',
          prompt: 'Omar earns $12 an hour and works 45 hours in one week. Which calculation gives the right pay before deductions?',
          choices: [
            { text: '40 × $12, plus 5 × $18', correct: true },
            {
              text: '45 × $18',
              why: 'Overtime applies only to the hours over 40, not the whole week. This would overpay Omar by $240.',
            },
            {
              text: '45 × $12',
              why: 'This leaves out overtime. The 5 hours past 40 should pay 1.5 times the rate, so this comes up $30 short.',
            },
            {
              text: '40 × $12, plus 5 × $24',
              why: 'That pays the extra hours at double the rate. Overtime is 1.5 times the rate, which is $18 here.',
            },
          ],
          explain: '40 × $12 = $480, and 5 × $18 = $90, for a total of $570.',
        },
        {
          type: 'number',
          id: 't2-u1-l1-e6',
          prompt: 'You earn $14 an hour and work 42 hours this week. What is your pay before deductions?',
          answer: 602,
          prefix: '$',
          explain: 'The first 40 hours pay 40 × $14 = $560. Overtime is $14 × 1.5 = $21 an hour, so 2 hours add $42. Total: $602.',
        },
        {
          type: 'teach',
          id: 't2-u1-l1-e7',
          emoji: '🧱',
          title: 'Minimum wage',
          body: 'The **minimum wage** is the lowest hourly rate most employers can legally pay.\n\nThe federal minimum is **$7.25** an hour. Many states and cities set higher minimums. When more than one applies, you are owed the highest one.\n\nFor most non-farm jobs, you can start working at 14, with limits on your hours until you turn 16.',
          example: "If your city's minimum is $15 and the federal minimum is $7.25, most employers in your city must pay at least $15 an hour.",
        },
        {
          type: 'tf',
          id: 't2-u1-l1-e8',
          statement: "When a state's minimum wage is higher than $7.25, most employers in that state must pay the state minimum.",
          answer: true,
          explain: 'True. The federal minimum is a floor. When a state or city sets a higher one, workers there are owed the higher rate.',
        },
        {
          type: 'teach',
          id: 't2-u1-l1-e9',
          emoji: '🍽️',
          title: 'Tipped jobs',
          body: 'Servers, delivery drivers, and some other workers earn **tips** from customers.\n\nUnder federal law, an employer can pay tipped workers a cash wage as low as **$2.13** an hour, as long as wages plus tips reach at least $7.25 an hour. If tips fall short for the week, the employer must make up the difference.\n\nSome states require the full minimum wage before tips.',
        },
        {
          type: 'fill',
          id: 't2-u1-l1-e10',
          prompt: 'Complete the federal rule for tipped workers.',
          sentence: "A tipped worker's cash wage can be as low as ___ an hour, but wages plus tips must reach at least ___ an hour.",
          answers: ['$2.13', '$7.25'],
          bank: ['$7.25', '$5.12', '$2.13', '$15.00'],
          explain: 'The cash wage can be $2.13, and tips have to cover the $5.12 between that and $7.25. If they do not, the employer pays the gap.',
        },
        {
          type: 'scenario',
          id: 't2-u1-l1-e11',
          emoji: '🍕',
          setup: 'You deliver for Corner Oven Pizza at $2.13 an hour plus tips. In a slow week you work 20 hours and earn $50 in tips. Your wages plus tips come to $92.60, about $4.63 an hour.',
          question: 'What should you do?',
          choices: [
            {
              text: 'Ask your manager to review the week. You are owed at least $7.25 an hour.',
              best: true,
              outcome: 'Your manager checks the numbers and adds $52.40, which brings your pay for the week to $145, or $7.25 an hour.',
            },
            {
              text: 'Accept it. Slow weeks are part of working for tips.',
              outcome: 'You lose $52.40 that your employer is required to pay you for that week.',
            },
            {
              text: 'Pick up extra shifts next week to make up the difference',
              outcome: 'Next week is paid on its own. This week is still $52.40 short, and that money is owed to you now.',
            },
          ],
        },
      ],
    },

    /* ---------- Lesson 2: Gross vs. net & reading a pay stub (connected story) ---------- */
    {
      id: 't2-u1-l2',
      title: "Andre's Summer Paychecks",
      description: 'Follow one summer job from gross pay to net pay, and catch a payroll error.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u1-l2-e1',
          emoji: '🌱',
          title: 'Gross pay and net pay',
          body: 'Andre, 17, starts a summer job at Riverbend Garden Center. He earns $15 an hour, works 40 hours a week, and is paid every Friday.\n\n**Gross pay** is what he earns before anything is taken out. **Deductions**, mostly taxes, come out next. **Net pay** is what reaches his bank account.',
        },
        {
          type: 'number',
          id: 't2-u1-l2-e2',
          prompt: "What is Andre's gross pay for a 40-hour week?",
          answer: 600,
          prefix: '$',
          explain: '40 × $15 = $600. This is his pay before any deductions.',
        },
        {
          type: 'teach',
          id: 't2-u1-l2-e3',
          emoji: '🧾',
          title: 'Reading a pay stub',
          body: "Each paycheck comes with a **pay stub**. Read it from top to bottom:\n\n- Hours and rate: what you worked and what you earn per hour\n- Gross pay: hours × rate\n- Deductions: each tax, listed separately\n- Net pay: gross pay minus deductions\n- Year-to-date (YTD): your totals so far this year\n\nThis is Andre's first stub.",
          doc: andreWeek1,
        },
        {
          type: 'mc',
          id: 't2-u1-l2-e4',
          prompt: "How much of Andre's first paycheck reaches his bank account?",
          doc: andreWeek1,
          choices: [
            { text: '$512.10', correct: true },
            { text: '$600.00', why: 'That is his gross pay, before any taxes come out.' },
            {
              text: '$554.10',
              why: 'This subtracts only Social Security and Medicare. Federal and state income tax come out too.',
            },
            { text: '$87.90', why: 'That is the total of his deductions, the part that does not reach his account.' },
          ],
          explain: '$600.00 in gross pay minus $87.90 in deductions leaves $512.10 in net pay.',
        },
        {
          type: 'fill',
          id: 't2-u1-l2-e5',
          sentence: "Andre's ___ pay is $600.00, and his ___ pay is $512.10.",
          doc: andreWeek1,
          answers: ['gross', 'net'],
          bank: ['net', 'YTD', 'gross', 'overtime'],
          explain: 'Gross pay is the line before deductions. Net pay is what is left after them.',
        },
        {
          type: 'number',
          id: 't2-u1-l2-e6',
          prompt: 'How much did Andre pay in FICA (Social Security plus Medicare) this week?',
          doc: andreWeek1,
          answer: 45.9,
          tolerance: 0.01,
          prefix: '$',
          explain: '$37.20 + $8.70 = $45.90, which is 7.65% of his $600 gross pay.',
        },
        {
          type: 'tf',
          id: 't2-u1-l2-e7',
          statement: "Federal income tax is the largest deduction on Andre's stub.",
          doc: andreWeek1,
          answer: false,
          explain: 'False. Social Security, at $37.20, is larger than his $30.00 of federal income tax. Payroll taxes can be larger than income tax, especially on smaller paychecks.',
        },
        {
          type: 'teach',
          id: 't2-u1-l2-e8',
          emoji: '📋',
          title: 'Keep your own record',
          body: 'Payroll mistakes happen, so keep a record of every shift and compare it with each stub.\n\nIn his second week, Andre stayed late twice to unload deliveries. His log shows 44 hours. When his second stub arrives, he checks it against the log.',
          doc: andreLog,
        },
        {
          type: 'mc',
          id: 't2-u1-l2-e9',
          prompt: "Compare this stub with Andre's log, which shows 44 hours. What is wrong?",
          doc: andreWeek2,
          choices: [
            { text: 'The 4 overtime hours are missing', correct: true },
            {
              text: 'Nothing, because overtime is paid on a later stub',
              why: 'This stub covers June 22 to 28, the same week as his log. All 44 hours should appear on it.',
            },
            {
              text: 'His deductions are too high',
              why: 'His deductions match his first stub exactly, because his gross pay was the same. The problem is the hours.',
            },
            { text: 'His pay rate is wrong', why: 'The rate is still $15.00 per hour. The hours are what do not match.' },
          ],
          explain: 'His log shows 44 hours, but the stub shows 40 regular hours and 0 overtime hours. The 4 hours past 40 were never paid.',
        },
        {
          type: 'number',
          id: 't2-u1-l2-e10',
          prompt: 'The 4 missing hours were overtime. How much gross pay is Andre missing?',
          doc: andreWeek2,
          answer: 90,
          prefix: '$',
          explain: 'Overtime pays 1.5 × $15 = $22.50 an hour, and 4 × $22.50 = $90.',
        },
        {
          type: 'scenario',
          id: 't2-u1-l2-e11',
          emoji: '📋',
          setup: 'Andre is owed $90 in overtime. He has only worked there two weeks, and his manager seems busy. A coworker tells him payroll usually fixes things on its own.',
          question: 'What should Andre do?',
          doc: andreWeek2,
          choices: [
            {
              text: 'Show his manager the log and ask to have the pay corrected',
              best: true,
              outcome: 'Payroll checks the time records and adds the $90 to his next paycheck.',
            },
            {
              text: 'Say nothing, since bringing it up as a new employee feels awkward',
              outcome: 'Payroll has no reason to look at that week again, so the $90 he earned is never paid.',
            },
            {
              text: 'Wait a few weeks to see if the money shows up',
              outcome: 'Nothing changes. Weeks later he still has to report it, and now the mistake is older and harder to sort out.',
            },
          ],
        },
        {
          type: 'mc',
          id: 't2-u1-l2-e12',
          prompt: "Payroll adds the $90 to Andre's next paycheck. How much more will his net pay be?",
          choices: [
            { text: 'A little less than $90, because taxes come out of it too', correct: true },
            {
              text: 'Exactly $90, because it is a correction',
              why: 'Corrected wages are still wages. Social Security and Medicare are taken from the $90 like any other pay.',
            },
            {
              text: 'Nothing until his W-2 arrives in January',
              why: 'A W-2 only summarizes the year. Missing pay is added to a paycheck.',
            },
          ],
          explain: 'At least 7.65% of the $90 goes to Social Security and Medicare, so his net pay rises by a little less than $90.',
        },
        {
          type: 'mc',
          id: 't2-u1-l2-e13',
          prompt: "Andre's second stub shows a YTD gross of $1,200.00. What does that number mean?",
          doc: andreWeek2,
          choices: [
            { text: 'His total gross pay so far this year', correct: true },
            { text: 'His take-home pay so far this year', why: 'That is YTD net, $1,024.20. YTD gross is before deductions.' },
            {
              text: 'What he is on track to earn by the end of the year',
              why: 'YTD looks back, not ahead. It adds up the paychecks he has already received.',
            },
            {
              text: 'His gross pay for this week',
              why: 'This week is $600.00. YTD adds this week to every earlier paycheck this year.',
            },
          ],
          explain: 'Year-to-date totals grow with every paycheck. After two weeks at $600, his YTD gross is $1,200.',
        },
      ],
    },

    /* ---------- Lesson 3: Taxes 101 ---------- */
    {
      id: 't2-u1-l3',
      title: 'Taxes 101',
      description: 'Income tax, brackets, FICA, and the W-4 and W-2.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u1-l3-e1',
          emoji: '🏛️',
          title: 'Income tax and withholding',
          body: '**Income tax** is tax on what you earn. The federal government collects it, and so do most states. A few states have no state income tax.\n\nYou do not pay it all at once. Your employer **withholds** an estimate from each paycheck and sends it to the government for you. Income tax helps pay for things like national parks, the military, and disaster relief.',
        },
        {
          type: 'mc',
          id: 't2-u1-l3-e2',
          prompt: 'What does it mean when your employer withholds income tax?',
          choices: [
            { text: 'They send part of each paycheck to the government for you', correct: true },
            {
              text: 'They keep part of your pay until the end of the year',
              why: 'The money goes to the government, not to a fund at your job. You may get some back as a refund, but only by filing a tax return.',
            },
            {
              text: 'You pay all your income tax yourself each April',
              why: 'For employees, tax is taken out throughout the year. April is when you settle any difference.',
            },
            {
              text: 'The government takes tax directly from your bank account',
              why: 'The tax comes out before your pay reaches you. Your employer handles it through payroll.',
            },
          ],
          explain: 'Withholding spreads your income tax across the year. Your employer takes it out of each paycheck and sends it in for you.',
        },
        {
          type: 'teach',
          id: 't2-u1-l3-e3',
          emoji: '🪜',
          title: 'How tax brackets work',
          body: 'Federal income tax uses **brackets**, layers of income taxed at different rates.\n\nFor most people, the first part of yearly income is not taxed at all (the IRS updates that amount every year). The next dollars are taxed at a low rate, and only dollars above each cutoff are taxed at the next rate.\n\nMoving into a higher bracket raises the rate only on the extra dollars.',
        },
        {
          type: 'tf',
          id: 't2-u1-l3-e4',
          statement: 'If a raise moves you into a higher tax bracket, all of your income is taxed at the higher rate.',
          answer: false,
          explain: 'False. Only the dollars above the cutoff are taxed at the higher rate. Everything below it is taxed the same as before, so a raise still leaves you with more money after tax.',
        },
        {
          type: 'mc',
          id: 't2-u1-l3-e5',
          prompt: 'Imagine a simple tax system: 10% on the first $10,000 of taxable income and 12% on anything above that. How much tax is owed on $12,000?',
          choices: [
            { text: '$1,240', correct: true },
            { text: '$1,440', why: 'That taxes all $12,000 at 12%. The first $10,000 stays at 10%.' },
            { text: '$1,200', why: 'That taxes everything at 10%. The $2,000 above the cutoff is taxed at 12%.' },
            { text: '$240', why: 'That is only the tax on the top $2,000. The first $10,000 is taxed too, at 10%.' },
          ],
          explain: '10% of $10,000 is $1,000, and 12% of the remaining $2,000 is $240, for $1,240 in total. Real brackets have more layers, and the IRS adjusts them every year.',
        },
        {
          type: 'teach',
          id: 't2-u1-l3-e6',
          emoji: '📊',
          title: 'FICA: Social Security and Medicare',
          body: "Almost every paycheck also has **FICA** taken out:\n\n- Social Security: 6.2%, for retirement and disability benefits\n- Medicare: 1.45%, for health coverage, mostly for people 65 and older\n\nThat is **7.65%** in total, and it comes out even if you owe no income tax. Your employer pays a matching 7.65%. Find both lines on Andre's stub.",
          doc: andreWeek1,
        },
        {
          type: 'number',
          id: 't2-u1-l3-e7',
          prompt: 'You earn $300 gross this week. How much comes out for FICA at 7.65%?',
          answer: 22.95,
          tolerance: 0.01,
          prefix: '$',
          explain: '7.65% of $100 is $7.65, so 7.65% of $300 is 3 × $7.65 = $22.95.',
        },
        {
          type: 'teach',
          id: 't2-u1-l3-e8',
          emoji: '📄',
          title: 'W-4 and W-2',
          body: 'These two forms have similar names and opposite purposes.\n\n- **W-4**: you fill it out when you start a job. It tells your employer how much income tax to withhold.\n- **W-2**: your employer sends it after the year ends, by January 31. It shows what you earned and what was withheld.\n\nYou need your W-2 to file your tax return.',
          example: 'The W-4 goes from you to your employer at the start. The W-2 comes from your employer to you after the year is over.',
        },
        {
          type: 'scenario',
          id: 't2-u1-l3-e9',
          emoji: '📝',
          setup: "It's your first day at Maple Street Bakery. Your manager hands you a W-4 and asks for it back by the end of your shift. Some of the questions are confusing.",
          question: 'What is the best approach?',
          choices: [
            {
              text: 'Read the instructions, ask a parent, or use the IRS withholding estimator',
              best: true,
              outcome: 'The form is filled out correctly, so your paychecks withhold close to the right amount.',
            },
            {
              text: 'Copy the answers from a friend who works there',
              outcome: "Your friend's situation may not match yours, so your withholding could be too high or too low.",
            },
            {
              text: 'Fill it out quickly and guess on the confusing parts',
              outcome: 'Your withholding may be off all year. You can ask to fill out a new W-4 once you understand it.',
            },
          ],
        },
        {
          type: 'sort',
          id: 't2-u1-l3-e10',
          prompt: 'W-4 or W-2? Sort each description.',
          buckets: ['W-4', 'W-2'],
          items: [
            { text: 'Filled out when you start', bucket: 0 },
            { text: 'Sets your withholding', bucket: 0 },
            { text: 'Goes from you to employer', bucket: 0 },
            { text: 'Arrives by January 31', bucket: 1 },
            { text: 'Shows your yearly wages', bucket: 1 },
            { text: 'Needed to file your return', bucket: 1 },
          ],
          explain: 'The W-4 sets up withholding at the start of a job. The W-2 reports the results after the year ends.',
        },
      ],
    },

    /* ---------- Lesson 4: Filing taxes, refunds & gig work ---------- */
    {
      id: 't2-u1-l4',
      title: 'Tax Returns and Gig Income',
      description: 'Filing a return, getting a refund, and taxes on self-employment income.',
      exercises: [
        {
          type: 'teach',
          id: 't2-u1-l4-e1',
          emoji: '📬',
          title: 'Filing a tax return',
          body: 'Each spring, you file a **tax return** for the money you earned the year before. The main federal form is the **1040**.\n\nThe return compares the tax you actually owe with the tax already withheld, using your W-2 and any other income records. **Tax Day** is usually April 15.',
        },
        {
          type: 'mc',
          id: 't2-u1-l4-e2',
          prompt: 'You file a tax return in April. Which income does it cover?',
          choices: [
            { text: 'All of your income from the previous calendar year', correct: true },
            {
              text: 'Your income from the past 12 months, up to the day you file',
              why: "A return covers January through December of last year. Money earned since January 1 goes on next year's return.",
            },
            {
              text: 'Only income from jobs that sent you a W-2',
              why: 'Gig and freelance income count too, even when no form arrives.',
            },
          ],
          explain: 'A return looks back at one full calendar year. In April, you settle up for the year that just ended.',
        },
        {
          type: 'teach',
          id: 't2-u1-l4-e3',
          emoji: '📨',
          title: 'Refund or amount owed',
          body: 'Withholding is an estimate, figured as if each paycheck were typical of your whole year.\n\n- If more was withheld than you owe, the extra comes back as a **refund**.\n- If less was withheld, you pay the difference.\n\nAndre worked 10 weeks at Riverbend. His wages were low enough that he owes $0 in federal income tax. Here is his W-2.',
          doc: andreW2,
        },
        {
          type: 'number',
          id: 't2-u1-l4-e4',
          prompt: 'Andre owes $0 in federal income tax for the year. If he files a return, how big is his federal refund?',
          doc: andreW2,
          answer: 311,
          prefix: '$',
          explain: 'He owes nothing, so the full $311 in Box 2 comes back. His withholding was figured as if he would earn about $600 a week all year, but he worked only 10 weeks.',
        },
        {
          type: 'tf',
          id: 't2-u1-l4-e5',
          statement: 'Filing a return will also get Andre back the $377.58 of Social Security tax on his W-2.',
          doc: andreW2,
          answer: false,
          explain: 'False. The refund is for income tax withheld beyond what he owes. Social Security and Medicare taxes are not refunded just because his income was low.',
        },
        {
          type: 'mc',
          id: 't2-u1-l4-e6',
          prompt: 'Andre earned little enough that he is not required to file. What happens if he does not file?',
          doc: andreW2,
          choices: [
            { text: 'He does not get the $311 back', correct: true },
            {
              text: 'The IRS mails the $311 automatically, since it has his W-2',
              why: 'The IRS sends a refund only after you file a return that claims it.',
            },
            {
              text: 'His employer returns the $311 on a future paycheck',
              why: 'His employer already sent that money to the IRS. Only a tax return can get it back.',
            },
            {
              text: 'He owes a penalty for not filing',
              why: 'He was not required to file, so there is no penalty. He just gives up money that was his.',
            },
          ],
          explain: 'Filing is how you claim a refund. You generally have three years to claim it, but filing by Tax Day is simplest.',
        },
        {
          type: 'number',
          id: 't2-u1-l4-e7',
          prompt: 'Imani had $200 of federal income tax withheld this year. Her return shows she owes $260. How much does she still need to pay?',
          answer: 60,
          prefix: '$',
          explain: '$260 owed minus $200 already withheld leaves $60 to pay by Tax Day.',
        },
        {
          type: 'teach',
          id: 't2-u1-l4-e8',
          emoji: '🧰',
          title: 'Self-employment income',
          body: 'Mowing lawns, walking dogs, tutoring, or editing videos for clients is **self-employment**. No employer withholds tax, so you track your income and set money aside yourself.\n\nA business that pays you may send a **1099-NEC**. Either way, the income counts.\n\nOnce your **net earnings** (income minus business costs) reach **$400** in a year, you owe self-employment tax and must file a return.',
        },
        {
          type: 'number',
          id: 't2-u1-l4-e9',
          prompt: "What are Sofia's net earnings from her lawn care work?",
          doc: sofiaLog,
          answer: 560,
          prefix: '$',
          explain: '$650 in income minus $90 in costs is $560. That is above $400, so she owes self-employment tax and must file a return.',
        },
        {
          type: 'teach',
          id: 't2-u1-l4-e10',
          emoji: '📊',
          title: 'Self-employment tax',
          body: 'Employees split Social Security and Medicare with their employer, 7.65% each.\n\nWhen you work for yourself, no employer pays the other half. **Self-employment tax** is **15.3%**, both halves together.\n\nThat is why people with gig income set aside part of every payment for taxes.',
        },
        {
          type: 'mc',
          id: 't2-u1-l4-e11',
          prompt: 'Sofia has $560 in net earnings. Why should she save part of each payment during the summer?',
          doc: sofiaLog,
          choices: [
            { text: 'No one withholds tax from her earnings, so she pays it herself', correct: true },
            {
              text: 'Her customers will withhold tax and send it in',
              why: 'Neighbors who hire her for yard work do not withhold tax. That is her responsibility.',
            },
            {
              text: 'She only owes tax if a customer sends her a 1099-NEC',
              why: 'Income counts with or without the form. Neighbors paying for yard work usually do not send one.',
            },
            {
              text: 'Self-employment tax applies only to adults',
              why: 'There is no age exception. The $400 rule applies to teens too.',
            },
          ],
          explain: 'Employees have tax taken out automatically. Self-employed workers do not, so setting money aside keeps a tax bill from catching them short in April.',
        },
        {
          type: 'sort',
          id: 't2-u1-l4-e12',
          prompt: 'Employee or self-employed? Sort each description.',
          buckets: ['Employee', 'Self-employed'],
          items: [
            { text: 'Tax withheld from each check', bucket: 0 },
            { text: 'Receives a W-2', bucket: 0 },
            { text: 'Grocery store cashier', bucket: 0 },
            { text: 'Sets aside own tax money', bucket: 1 },
            { text: 'Walks dogs for neighbors', bucket: 1 },
            { text: 'Freelance video editing', bucket: 1 },
            { text: 'Might receive a 1099-NEC', bucket: 1 },
          ],
          explain: 'Employees have tax handled through payroll and get a W-2. Self-employed workers keep their own records and pay their own tax.',
        },
        {
          type: 'tf',
          id: 't2-u1-l4-e13',
          statement: 'Cash payments for gig work do not need to be reported as income.',
          answer: false,
          explain: 'False. Income counts whether it is paid in cash, by app, or by check, and whether or not a form arrives.',
        },
        {
          type: 'scenario',
          id: 't2-u1-l4-e14',
          emoji: '🐕',
          setup: 'You start walking dogs after school and earn about $100 a week. Your cousin says teens do not need to worry about taxes on side jobs.',
          question: 'What is the best plan?',
          choices: [
            {
              text: 'Track income and costs, and set aside part of each payment',
              best: true,
              outcome: 'At tax time you have your records and the money to pay what you owe.',
            },
            {
              text: 'Spend it now and figure out taxes in April',
              outcome: 'At $100 a week, you pass the $400 line quickly. The tax bill arrives after the money is spent.',
            },
            {
              text: 'Ask for cash only so the income is not counted',
              outcome: 'Cash income still counts. Leaving it off your return is against the law and can lead to penalties.',
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
        id: 't2-u1-q-e1',
        prompt: 'One job pays $15 an hour for 18 hours a week. Another pays $17 an hour for 14 hours a week. Which pays more each week before deductions?',
        choices: [
          { text: 'The $15 job, because of the extra hours', correct: true },
          {
            text: 'The $17 job, because its hourly rate is higher',
            why: 'The rate alone does not decide it. 14 × $17 = $238, while 18 × $15 = $270.',
          },
          {
            text: 'They pay the same, since the extra hours make up for the lower rate',
            why: 'The extra hours more than make up for it. The $15 job pays $32 more each week.',
          },
        ],
        explain: 'Weekly pay for an hourly job is rate × hours: 18 × $15 = $270 and 14 × $17 = $238. Compare the weekly totals, not just the rates.',
      },
      {
        type: 'number',
        id: 't2-u1-q-e2',
        prompt: 'You earn $10 an hour and work 46 hours in one week. Hours over 40 pay 1.5 times your rate. What is your gross pay?',
        answer: 490,
        prefix: '$',
        explain: '40 × $10 = $400. Overtime is $15 an hour, and 6 × $15 = $90. Total: $490.',
      },
      {
        type: 'tf',
        id: 't2-u1-q-e3',
        statement: "Under federal law, if a tipped worker's wages plus tips fall below $7.25 an hour for the week, the employer must make up the difference.",
        answer: true,
        explain: 'True. The $2.13 cash wage is allowed only when tips bring the total up to at least $7.25 an hour.',
      },
      {
        type: 'mc',
        id: 't2-u1-q-e4',
        prompt: 'What is the net pay on this stub?',
        doc: quizStub,
        choices: [
          { text: '$317.97', correct: true },
          { text: '$350.00', why: 'That is gross pay, before deductions.' },
          {
            text: '$323.22',
            why: 'That subtracts Social Security and Medicare but leaves out the $5.25 of state income tax.',
          },
          { text: '$32.03', why: 'That is the total taken out, not the amount paid to the worker.' },
        ],
        explain: '$350.00 in gross pay minus $32.03 in deductions leaves $317.97.',
      },
      {
        type: 'tf',
        id: 't2-u1-q-e5',
        statement: 'Because federal income tax is $0.00 on this stub, no taxes were taken out of this paycheck.',
        doc: quizStub,
        answer: false,
        explain: 'False. $32.03 was still taken out for Social Security, Medicare, and state income tax. FICA applies even when no federal income tax is withheld.',
      },
      {
        type: 'number',
        id: 't2-u1-q-e6',
        prompt: 'You earn $400 gross. How much comes out for FICA at 7.65%?',
        answer: 30.6,
        tolerance: 0.01,
        prefix: '$',
        explain: '7.65% of $100 is $7.65, so 7.65% of $400 is 4 × $7.65 = $30.60.',
      },
      {
        type: 'mc',
        id: 't2-u1-q-e7',
        prompt: "In January, your employer sends you a form showing last year's wages and the taxes withheld. Which form is it?",
        choices: [
          { text: 'W-2', correct: true },
          { text: 'W-4', why: 'The W-4 is the form you fill out when you start a job, to set your withholding.' },
          { text: '1099-NEC', why: 'A 1099-NEC reports payments for freelance or contract work, not wages from an employer.' },
          { text: '1040', why: 'The 1040 is the tax return you file. The W-2 gives you numbers to put on it.' },
        ],
        explain: 'The W-2 summarizes a year of wages and withholding. Employers send it by January 31.',
      },
      {
        type: 'tf',
        id: 't2-u1-q-e8',
        statement: 'A raise that moves you into a higher tax bracket can leave you with less money after taxes.',
        answer: false,
        explain: 'False. Only the dollars above the bracket cutoff are taxed at the higher rate, so a raise still increases your pay after tax.',
      },
      {
        type: 'mc',
        id: 't2-u1-q-e9',
        prompt: 'When does a teen with gig income owe self-employment tax?',
        choices: [
          { text: 'When net earnings from self-employment reach $400 in a year', correct: true },
          {
            text: 'When total gig income reaches $400, before subtracting costs',
            why: 'The $400 line uses net earnings, which is income minus business costs.',
          },
          { text: 'Only when a client sends a 1099-NEC', why: 'The income counts whether or not a form arrives.' },
          { text: 'Only after turning 18', why: 'There is no age exception. The $400 rule applies to teens too.' },
        ],
        explain: 'Self-employment tax is based on net earnings. Once they reach $400 in a year, you owe it and must file a return.',
      },
      {
        type: 'scenario',
        id: 't2-u1-q-e10',
        emoji: '🧾',
        setup: 'You earned $3,000 at a part-time job last year and owe no federal income tax. Your W-2 shows $150 of federal income tax was withheld.',
        question: 'What should you do?',
        choices: [
          {
            text: 'File a tax return to claim the $150',
            best: true,
            outcome: 'Your return shows you owed $0, so the full $150 is refunded.',
          },
          {
            text: 'Skip filing, since you were not required to file',
            outcome: 'There is no penalty, but you give up the $150 that was withheld from your pay.',
          },
          {
            text: 'Wait for the IRS to send the $150 automatically',
            outcome: 'The IRS does not send a refund until you file a return that claims it.',
          },
          {
            text: 'Ask your employer to pay back the $150',
            outcome: 'Your employer already sent it to the IRS. Only a tax return can get it back.',
          },
        ],
      },
    ],
  },
}

export default unit
