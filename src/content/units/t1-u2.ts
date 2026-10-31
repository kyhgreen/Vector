import type { Doc, Unit } from '../types'

/* ---------- Documents (repeated on each exercise that uses them) ---------- */

const avaPlan: Doc = {
  kind: 'table',
  title: "Ava's plan for Saturday",
  subtitle: 'Money she has: $30',
  rows: [
    { label: 'Savings jar', value: '$10' },
    { label: 'Arcade with friends', value: '$15' },
    { label: 'Snacks', value: '$8' },
    { label: 'Bus fare (there and back)', value: '$4' },
    { label: 'Total planned', value: '$37', strong: true },
  ],
}

const mateoPlan: Doc = {
  kind: 'table',
  title: "Mateo's plan for October",
  subtitle: 'Money in: $80 from allowance and chores',
  rows: [
    { label: 'Needs (bus card, school snacks)', value: '$16' },
    { label: 'Wants', value: '$24' },
    { label: 'Savings', value: '$40' },
    { label: 'Total', value: '$80', strong: true },
  ],
}

const kenjiLog: Doc = {
  kind: 'table',
  title: "Kenji's spending log: one week",
  subtitle: 'Each purchase is labeled with a category',
  rows: [
    { label: 'Mon: smoothie (snacks)', value: '$4' },
    { label: 'Tue: game coins (games)', value: '$5' },
    { label: 'Wed: smoothie (snacks)', value: '$4' },
    { label: 'Thu: chips (snacks)', value: '$2' },
    { label: 'Fri: smoothie (snacks)', value: '$4' },
    { label: 'Sat: movie with friends (going out)', value: '$10' },
    { label: 'Sun: game coins (games)', value: '$5' },
    { label: 'Total', value: '$34', strong: true },
  ],
}

const kenjiCompare: Doc = {
  kind: 'table',
  title: "Kenji's week: plan vs. spent",
  subtitle: 'He gets $40 a week. Plan: spend $30, save $10.',
  rows: [
    { label: 'Snacks', value: 'Plan $8 · Spent $14' },
    { label: 'Games', value: 'Plan $10 · Spent $10' },
    { label: 'Going out', value: 'Plan $12 · Spent $10' },
    { label: 'Total spending', value: 'Plan $30 · Spent $34', strong: true },
  ],
}

const nadiaFirstList: Doc = {
  kind: 'table',
  title: "Nadia's sleepover: first cost list",
  subtitle: 'Money she has: $50',
  rows: [
    { label: '2 large pizzas (delivery)', value: '$25' },
    { label: 'Bakery cake', value: '$12' },
    { label: 'Snacks and drinks', value: '$8' },
    { label: 'Movie rental', value: '$4' },
    { label: 'Total', value: '$49', strong: true },
  ],
}

const pizzaCheckout: Doc = {
  kind: 'receipt',
  title: 'Slice Street Pizza: checkout',
  subtitle: 'Delivery order for Nadia',
  rows: [
    { label: '2 large cheese pizzas', value: '$25.00' },
    { label: 'Sales tax (8%)', value: '$2.00' },
    { label: 'Delivery fee', value: '$3.00' },
    { label: 'Total', value: '$30.00', strong: true },
  ],
  note: 'Pickup orders have no delivery fee.',
}

const nadiaNewPlan: Doc = {
  kind: 'table',
  title: "Nadia's sleepover: new plan",
  subtitle: 'Money she has: $50',
  rows: [
    { label: '2 large pizzas (pickup, with tax)', value: '$27' },
    { label: 'Homemade cupcakes', value: '$6' },
    { label: 'Snacks and drinks', value: '$8' },
    { label: 'Movie rental', value: '$4' },
    { label: 'Cushion', value: '$5' },
    { label: 'Total', value: '$50', strong: true },
  ],
}

const marketReceipt: Doc = {
  kind: 'receipt',
  title: 'Maple Lane Market: receipt',
  subtitle: 'Cupcake supplies, snacks, and drinks',
  rows: [
    { label: 'Cupcake mix', value: '$3.50' },
    { label: 'Frosting', value: '$2.50' },
    { label: 'Chips (2 bags)', value: '$4.00' },
    { label: 'Lemonade (2 bottles)', value: '$4.00' },
    { label: 'Subtotal', value: '$14.00' },
    { label: 'Sales tax (8%)', value: '$1.12' },
    { label: 'Total', value: '$15.12', strong: true },
  ],
}

const taraCompare: Doc = {
  kind: 'table',
  title: "Tara's two weeks: plan vs. spent",
  rows: [
    { label: 'Food with friends', value: 'Plan $10 · Spent $16' },
    { label: 'Games', value: 'Plan $8 · Spent $8' },
    { label: 'Gifts', value: 'Plan $12 · Spent $10' },
    { label: 'Total', value: 'Plan $30 · Spent $34', strong: true },
  ],
}

const unit: Unit = {
  id: 't1-u2',
  tier: 1,
  order: 2,
  title: 'Budgeting Basics',
  tagline: 'Plan your money, track your spending, and budget for a goal.',
  color: 'blue',
  emoji: '📊',

  guidebook: {
    intro:
      'A budget is a plan for the money you have, made before you spend it. In this unit you will build simple budgets, try the 50/30/20 rule, track your spending, and plan for something bigger, like a party or a new bike.',
    keyIdeas: [
      {
        title: 'A budget is made ahead of time',
        body: "Write down the money coming in, then decide where it will go before you spend any of it. The plan can't add up to more than you have.",
      },
      {
        title: '50/30/20 is a starting point',
        body: "Needs 50%, wants 30%, savings 20%. It's a guideline, not a law. If your family covers most of your needs, you can move more into savings.",
      },
      {
        title: 'Track what you actually spend',
        body: 'Write down every purchase, even the small ones. Small purchases that repeat are the easiest to forget, and together they can cost more than one big purchase.',
      },
      {
        title: 'Compare your plan with real life',
        body: 'Once a week, put your plan next to your spending log. If a category went over, decide what to change for the rest of the month.',
      },
      {
        title: 'Big plans need their own budget',
        body: 'List every cost, including sales tax, shipping, and fees, and add a small cushion. If the total is too high, cut something, choose a cheaper option, or save longer.',
      },
    ],
    funFacts: [
      'The word budget comes from the old French word bougette, which means a small bag or pouch.',
      'The 50/30/20 rule became well known through a 2005 book about money written by a mother and her daughter.',
      'Before budgeting apps, many people used the envelope method: cash for each category went in its own labeled envelope, and when an envelope was empty, spending in that category stopped.',
      '$3 a day adds up to $1,095 in a year.',
      'Alaska, Delaware, Montana, New Hampshire, and Oregon have no statewide sales tax, though some towns there (especially in Alaska) add their own.',
      "The U.S. government's budget year starts on October 1, not January 1.",
    ],
    words: [
      { term: 'Budget', meaning: 'A plan for your money, made before you spend' },
      { term: 'Income', meaning: 'Money coming in' },
      { term: 'Expense', meaning: 'Money going out' },
      { term: 'Needs', meaning: 'Things you must have, like school lunch' },
      { term: 'Wants', meaning: 'Things you enjoy but could skip' },
      { term: 'Savings', meaning: 'Money you keep for later' },
      { term: 'Spending log', meaning: 'A list of what you bought and what it cost' },
      { term: 'Category', meaning: 'A group of similar purchases, like snacks' },
      { term: 'Sales tax', meaning: 'Money added to the price at checkout' },
      { term: 'Cushion', meaning: 'A few extra dollars planned for surprises' },
    ],
  },

  lessons: [
    /* ---------- Lesson 1: What is a budget? (9) ---------- */
    {
      id: 't1-u2-l1',
      title: 'What is a budget?',
      description: 'Make a plan for your money before you spend it.',
      exercises: [
        {
          type: 'teach',
          id: 't1-u2-l1-e1',
          emoji: '📝',
          title: 'A budget is a plan',
          body: 'A **budget** is a plan for your money that you make **before** you spend it.\n\nFirst, write down how much money you have. Then decide how much goes to each thing: saving, things you need, and things you enjoy. When you go to spend, the decisions are already made.',
          example: 'Your grandma gives you $20 for your birthday. Your plan: $10 into savings, $6 for a movie ticket, $4 for popcorn. That is a budget.',
        },
        {
          type: 'mc',
          id: 't1-u2-l1-e2',
          prompt: 'You have $20 to last until next week. Which of these is a budget?',
          choices: [
            { text: 'Before Friday: $8 for a movie, $4 for snacks, $8 saved', correct: true },
            {
              text: 'A list of what you bought last weekend',
              why: "That's a record of past spending. It's useful, but a budget is made before you spend.",
            },
            {
              text: 'Checking that you have $20 in your wallet',
              why: 'Knowing how much you have is the first step. A budget also decides where that money will go.',
            },
            {
              text: "Deciding you'll spend less than last week",
              why: 'That is a good goal, but it has no amounts. A budget says how much goes to each thing.',
            },
          ],
          explain: 'A budget is made ahead of time and uses real amounts. $8 + $4 + $8 = $20, so all $20 is planned.',
        },
        {
          type: 'tf',
          id: 't1-u2-l1-e3',
          statement: "A budget means you can't spend any money on fun.",
          answer: false,
          explain: "A good budget usually includes money for fun. Planning it ahead makes sure fun spending doesn't use up money you meant for something else.",
        },
        {
          type: 'teach',
          id: 't1-u2-l1-e4',
          emoji: '🔄',
          title: 'Money in, money out',
          body: "Every budget has two sides:\n- **Income** is money coming in, like allowance, birthday money, or pay for walking a neighbor's dog\n- **Expenses** are money going out, like snacks, a movie ticket, or a gift for a friend\n\nA budget works when your expenses are not bigger than your income.",
        },
        {
          type: 'sort',
          id: 't1-u2-l1-e5',
          prompt: 'Is each one income or an expense?',
          buckets: ['Income', 'Expenses'],
          items: [
            { text: 'Weekly allowance', bucket: 0 },
            { text: 'Birthday money from an aunt', bucket: 0 },
            { text: 'Pay for raking leaves', bucket: 0 },
            { text: 'Selling your old books', bucket: 0 },
            { text: 'Movie ticket', bucket: 1 },
            { text: 'New phone case', bucket: 1 },
            { text: 'Gift for a friend', bucket: 1 },
          ],
          explain: 'Income is any money that comes to you, even a one-time amount like selling old books. Expenses are money that leaves you, including gifts you buy for other people.',
        },
        {
          type: 'teach',
          id: 't1-u2-l1-e6',
          emoji: '🧩',
          title: 'The plan has to fit',
          body: "A budget has one firm rule: the plan can't add up to more than the money you have.\n\nTo check, add up every line and compare the total with your money. If the total is bigger, something in the plan won't happen, so fix it now.\n\nAva has $30 for Saturday. Here is her first plan.",
          doc: avaPlan,
        },
        {
          type: 'number',
          id: 't1-u2-l1-e7',
          prompt: "How many dollars over her $30 is Ava's plan?",
          answer: 7,
          prefix: '$',
          explain: '$10 + $15 + $8 + $4 = $37. $37 minus $30 is $7, so her plan is $7 over.',
          doc: avaPlan,
        },
        {
          type: 'mc',
          id: 't1-u2-l1-e8',
          prompt: "Which change makes Ava's plan fit her $30?",
          choices: [
            { text: 'Cut the arcade to $10 and snacks to $5', correct: true },
            {
              text: 'Cut snacks to $5',
              why: 'That saves $3, but the plan is $7 over. The total would still be $34.',
            },
            {
              text: 'Skip the bus fare',
              why: 'Bus fare is how she gets there and back, and the total would still be $33.',
            },
            {
              text: 'Move $7 from savings to the arcade',
              why: 'Moving money between lines does not change the total. It would still be $37.',
            },
          ],
          explain: '$10 + $10 + $5 + $4 = $29. That fits her $30 with $1 left over, and she still saves, goes to the arcade, and gets home.',
          doc: avaPlan,
        },
        {
          type: 'scenario',
          id: 't1-u2-l1-e9',
          emoji: '🎧',
          setup: "You just got $25 for your birthday. Your friends are going to the arcade on Saturday, which usually costs about $10. You're also saving for new headphones.",
          question: 'What do you do with the $25?',
          choices: [
            {
              text: 'Plan $10 for the arcade and put $15 toward headphones',
              best: true,
              outcome: 'You enjoy Saturday with your friends, and your headphone savings grows by $15.',
            },
            {
              text: 'Bring all $25 to the arcade and see how it goes',
              outcome: 'Without a limit, games and snacks add up. You come home with $6, and the headphones are further away.',
            },
            {
              text: 'Put all $25 toward headphones and skip the arcade',
              outcome: 'Your savings grows faster, but you miss a day with friends that you could have afforded. A budget can include both.',
            },
          ],
        },
      ],
    },

    /* ---------- Lesson 2: The 50/30/20 rule (10) ---------- */
    {
      id: 't1-u2-l2',
      title: 'The 50/30/20 rule',
      description: 'Split money into needs, wants, and savings.',
      exercises: [
        {
          type: 'teach',
          id: 't1-u2-l2-e1',
          emoji: '🥧',
          title: 'Meet the 50/30/20 rule',
          body: "The **50/30/20 rule** is one simple way to split money:\n- 50% for **needs**, the things you must have\n- 30% for **wants**, things you enjoy but could skip\n- 20% for **savings**, money you keep for later\n\nIt's a starting point, and you can adjust it. You'll see how later in this lesson.",
        },
        {
          type: 'match',
          id: 't1-u2-l2-e2',
          prompt: 'Match each share to where the money goes.',
          pairs: [
            { left: '50%', right: 'Needs, the must-haves' },
            { left: '30%', right: 'Wants, the extras' },
            { left: '20%', right: 'Savings, money for later' },
          ],
          explain: 'Needs get half, wants get 30%, and savings gets 20%. Together they make 100%.',
        },
        {
          type: 'teach',
          id: 't1-u2-l2-e3',
          emoji: '🧮',
          title: 'Percent math without a calculator',
          body: '**50%** is half.\n\n**10%** is easy too. Move the decimal point one place to the left: 10% of $60.00 is $6.00.\n\nOnce you know 10%, you can build the others. 30% is three times 10%, and 20% is two times 10%.',
          example: '$60 from chores: needs $30, wants $18, savings $12. Check: $30 + $18 + $12 = $60.',
        },
        {
          type: 'number',
          id: 't1-u2-l2-e4',
          prompt: 'You earn $40 mowing lawns this month. Using 50/30/20, how many dollars go to savings?',
          answer: 8,
          prefix: '$',
          explain: '10% of $40 is $4. Savings is 20%, which is two times that: $8.',
        },
        {
          type: 'mc',
          id: 't1-u2-l2-e5',
          prompt: 'You get $50 for your birthday. Using 50/30/20, how much goes to wants?',
          choices: [
            { text: '$15', correct: true },
            {
              text: '$30',
              why: '30 is the percent, not the dollar amount. 30% of $50 is three times $5, which is $15.',
            },
            { text: '$25', why: "That's half of $50, which is the needs share." },
            { text: '$10', why: "That's 20% of $50, which is the savings share." },
          ],
          explain: '10% of $50 is $5. Wants get 30%, so 3 × $5 = $15.',
        },
        {
          type: 'sort',
          id: 't1-u2-l2-e6',
          prompt: 'Which share does each one belong in?',
          buckets: ['Needs', 'Wants', 'Savings'],
          items: [
            { text: 'Bus fare to school', bucket: 0 },
            { text: 'Lunch on school days', bucket: 0 },
            { text: 'Concert ticket', bucket: 1 },
            { text: 'New game skin', bucket: 1 },
            { text: 'Brand-name sneakers', bucket: 1 },
            { text: 'Money for a bike fund', bucket: 2 },
            { text: 'Deposit into savings', bucket: 2 },
          ],
          explain: 'Bus fare and lunch get you through the school day. Shoes can be a need, but paying extra for a brand name is a want. Money set aside for later is savings.',
        },
        {
          type: 'teach',
          id: 't1-u2-l2-e7',
          emoji: '🔧',
          title: 'Adjust it to fit your life',
          body: "The 50/30/20 rule was made for adults who pay for things like rent and groceries. If your family covers most of your needs, your needs share might be much smaller than 50%.\n\nThat's fine. The rule is a **guideline**, not a law. Mateo's family pays for most of his needs, so he moved the extra into savings.",
          doc: mateoPlan,
        },
        {
          type: 'number',
          id: 't1-u2-l2-e8',
          prompt: 'What percent of his $80 is Mateo putting into savings?',
          answer: 50,
          suffix: '%',
          explain: '$40 is half of $80, so Mateo saves 50%. His needs take only 20%, so he moved the difference into savings.',
          doc: mateoPlan,
        },
        {
          type: 'tf',
          id: 't1-u2-l2-e9',
          statement: "Mateo's plan is a bad budget because it doesn't match 50/30/20.",
          answer: false,
          explain: 'His plan fits his money, covers his needs, includes money for fun, and saves a lot. That is a good budget, even with different percents.',
          doc: mateoPlan,
        },
        {
          type: 'scenario',
          id: 't1-u2-l2-e10',
          emoji: '🎮',
          setup: "You split this month's $60 of chore money using 50/30/20. It's only the 15th, and your $18 for wants is already spent. A game skin you like goes on sale for $10.",
          question: "What's the best move?",
          choices: [
            {
              text: "Wait for next month's wants money",
              best: true,
              outcome: 'You might miss this sale, but your savings and bus money stay on track.',
            },
            {
              text: 'Take $10 from your savings',
              outcome: 'You get the skin, but your savings drops by $10. If this happens every month, your savings goal keeps moving further away.',
            },
            {
              text: 'Use $10 of your bus fare money',
              outcome: "You get the skin, but you can't pay for the bus later this month. Needs come first in a budget.",
            },
            {
              text: 'Borrow $10 from a friend and pay it back next month',
              outcome: 'Next month starts with $10 of your $18 for wants already spent.',
            },
          ],
        },
      ],
    },

    /* ---------- Lesson 3: Tracking your spending (12) ---------- */
    {
      id: 't1-u2-l3',
      title: 'Tracking your spending',
      description: 'Write down what you spend and compare it with your plan.',
      exercises: [
        {
          type: 'teach',
          id: 't1-u2-l3-e1',
          emoji: '📒',
          title: 'Write it down',
          body: '**Tracking** means writing down each purchase: what you bought and how much it cost. The list is your **spending log**.\n\nA notebook works, and so does a notes app. Keep receipts, the slips you get when you pay, to fill in anything you forget. It also helps to label each purchase with a **category**, a group like snacks, games, or going out.',
          example: 'Mon: $3 slushie (snacks). Wed: $5 game coins (games). Fri: $8 pizza with friends (going out). Week total: $16.',
        },
        {
          type: 'mc',
          id: 't1-u2-l3-e2',
          prompt: 'You already have a budget. Why track your spending too?',
          choices: [
            { text: 'To see if your real spending matches the plan', correct: true },
            {
              text: 'So you never have to make a budget again',
              why: 'Tracking and budgeting work together. The budget is the plan, and the log shows what really happened.',
            },
            {
              text: 'To find out how much money you have to spend',
              why: 'You work that out when you make the budget. Tracking shows where the money actually went.',
            },
            {
              text: 'To keep a record of only the big purchases',
              why: 'Big purchases are easy to remember. Tracking is most useful for the small ones you forget.',
            },
          ],
          explain: 'Your budget is the plan, and your log shows what actually happened. Comparing the two tells you what to change.',
        },
        {
          type: 'tf',
          id: 't1-u2-l3-e3',
          statement: 'A $2 snack is too small to bother writing down.',
          answer: false,
          explain: 'Small purchases are the easiest to forget. A $2 snack every day adds up to about $60 a month.',
        },
        {
          type: 'teach',
          id: 't1-u2-l3-e4',
          emoji: '🔁',
          title: 'Small purchases add up',
          body: 'Some purchases are small but happen often: a drink after school, a snack from the vending machine, a few coins in a game.\n\nEach one is easy to forget. Together, they can become one of your biggest expenses. To find the real cost, multiply the price by how often you buy it.',
          example: 'A $3 smoothie every school day: $3 × 5 = $15 a week. Over 4 weeks, that is $60.',
        },
        {
          type: 'number',
          id: 't1-u2-l3-e5',
          prompt: 'You buy a $4 iced drink every school day (5 days a week). How much is that in one week?',
          answer: 20,
          prefix: '$',
          explain: '$4 × 5 = $20 a week. Over 4 weeks, that would be $80.',
        },
        {
          type: 'mc',
          id: 't1-u2-l3-e6',
          prompt: 'Here is one week of Kenji\'s spending log. Which category cost him the most?',
          choices: [
            { text: 'Snacks', correct: true },
            {
              text: 'Going out',
              why: 'The $10 movie was the biggest single purchase, but snacks happened four times: $4 + $4 + $2 + $4 = $14.',
            },
            {
              text: 'Games',
              why: 'Games came to $5 + $5 = $10. Snacks were higher at $14.',
            },
          ],
          explain: 'Snacks: $14. Games: $10. Going out: $10. A small purchase that repeats can cost more than one big purchase.',
          doc: kenjiLog,
        },
        {
          type: 'teach',
          id: 't1-u2-l3-e7',
          emoji: '⚖️',
          title: 'Compare your plan with real life',
          body: 'Tracking is most useful when you put it next to your budget. Once a week, compare what you planned for each category with what you actually spent.\n\nIf a category went over, that money came from somewhere else in your plan. Kenji gets $40 a week. He planned to spend $30 and save $10.',
          doc: kenjiCompare,
        },
        {
          type: 'number',
          id: 't1-u2-l3-e8',
          prompt: 'How many dollars over his snack plan did Kenji go?',
          answer: 6,
          prefix: '$',
          explain: 'He planned $8 and spent $14. $14 minus $8 is $6 over.',
          doc: kenjiCompare,
        },
        {
          type: 'tf',
          id: 't1-u2-l3-e9',
          statement: 'Kenji spent $34 of his $40, so he saved only $6 this week instead of $10.',
          answer: true,
          explain: '$40 minus $34 is $6. The extra snack spending came out of the money he meant to save.',
          doc: kenjiCompare,
        },
        {
          type: 'mc',
          id: 't1-u2-l3-e10',
          prompt: "What's the best change for Kenji's next week?",
          choices: [
            { text: 'Keep snacks at $8 and bring snacks from home some days', correct: true },
            {
              text: 'Raise the snack plan to $14 and leave the rest the same',
              why: 'Then his spending plan would be $36, and he would save only $4. Raising one line means lowering another.',
            },
            {
              text: "Stop writing down snacks, since they're small",
              why: 'The log is what showed the problem. Without it, the extra $6 would be easy to miss.',
            },
          ],
          explain: 'Bringing snacks from home a few days a week can bring snacks back to about $8 without changing the rest of his plan.',
          doc: kenjiCompare,
        },
        {
          type: 'teach',
          id: 't1-u2-l3-e11',
          emoji: '✉️',
          funFact: true,
          title: 'The envelope method',
          body: 'Before budgeting apps, many people used **envelopes**. They put cash for each category in its own labeled envelope: groceries in one, gas in another, fun money in a third.\n\nWhen an envelope was empty, spending in that category stopped until the next payday. Some people still budget this way today.',
        },
        {
          type: 'scenario',
          id: 't1-u2-l3-e12',
          emoji: '🍫',
          setup: 'You planned $20 for fun this month. On the 15th, your spending log shows $17 already spent, mostly on vending machine snacks.',
          question: 'What do you do now?',
          choices: [
            {
              text: 'Bring snacks from home and make the last $3 last',
              best: true,
              outcome: 'You finish the month on plan. Next month, you might plan a little more for snacks and a little less for something else.',
            },
            {
              text: 'Stop checking the log until next month',
              outcome: "Not looking doesn't slow the spending. Your fun money runs out around the 20th.",
            },
            {
              text: 'Keep buying snacks and cover the extra from savings',
              outcome: 'You keep the snacks, but your savings shrinks. If savings always covers the extra, the plan stops working.',
            },
            {
              text: 'Keep buying snacks as usual and stop when the $3 is gone',
              outcome: 'The $3 is gone in a day or two. For the rest of the month, every snack breaks the plan.',
            },
          ],
        },
      ],
    },

    /* ---------- Lesson 4: Budgeting for a goal or event (14, connected story) ---------- */
    {
      id: 't1-u2-l4',
      title: 'Budgeting for big plans',
      description: 'Follow Nadia as she plans a birthday sleepover with $50.',
      exercises: [
        {
          type: 'teach',
          id: 't1-u2-l4-e1',
          emoji: '🎉',
          title: 'Nadia plans a sleepover',
          body: 'A big plan, like a party, a trip, or a new bike, needs its own budget:\n- List every cost\n- Add them up\n- Compare the total with the money you have\n\nNadia is planning a birthday sleepover for herself and four friends. She saved $50 for it. Here is her first cost list.',
          doc: nadiaFirstList,
        },
        {
          type: 'number',
          id: 't1-u2-l4-e2',
          prompt: 'If these were the only costs, how much of her $50 would Nadia have left?',
          answer: 1,
          prefix: '$',
          explain: "$25 + $12 + $8 + $4 = $49. $50 minus $49 leaves $1. That's very little room if anything costs more than expected.",
          doc: nadiaFirstList,
        },
        {
          type: 'teach',
          id: 't1-u2-l4-e3',
          emoji: '🔍',
          title: "Costs that aren't on the price tag",
          body: 'The price you see first is not always what you pay. Watch for:\n- **Sales tax**, added at checkout in most states\n- Delivery and shipping fees\n- Service fees on tickets\n\nIt also helps to add a **cushion**: a few extra dollars in your plan for costs you did not expect.',
        },
        {
          type: 'tf',
          id: 't1-u2-l4-e4',
          statement: "Nadia's list says $25 for pizza, so the delivery order will cost exactly $25.",
          answer: false,
          explain: 'Delivery orders often add a fee, and most states add sales tax. The checkout screen shows the real total before you pay.',
        },
        {
          type: 'number',
          id: 't1-u2-l4-e5',
          prompt: 'Nadia reaches the checkout screen. How much more is the real total than the $25 on her list?',
          answer: 5,
          prefix: '$',
          explain: '$30 minus $25 is $5: $2 of sales tax plus a $3 delivery fee.',
          doc: pizzaCheckout,
        },
        {
          type: 'teach',
          id: 't1-u2-l4-e6',
          emoji: '🗺️',
          funFact: true,
          title: 'Five states, no statewide sales tax',
          body: "Alaska, Delaware, Montana, New Hampshire, and Oregon don't have a statewide sales tax.\n\nSome towns there, especially in Alaska, add their own local sales tax. So how much tax you pay depends on where you shop.",
        },
        {
          type: 'number',
          id: 't1-u2-l4-e7',
          prompt: 'Her first list totaled $49, with $25 for pizza. The real pizza total is $30. What is her new total?',
          answer: 54,
          prefix: '$',
          explain: 'The pizza costs $5 more than she planned, so $49 + $5 = $54. That is $4 more than the $50 she has.',
          doc: nadiaFirstList,
        },
        {
          type: 'teach',
          id: 't1-u2-l4-e8',
          emoji: '✂️',
          title: 'Over budget? Fix the plan',
          body: 'When a plan costs more than you have, you are **over budget**. You have three main choices:\n- Cut something you can do without\n- Swap something for a cheaper choice\n- Wait and save more\n\nEach choice gives up something: an item, a nicer version, or time. You decide which one matters least to you.',
        },
        {
          type: 'fill',
          id: 't1-u2-l4-e9',
          sentence: 'When a plan is over budget, you can ___ an item, swap it for a ___ choice, or wait and save more.',
          answers: ['cut', 'cheaper'],
          bank: ['cut', 'cheaper', 'add', 'nicer', 'bigger'],
          explain: 'Cutting an item or choosing a cheaper version brings the total down. Adding items or picking nicer ones would make the gap bigger.',
        },
        {
          type: 'mc',
          id: 't1-u2-l4-e10',
          prompt: 'Her plan is now $54, and she has $50. Which fix fits her money and leaves a cushion?',
          choices: [
            { text: 'Pick up the pizza and make $6 cupcakes instead of the cake', correct: true },
            {
              text: 'Pick up the pizza instead of getting delivery',
              why: "That saves the $3 delivery fee, but $54 minus $3 is $51. She'd still be $1 over.",
            },
            {
              text: 'Skip the $4 movie rental',
              why: 'That brings the plan to exactly $50, with nothing left for surprises.',
            },
            {
              text: 'Ask her parents to cover the extra $4',
              why: "They might say yes, but the plan was meant to fit her $50. It's better to fix the plan first.",
            },
          ],
          explain: 'Pickup saves the $3 fee, and the cupcakes cost $6 less than the $12 cake. $54 minus $3 minus $6 is $45, which leaves $5 for a cushion.',
          doc: pizzaCheckout,
        },
        {
          type: 'tf',
          id: 't1-u2-l4-e11',
          statement: "Nadia's new plan adds up to all $50, so nothing is set aside for surprises.",
          answer: false,
          explain: '$5 of the $50 is a cushion. It is in the plan on purpose, to cover costs she did not expect.',
          doc: nadiaNewPlan,
        },
        {
          type: 'scenario',
          id: 't1-u2-l4-e12',
          emoji: '🛒',
          setup: 'At Maple Lane Market, Nadia\'s cart of cupcake supplies, snacks, and drinks comes to $14 before tax. She sees glow sticks for $4. She brought $19: $14 for these items plus her $5 cushion.',
          question: 'What should Nadia do?',
          choices: [
            {
              text: 'Skip the glow sticks and keep the cushion for surprises',
              best: true,
              outcome: 'Tax adds a little at the register, and her cushion covers it with money to spare.',
            },
            {
              text: 'Buy them, since $14 + $4 = $18 is less than $19',
              outcome: "With 8% sales tax, the total is $19.44. She's 44 cents short and has to put something back.",
            },
            {
              text: 'Buy them and put the lemonade back',
              outcome: 'Her total stays at $14 before tax, but now there is nothing to drink at the party. She gave up something she planned for an extra.',
            },
          ],
        },
        {
          type: 'mc',
          id: 't1-u2-l4-e13',
          prompt: 'Nadia planned $14 for these items. Why does her receipt say $15.12?',
          choices: [
            { text: 'Sales tax was added at checkout', correct: true },
            {
              text: 'The store charged a delivery fee',
              why: "She shopped in person, so there's no delivery fee. Look for the tax line.",
            },
            {
              text: "She bought something that wasn't on her list",
              why: 'The items match her plan: $6 of cupcake supplies and $8 of snacks and drinks.',
            },
            {
              text: 'The prices were higher than she wrote down',
              why: 'The subtotal is exactly $14, so her prices were right. The extra was added after the subtotal.',
            },
          ],
          explain: 'The subtotal matches her plan. The $1.12 of sales tax was added on top, which is the kind of cost a cushion is for.',
          doc: marketReceipt,
        },
        {
          type: 'number',
          id: 't1-u2-l4-e14',
          prompt: "How much of Nadia's $5 cushion is left after this trip?",
          answer: 3.88,
          prefix: '$',
          explain: 'The tax used $1.12 of the cushion. $5.00 minus $1.12 is $3.88 left.',
          doc: marketReceipt,
        },
      ],
    },
  ],

  /* ---------- Unit quiz ---------- */
  quiz: {
    passPercent: 70,
    exercises: [
      {
        type: 'mc',
        id: 't1-u2-q-e1',
        prompt: 'Riley has $25 for the weekend. Which plan is a budget that fits?',
        choices: [
          { text: '$10 saved, $9 for a movie, $6 for snacks', correct: true },
          {
            text: '$10 saved, $12 for a movie, $6 for snacks',
            why: "Add it up: $10 + $12 + $6 = $28. That's $3 more than Riley has.",
          },
          {
            text: "Spend on what comes up, then save what's left",
            why: 'This has no amounts, so there is no way to check that it fits. Savings that comes last is easy to skip.',
          },
          {
            text: 'Write down everything after the weekend',
            why: "That's tracking, which is useful, but it happens after spending. A budget is made before.",
          },
        ],
        explain: '$10 + $9 + $6 = $25. The plan is made ahead of time and fits Riley\'s money exactly.',
      },
      {
        type: 'match',
        id: 't1-u2-q-e2',
        prompt: 'Match each money word to its meaning.',
        pairs: [
          { left: 'Income', right: 'Money that comes in' },
          { left: 'Expense', right: 'Money that goes out' },
          { left: 'Budget', right: 'A plan made before spending' },
          { left: 'Category', right: 'A group of similar purchases' },
          { left: 'Cushion', right: 'Extra money planned for surprises' },
        ],
        explain: 'Income comes in and expenses go out. A budget plans both, categories group your purchases, and a cushion covers costs you missed.',
      },
      {
        type: 'number',
        id: 't1-u2-q-e3',
        prompt: 'You earn $80 babysitting and split it 50/30/20. How many dollars go to savings?',
        answer: 16,
        prefix: '$',
        explain: '10% of $80 is $8, so 20% is two times that: $16.',
      },
      {
        type: 'mc',
        id: 't1-u2-q-e4',
        prompt: 'Jordan earned $120 this summer and split it using 50/30/20. Which split is right?',
        choices: [
          { text: 'Needs $60, wants $36, savings $24', correct: true },
          {
            text: 'Needs $50, wants $30, savings $20',
            why: 'Those are the percents, not dollar amounts. They add up to $100, so $20 of the $120 is left out.',
          },
          {
            text: 'Needs $60, wants $40, savings $20',
            why: '$40 is one third of $120, which is a little more than 30%. 10% of $120 is $12, so 30% is $36 and 20% is $24.',
          },
          {
            text: 'Needs $60, wants $24, savings $36',
            why: 'The amounts are right, but wants and savings are swapped. Wants get 30%, and savings gets 20%.',
          },
        ],
        explain: '10% of $120 is $12. Needs get half ($60), wants get 3 × $12 = $36, and savings gets 2 × $12 = $24. Check: $60 + $36 + $24 = $120.',
      },
      {
        type: 'sort',
        id: 't1-u2-q-e5',
        prompt: 'Needs, wants, or savings? Sort each one.',
        buckets: ['Needs', 'Wants', 'Savings'],
        items: [
          { text: 'Winter coat', bucket: 0 },
          { text: 'School supplies', bucket: 0 },
          { text: 'Concert T-shirt', bucket: 1 },
          { text: 'Movie tickets', bucket: 1 },
          { text: 'Saving for summer camp', bucket: 2 },
          { text: 'Bike fund deposit', bucket: 2 },
        ],
        explain: 'A coat and school supplies are must-haves. A concert shirt and movie tickets are extras. Money set aside for a later goal is savings.',
      },
      {
        type: 'tf',
        id: 't1-u2-q-e6',
        statement: 'Checking your spending log once a week can help you catch small purchases that are adding up.',
        answer: true,
        explain: 'A weekly check shows which small purchases are piling up while there is still time to change the rest of the month.',
      },
      {
        type: 'number',
        id: 't1-u2-q-e7',
        prompt: 'You buy a $2 candy bar every school day (5 days a week). How much is that in 4 weeks?',
        answer: 40,
        prefix: '$',
        explain: '$2 × 5 = $10 a week, and $10 × 4 weeks = $40.',
      },
      {
        type: 'mc',
        id: 't1-u2-q-e8',
        prompt: 'Tara compared her plan with her spending log. Which line went over plan, and by how much?',
        choices: [
          { text: 'Food with friends, by $6', correct: true },
          {
            text: 'The total, by $6',
            why: 'The total went over by $34 minus $30, which is $4. Food was $6 over, but gifts came in $2 under.',
          },
          {
            text: 'Gifts, by $2',
            why: 'Gifts cost $2 less than planned. That is under the plan, not over.',
          },
          {
            text: 'Games, because it used all its money',
            why: 'Spending exactly what you planned is on target, not over.',
          },
        ],
        explain: 'Food with friends: $16 spent minus $10 planned is $6 over. That is the line to look at first.',
        doc: taraCompare,
      },
      {
        type: 'mc',
        id: 't1-u2-q-e9',
        prompt: "You're budgeting for a $90 bike. What else belongs on your cost list?",
        choices: [
          { text: 'Sales tax, a helmet, and a lock', correct: true },
          {
            text: 'Nothing, since $90 is the price',
            why: "The tag is only part of it. Most states add sales tax, and you'll need a helmet to ride safely and a lock to keep the bike.",
          },
          {
            text: 'Only sales tax',
            why: "Tax belongs on the list, but so do the helmet and lock you'll need to use the bike.",
          },
          {
            text: 'Only a helmet and a lock',
            why: 'Those belong on the list, but most states also add sales tax at checkout.',
          },
        ],
        explain: 'A full cost list includes the price, the tax, and the extra things you need to use what you buy.',
      },
      {
        type: 'scenario',
        id: 't1-u2-q-e10',
        emoji: '🎁',
        setup: 'You have $40 to buy holiday gifts for 4 family members, and sales tax where you live is 8%. At the first store, you see a $25 sweater your mom would love.',
        question: "What's the best plan?",
        choices: [
          {
            text: 'Plan all four gifts first, about $9 each before tax',
            best: true,
            outcome: 'Four $9 gifts cost $38.88 with tax, so everyone gets a gift and you stay under $40.',
          },
          {
            text: 'Plan exactly $10 per gift',
            outcome: 'With tax, four $10 gifts cost $43.20. You come up short on the last gift.',
          },
          {
            text: "Buy the sweater, then split what's left",
            outcome: 'The sweater costs $27 with tax. That leaves $13 for three gifts, including tax.',
          },
        ],
      },
    ],
  },
}

export default unit
