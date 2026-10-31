import type { Unit } from "../types"

const unit: Unit = {
  id: "t1-u3",
  tier: 1,
  order: 3,
  title: "Saving Up",
  tagline: "Set saving goals, save before you spend, and get ready for surprise costs.",
  color: "teal",
  emoji: "🐷",

  guidebook: {
    intro:
      "Saving means setting money aside now so you can use it later. This unit covers why people save, how to save before you spend, how to figure out how long a goal will take, and how to get ready for costs you don't see coming.",
    keyIdeas: [
      {
        title: "Why save",
        body: "Saving lets you buy things your weekly money can't cover. It also gives you a cushion when something breaks or gets lost.",
      },
      {
        title: "Short-term and long-term goals",
        body: "A short-term goal is less than a year away, like a game or a gift. A long-term goal is a year or more away, like a car or college. Bigger goals usually take longer, so starting early helps.",
      },
      {
        title: "Pay yourself first",
        body: "Move your savings to a separate place as soon as money comes in, then spend what's left. Waiting to save whatever is left at the end of the week usually means saving very little.",
      },
      {
        title: "Goal math",
        body: "Subtract what you've already saved from the price, then divide by what you save each week. Round up to a whole week. With a deadline, divide the amount you need by the number of weeks to find your weekly amount.",
      },
      {
        title: "Emergency funds",
        body: "An emergency fund is money kept only for surprise costs you need to pay. A teen can start with a goal of $100 to $500. Adults aim for 3 to 6 months of expenses. When you use it, refill it.",
      },
    ],
    funFacts: [
      "Gray squirrels bury nuts to eat later and never dig some of them back up. Some of those forgotten acorns can grow into trees.",
      "A camel's hump stores fat, not water. A camel can use that fat for energy when food is hard to find.",
      "In the famous marshmallow test, kids could eat one treat right away or get two if they waited. Later studies found kids waited longer when they trusted the adult to keep the promise.",
      "A 1920s book, \"The Richest Man in Babylon,\" told readers to keep at least one of every ten coins they earned. That is saving 10%.",
      "The German verb \"hamstern\" means to stockpile. It comes from the hamster, which carries food in its cheeks to store for later.",
      "Saving a quarter a day for a year (365 days) adds up to $91.25.",
    ],
    words: [
      { term: "Saving", meaning: "Setting money aside now to use later." },
      { term: "Goal", meaning: "The thing you are saving for." },
      { term: "Short-term goal", meaning: "A goal less than a year away." },
      { term: "Long-term goal", meaning: "A goal a year or more away." },
      { term: "Pay yourself first", meaning: "Moving money to savings before you spend any." },
      { term: "Head start", meaning: "Money you have already saved toward a goal." },
      { term: "Percent (%)", meaning: "Out of every 100. For example, 10% of $20 is $2." },
      { term: "Surprise expense", meaning: "A cost you didn't plan for." },
      { term: "Emergency fund", meaning: "Money kept only for surprise costs." },
    ],
  },

  lessons: [
    /* ---------------- Lesson 1: Why save? (9 exercises) ---------------- */
    {
      id: "t1-u3-l1",
      title: "Why Save?",
      description: "Why people save, and how to tell short-term goals from long-term ones.",
      exercises: [
        {
          type: "teach",
          id: "t1-u3-l1-e1",
          emoji: "🐷",
          title: "What saving means",
          body: "**Saving** means keeping some of your money now so you can use it later.\n\nSaving doesn't mean you never spend. It means waiting so you can afford something bigger than your weekly money covers, or pay for a cost you didn't expect.",
          example: "You get $10 a week and want a $50 skateboard. If you save the full $10 each week, you can buy it in 5 weeks.",
        },
        {
          type: "mc",
          id: "t1-u3-l1-e2",
          prompt: "Why do people save instead of spending all their money right away?",
          choices: [
            {
              text: "Cash kept in a drawer slowly grows over time",
              why: "Cash in a drawer stays the same: $20 in, $20 out. Some bank accounts pay interest, but a drawer doesn't.",
            },
            { text: "To afford bigger things later and handle surprise costs", correct: true },
            {
              text: "Saving only matters once you have a real job",
              why: "You can save any amount, including allowance and gift money. Starting small now builds the habit.",
            },
            {
              text: "Once money is saved, it should never be spent",
              why: "Saved money is meant to be used for the goal you saved it for. Buying that goal is the point.",
            },
          ],
          explain: "Saving lets small amounts add up to something bigger. It also means a broken charger or a lost library book doesn't use up all your spending money.",
        },
        {
          type: "tf",
          id: "t1-u3-l1-e3",
          statement: "Saving only makes sense if you have a lot of money.",
          answer: false,
          explain: "Small amounts add up. Saving $5 a week gives you $260 after a year (52 weeks).",
        },
        {
          type: "teach",
          id: "t1-u3-l1-e4",
          emoji: "🎯",
          title: "Short-term and long-term goals",
          body: "A **goal** is the thing you're saving for. Goals are often sorted by how far away they are:\n\n- **Short-term:** less than a year away, like a new game or a friend's gift\n- **Long-term:** a year or more away, like a car or college\n\nBigger goals usually take longer. Starting early means you can save a smaller amount each week.",
          example: "Concert tickets next month are a short-term goal. A first car in four years is a long-term goal.",
        },
        {
          type: "sort",
          id: "t1-u3-l1-e5",
          prompt: "Short-term or long-term? Sort these goals.",
          buckets: ["Short-term", "Long-term"],
          items: [
            { text: "Pizza night this Friday", bucket: 0 },
            { text: "A car in four years", bucket: 1 },
            { text: "$300 bike in 2 months", bucket: 0 },
            { text: "College after high school", bucket: 1 },
            { text: "Summer camp in 3 months", bucket: 0 },
            { text: "A trip in two years", bucket: 1 },
          ],
          explain: "Sort by time, not by price. Less than a year away is short-term, even for a $300 bike. A year or more away is long-term.",
        },
        {
          type: "mc",
          id: "t1-u3-l1-e6",
          prompt: "Jordan saves $5 every week for a laptop he wants in 2 years. What kind of goal is the laptop?",
          choices: [
            {
              text: "Short-term, because he saves every week",
              why: "How often he saves doesn't decide the type. The laptop is 2 years away, which makes it long-term.",
            },
            { text: "Long-term", correct: true },
            {
              text: "Short-term, because $5 is a small amount",
              why: "The weekly amount doesn't decide the type either. What matters is when he wants the laptop.",
            },
          ],
          explain: "A goal a year or more away is long-term. Jordan's laptop is 2 years away.",
        },
        {
          type: "teach",
          id: "t1-u3-l1-e7",
          emoji: "🍬",
          funFact: true,
          title: "The marshmallow test",
          body: "Decades ago, Stanford researchers offered kids one treat right away, or two treats if they could wait a while.\n\nWaiting was hard. Some kids covered their eyes or sang songs to distract themselves.\n\nLater studies found that kids waited longer when they **trusted** the adult to bring the second treat. Waiting is easier when you believe the plan will work.",
        },
        {
          type: "fill",
          id: "t1-u3-l1-e8",
          prompt: "Finish the sentences.",
          sentence: "Bigger goals usually take ___ to save for. Starting ___ means you can save less each week.",
          answers: ["longer", "earlier"],
          bank: ["longer", "shorter", "earlier", "later"],
          explain: "A $300 goal takes longer than a $30 goal. If you start early, you have more weeks to save, so each week's amount can be smaller.",
        },
        {
          type: "scenario",
          id: "t1-u3-l1-e9",
          emoji: "🎂",
          setup: "You just got $25 for your birthday. You're saving for a $60 game. A friend texts to ask if you want to go to the arcade this afternoon.",
          question: "What's the best plan for the $25?",
          choices: [
            {
              text: "Bring all $25 to the arcade",
              outcome: "You have a fun afternoon and win enough tickets for an eraser. The game is still $60 away.",
            },
            {
              text: "Put $20 toward the game and bring $5",
              best: true,
              outcome: "You still go to the arcade, and the game is now $40 away.",
            },
            {
              text: "Save $5 and bring $20 to the arcade",
              outcome: "You have more to spend at the arcade, but the game is still $55 away.",
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 2: Pay yourself first (11 exercises) ---------------- */
    {
      id: "t1-u3-l2",
      title: "Pay Yourself First",
      description: "Set aside savings as soon as money comes in, before you spend.",
      exercises: [
        {
          type: "teach",
          id: "t1-u3-l2-e1",
          emoji: "🫙",
          title: "Pay yourself first",
          body: "Many people spend first and plan to save whatever is left. Often, nothing is left.\n\n**Pay yourself first** means the opposite. As soon as money comes in, you move your savings to a separate place. Then you spend the rest without worrying about it.",
          example: "You earn $20 walking dogs. Before you spend anything, you put $4 in your savings jar. The other $16 is yours to spend.",
        },
        {
          type: "mc",
          id: "t1-u3-l2-e2",
          prompt: "What does \"pay yourself first\" mean?",
          choices: [
            {
              text: "Buy something for yourself before anything else",
              why: "It sounds like that, but \"yourself\" here means your savings. The first money goes into savings, not to a treat.",
            },
            {
              text: "Save whatever is left at the end of the week",
              why: "That's saving last. By the end of the week, there is often little or nothing left.",
            },
            { text: "Set aside savings as soon as you get money", correct: true },
          ],
          explain: "Savings come first and spending comes second. You have the same money either way, but you end up saving more.",
        },
        {
          type: "teach",
          id: "t1-u3-l2-e3",
          emoji: "📜",
          title: "Pick a percent",
          body: "You can pay yourself first with any amount. Many people pick a **percent**, which means \"out of every 100,\" and save that share every time.\n\n- 10%: divide by 10\n- 20%: double the 10%\n- 25%: divide by 4\n- 50%: divide by 2",
          example: "You earn $30. 10% is $3, 20% is $6, and 50% is $15. A 1920s book, \"The Richest Man in Babylon,\" suggested keeping at least one of every ten coins you earn. That's 10%.",
        },
        {
          type: "number",
          id: "t1-u3-l2-e4",
          prompt: "You earn $40 mowing a lawn. You pay yourself first with 10%. How many dollars go into savings?",
          answer: 4,
          prefix: "$",
          explain: "10% of $40 is $40 ÷ 10 = $4. You save $4 and have $36 to spend.",
        },
        {
          type: "number",
          id: "t1-u3-l2-e5",
          prompt: "Marcus saves 20% of what he earns before he spends any. How many dollars go into savings this week?",
          answer: 6,
          prefix: "$",
          explain: "Marcus earned $30. 10% of $30 is $3, and 20% is double that: $6. That leaves him $24 to spend.",
          doc: {
            kind: "table",
            title: "Marcus's dog-walking log",
            subtitle: "Week of October 5",
            rows: [
              { label: "Monday", value: "$8.00" },
              { label: "Wednesday", value: "$8.00" },
              { label: "Saturday", value: "$14.00" },
              { label: "Total earned", value: "$30.00", strong: true },
            ],
          },
        },
        {
          type: "mc",
          id: "t1-u3-l2-e6",
          prompt: "After saving his 20%, Marcus sees a board game he likes for $25. What's true?",
          choices: [
            { text: "He's $1 short, so he waits or picks something cheaper", correct: true },
            {
              text: "He can buy it, since he earned $30 this week",
              why: "He did earn $30, but $6 already went to savings. He has $24 to spend, which is $1 short.",
            },
            {
              text: "He can take $1 back out of savings this once",
              why: "Taking money back out is how a savings plan stops working. If he wants the game, he can buy it next week.",
            },
          ],
          explain: "$30 minus $6 in savings leaves $24. The board game costs $25, so he doesn't have enough spending money yet.",
          doc: {
            kind: "table",
            title: "Marcus's dog-walking log",
            subtitle: "Week of October 5",
            rows: [
              { label: "Monday", value: "$8.00" },
              { label: "Wednesday", value: "$8.00" },
              { label: "Saturday", value: "$14.00" },
              { label: "Total earned", value: "$30.00", strong: true },
            ],
          },
        },
        {
          type: "teach",
          id: "t1-u3-l2-e7",
          emoji: "✉️",
          title: "Keep savings separate",
          body: "Money you keep with your spending cash is easy to spend without noticing. Give your savings its own place:\n\n- A jar or envelope with your goal written on it\n- A parent or guardian who holds it for you\n- A savings account (until you're 18, most need a parent or guardian on the account)\n\nTry to save on the same day every time, like the day you get your allowance, so it becomes a habit.",
        },
        {
          type: "mc",
          id: "t1-u3-l2-e8",
          prompt: "Why keep your savings in a separate jar, envelope, or account?",
          choices: [
            { text: "So you don't spend it without meaning to", correct: true },
            {
              text: "So you can borrow from it when you run short",
              why: "If savings turns into backup spending money, it won't reach your goal. Keeping it separate makes it easier to leave alone.",
            },
            {
              text: "Because savings has to be kept in a bank account",
              why: "A jar or envelope works too. What matters is keeping savings apart from your spending money.",
            },
          ],
          explain: "When savings sits in your wallet, it gets mixed in with spending money. A separate place makes it easier to leave alone.",
        },
        {
          type: "sort",
          id: "t1-u3-l2-e9",
          prompt: "Pay yourself first, or save what's left? Sort these habits.",
          buckets: ["Saves first", "Saves last"],
          items: [
            { text: "Saves $3 right after payday", bucket: 0 },
            { text: "Saves leftover cash on Sunday", bucket: 1 },
            { text: "Sets aside $5 before shopping", bucket: 0 },
            { text: "Spends, then saves what's left", bucket: 1 },
            { text: "Auto-saves on payday", bucket: 0 },
            { text: "Saves only in good weeks", bucket: 1 },
          ],
          explain: "Saving first means the money is set aside before any spending starts. Saving last depends on what happens to be left, which is often very little.",
        },
        {
          type: "tf",
          id: "t1-u3-l2-e10",
          statement: "Pay yourself first works even if you only earn $5.",
          answer: true,
          explain: "It works with any amount. Saving 10% of $5 means putting away 50 cents, and the same 10% works when you earn more later.",
        },
        {
          type: "scenario",
          id: "t1-u3-l2-e11",
          emoji: "🐱",
          setup: "You just earned $20 pet sitting. You're saving for $80 headphones. Your friends are going to the mall in an hour.",
          question: "What do you do with the $20?",
          choices: [
            {
              text: "Bring all $20 and save whatever is left",
              outcome: "Between a pretzel and a phone case, you come home with $1. The headphones are only $1 closer.",
            },
            {
              text: "Bring all $20, but plan to save at least $5",
              outcome: "With $20 in your pocket, it's easy to go over your plan. You come home with $2, so you save $2 instead of $5.",
            },
            {
              text: "Put $5 in your savings jar, then bring $15",
              best: true,
              outcome: "You enjoy the mall with $15, and the headphones are $5 closer. Saving $5 from each $20 job, you'll reach $80 after 16 jobs.",
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 3: Goal math, Diego's keyboard (13 exercises, connected story) ---------------- */
    {
      id: "t1-u3-l3",
      title: "Goal Math",
      description: "Figure out how long a goal will take, following Diego's keyboard plan.",
      exercises: [
        {
          type: "teach",
          id: "t1-u3-l3-e1",
          emoji: "🧮",
          title: "Weeks to reach a goal",
          body: "To find out how long a goal will take, use this:\n\n**Price ÷ savings per week = weeks**\n\nIf you save the same amount every week, this tells you how many weeks until you can buy it.",
          example: "A $60 game. You save $10 a week. $60 ÷ $10 = 6 weeks.",
        },
        {
          type: "number",
          id: "t1-u3-l3-e2",
          prompt: "A skateboard deck costs $45. You save $5 a week. How many weeks until you can buy it?",
          answer: 9,
          suffix: "weeks",
          explain: "$45 ÷ $5 = 9 weeks.",
        },
        {
          type: "mc",
          id: "t1-u3-l3-e3",
          prompt: "You want $100 sneakers and save $20 a week. How long will it take?",
          choices: [
            {
              text: "4 weeks",
              why: "After 4 weeks you'd have $80, which is $20 short. Divide $100 by $20.",
            },
            { text: "5 weeks", correct: true },
            {
              text: "20 weeks",
              why: "$20 is what you save each week, not the number of weeks. Divide $100 by $20.",
            },
            {
              text: "80 weeks",
              why: "That's $100 minus $20. To find the weeks, divide instead of subtracting.",
            },
          ],
          explain: "$100 ÷ $20 = 5 weeks. Check it: 5 × $20 = $100.",
        },
        {
          type: "teach",
          id: "t1-u3-l3-e4",
          emoji: "🎹",
          title: "Diego's keyboard plan",
          body: "Diego is 12 and wants to learn piano. He found a keyboard at Maplewood Music for $130. He already has $40 saved from his birthday, and he saves $10 a week from his allowance.\n\nMoney you've already saved is a **head start**. Subtract it from the price first, then divide what's left by your weekly savings.",
          doc: {
            kind: "table",
            title: "Diego's savings plan",
            subtitle: "Goal: keyboard from Maplewood Music",
            rows: [
              { label: "Keyboard price", value: "$130" },
              { label: "Already saved", value: "$40" },
              { label: "Saves each week", value: "$10" },
            ],
          },
        },
        {
          type: "number",
          id: "t1-u3-l3-e5",
          prompt: "How much more money does Diego need for the keyboard?",
          answer: 90,
          prefix: "$",
          explain: "The $130 price minus his $40 head start leaves $90 still to save.",
          doc: {
            kind: "table",
            title: "Diego's savings plan",
            subtitle: "Goal: keyboard from Maplewood Music",
            rows: [
              { label: "Keyboard price", value: "$130" },
              { label: "Already saved", value: "$40" },
              { label: "Saves each week", value: "$10" },
            ],
          },
        },
        {
          type: "number",
          id: "t1-u3-l3-e6",
          prompt: "Saving $10 a week, how many weeks will it take Diego to save the $90 he still needs?",
          answer: 9,
          suffix: "weeks",
          explain: "$90 ÷ $10 = 9 weeks. If he forgot his head start and divided $130 by $10, he'd plan for 13 weeks instead.",
          doc: {
            kind: "table",
            title: "Diego's savings plan",
            subtitle: "Goal: keyboard from Maplewood Music",
            rows: [
              { label: "Keyboard price", value: "$130" },
              { label: "Already saved", value: "$40" },
              { label: "Saves each week", value: "$10" },
            ],
          },
        },
        {
          type: "teach",
          id: "t1-u3-l3-e7",
          emoji: "📅",
          title: "Working back from a deadline",
          body: "Diego signs up for a beginner piano class that starts in 6 weeks. He wants the keyboard by then, but at $10 a week it will take 9.\n\nWhen you have a deadline, flip the formula:\n\n**Amount needed ÷ weeks = savings per week**",
          example: "A $36 school trip is 6 weeks away. $36 ÷ 6 = $6 a week.",
        },
        {
          type: "mc",
          id: "t1-u3-l3-e8",
          prompt: "Diego needs $90 more, and the class starts in 6 weeks. How much does he need to save each week?",
          choices: [
            {
              text: "$10",
              why: "That's what he saves now. At $10 a week he needs 9 weeks, so he'd miss the start of class.",
            },
            { text: "$15", correct: true },
            {
              text: "About $22",
              why: "That's $130 ÷ 6. It leaves out the $40 he already has, so he'd save more than he needs to.",
            },
          ],
          explain: "$90 ÷ 6 weeks = $15 a week. Check it: 6 × $15 = $90, and $90 plus his $40 head start makes $130.",
          doc: {
            kind: "table",
            title: "Diego's savings plan",
            subtitle: "Goal: keyboard from Maplewood Music",
            rows: [
              { label: "Keyboard price", value: "$130" },
              { label: "Already saved", value: "$40" },
              { label: "Saves each week", value: "$10" },
            ],
          },
        },
        {
          type: "scenario",
          id: "t1-u3-l3-e9",
          emoji: "🏠",
          setup: "Diego gets $12 a week in allowance and saves $10 of it. His neighbor offers him $5 a week to roll her trash cans to the curb and back. He needs to save $15 a week.",
          question: "What's Diego's best plan?",
          choices: [
            {
              text: "Save all $12 of his allowance each week",
              outcome: "That's $12 a week. $90 ÷ $12 = 7.5, so it takes 8 weeks. He misses the first 2 weeks of class and has no spending money.",
            },
            {
              text: "Take the job and save all $5 from it",
              best: true,
              outcome: "$10 from his allowance plus $5 from the job is $15 a week. He reaches $90 in 6 weeks and still keeps $2 a week to spend.",
            },
            {
              text: "Keep saving $10 and buy it when he can",
              outcome: "This still works, but it takes 9 weeks. He misses the first 3 weeks of class.",
            },
          ],
        },
        {
          type: "teach",
          id: "t1-u3-l3-e10",
          emoji: "🧾",
          title: "Extra costs and rounding up",
          body: "Diego visits Maplewood Music and learns the keyboard needs a stand, which costs $20. Big purchases often come with extra parts like this, so check the full cost before you make a plan.\n\nIf goal math gives you a decimal, **round up** to the next whole week. Rounding down would leave you a little short.",
          doc: {
            kind: "receipt",
            title: "Maplewood Music: price quote",
            subtitle: "Prepared for Diego",
            rows: [
              { label: "Keyboard", value: "$130.00" },
              { label: "Keyboard stand", value: "$20.00" },
              { label: "Total", value: "$150.00", strong: true },
            ],
            note: "Prices include sales tax. Quote good for 60 days.",
          },
        },
        {
          type: "mc",
          id: "t1-u3-l3-e11",
          prompt: "Diego now needs $150 in all. He has $40 and saves $15 a week. How many weeks will it take?",
          choices: [
            {
              text: "6 weeks",
              why: "That's the plan for the keyboard alone ($90 ÷ $15). It leaves out the $20 stand.",
            },
            {
              text: "7 weeks",
              why: "$110 ÷ $15 is about 7.3. Rounding down to 7 leaves him short, so round up.",
            },
            { text: "8 weeks", correct: true },
            {
              text: "10 weeks",
              why: "That's $150 ÷ $15. It forgets his $40 head start.",
            },
          ],
          explain: "$150 minus $40 is $110. $110 ÷ $15 is about 7.3, so he needs 8 weeks. After 8 weeks he'll have $160, enough for both.",
          doc: {
            kind: "receipt",
            title: "Maplewood Music: price quote",
            subtitle: "Prepared for Diego",
            rows: [
              { label: "Keyboard", value: "$130.00" },
              { label: "Keyboard stand", value: "$20.00" },
              { label: "Total", value: "$150.00", strong: true },
            ],
            note: "Prices include sales tax. Quote good for 60 days.",
          },
        },
        {
          type: "tf",
          id: "t1-u3-l3-e12",
          statement: "After 7 weeks of saving $15, plus his $40 head start, Diego will have enough for the keyboard and the stand.",
          answer: false,
          explain: "7 × $15 = $105, and $105 plus $40 is $145. That's $5 short of $150, so he needs the 8th week.",
          doc: {
            kind: "receipt",
            title: "Maplewood Music: price quote",
            subtitle: "Prepared for Diego",
            rows: [
              { label: "Keyboard", value: "$130.00" },
              { label: "Keyboard stand", value: "$20.00" },
              { label: "Total", value: "$150.00", strong: true },
            ],
            note: "Prices include sales tax. Quote good for 60 days.",
          },
        },
        {
          type: "scenario",
          id: "t1-u3-l3-e13",
          emoji: "🎹",
          setup: "Diego saves $15 a week. His class starts after week 6, but the keyboard and stand together take 8 weeks. By week 6 he'll have exactly $130.",
          question: "What's Diego's best plan?",
          choices: [
            {
              text: "Buy the keyboard in week 6 and the stand in week 8",
              best: true,
              outcome: "He has the keyboard in time for class and practices on a table for two weeks. In week 8 he buys the $20 stand and has $10 left over.",
            },
            {
              text: "Wait and buy both together in week 8",
              outcome: "This works, but he goes to the first two weeks of class with nothing to practice on at home.",
            },
            {
              text: "Save his $2 spending money too, so he saves $17 a week",
              outcome: "$110 ÷ $17 is about 6.5, so it still takes 7 weeks. He misses the first week of class and has no spending money.",
            },
          ],
          doc: {
            kind: "receipt",
            title: "Maplewood Music: price quote",
            subtitle: "Prepared for Diego",
            rows: [
              { label: "Keyboard", value: "$130.00" },
              { label: "Keyboard stand", value: "$20.00" },
              { label: "Total", value: "$150.00", strong: true },
            ],
            note: "Prices include sales tax. Quote good for 60 days.",
          },
        },
      ],
    },

    /* ---------------- Lesson 4: Surprise expenses & emergency funds (10 exercises) ---------------- */
    {
      id: "t1-u3-l4",
      title: "Surprise Expenses",
      description: "Build an emergency fund, use it when something breaks, then refill it.",
      exercises: [
        {
          type: "teach",
          id: "t1-u3-l4-e1",
          emoji: "🔧",
          title: "Surprise expenses",
          body: "A **surprise expense** is a cost you didn't plan for. A bike tire goes flat. A phone charger stops working. A library book gets damaged and you owe a fee.\n\nEveryone has these, and they rarely come at a good time.",
          example: "You return a library book with a torn cover and owe a $15 fee. You didn't plan for it, but you still have to pay it.",
        },
        {
          type: "mc",
          id: "t1-u3-l4-e2",
          prompt: "Which one is a surprise expense?",
          choices: [
            {
              text: "Lunch money you pay every week",
              why: "You pay it every week, so you can plan for it.",
            },
            {
              text: "A field trip fee announced a month ahead",
              why: "You were told a month ahead, so you have time to plan. That makes it a planned cost.",
            },
            {
              text: "A birthday gift for a party next month",
              why: "You know about the party ahead of time, so the gift is a planned cost.",
            },
            { text: "A new charger after yours stops working", correct: true },
          ],
          explain: "A surprise expense is one you couldn't plan for. Costs you know about ahead of time, even big ones, belong in your regular plan.",
        },
        {
          type: "teach",
          id: "t1-u3-l4-e3",
          emoji: "🛟",
          title: "Emergency funds",
          body: "An **emergency fund** is money you save only for surprise costs you need to pay.\n\n- For teens, $100 to $500 is a good first goal\n- Adults aim for 3 to 6 months of expenses, like rent, food, and bills\n\nKeep it separate from your goal savings, so you always know how much is ready for an emergency.",
          example: "To build a $100 fund at $5 a week, use goal math: $100 ÷ $5 = 20 weeks.",
        },
        {
          type: "sort",
          id: "t1-u3-l4-e4",
          prompt: "Should the emergency fund pay for it? Sort each cost.",
          buckets: ["Emergency fund", "Other money"],
          items: [
            { text: "Fixing a flat bike tire", bucket: 0 },
            { text: "Replacing a lost house key", bucket: 0 },
            { text: "Damaged library book fee", bucket: 0 },
            { text: "Sneakers on sale today only", bucket: 1 },
            { text: "Concert tickets selling fast", bucket: 1 },
            { text: "A game you've waited for", bucket: 1 },
          ],
          explain: "The emergency fund is for costs you didn't plan for and need to pay. A sale or tickets that might sell out can feel urgent, but they are wants. Use fun money or goal savings for those.",
        },
        {
          type: "tf",
          id: "t1-u3-l4-e5",
          statement: "Adults usually aim to keep 3 to 6 weeks of expenses in an emergency fund.",
          answer: false,
          explain: "The usual goal for adults is 3 to 6 months of expenses, not weeks. For teens, $100 to $500 is a good start.",
        },
        {
          type: "teach",
          id: "t1-u3-l4-e6",
          emoji: "🐪",
          funFact: true,
          title: "The camel's hump",
          body: "A camel's hump isn't full of water. It stores mostly **fat**.\n\nWhen food is hard to find, a camel can use that fat for energy. Like an emergency fund, it's built up ahead of time and used when it's needed.",
        },
        {
          type: "scenario",
          id: "t1-u3-l4-e7",
          emoji: "🚲",
          setup: "Your bike chain breaks, and you ride that bike to your dog-walking job. You have $120 in your emergency fund and $40 saved for a game. The repair costs $28.",
          question: "How should you pay for the repair?",
          choices: [
            {
              text: "Use the emergency fund, then refill it",
              best: true,
              outcome: "The bike is fixed, you keep your dog-walking job, and your game savings stay at $40. This is the kind of cost the fund is for.",
            },
            {
              text: "Use your game savings and leave the fund full",
              outcome: "The bike gets fixed, but your game savings drop from $40 to $12. The emergency fund was there for exactly this.",
            },
            {
              text: "Wait until you've saved more before fixing it",
              outcome: "Without the bike, it's hard to get to your dog-walking job, so you lose income while you wait. The repair still costs $28.",
            },
          ],
          doc: {
            kind: "receipt",
            title: "Spoke & Pedal Bike Shop: receipt",
            rows: [
              { label: "New chain", value: "$18.00" },
              { label: "Labor", value: "$10.00" },
              { label: "Total", value: "$28.00", strong: true },
            ],
            note: "Price includes sales tax.",
          },
        },
        {
          type: "number",
          id: "t1-u3-l4-e8",
          prompt: "You pay for the repair from your $120 emergency fund. How many dollars are left in the fund?",
          answer: 92,
          prefix: "$",
          explain: "The total is $18 for the chain plus $10 for labor, or $28. $120 minus $28 is $92.",
          doc: {
            kind: "receipt",
            title: "Spoke & Pedal Bike Shop: receipt",
            rows: [
              { label: "New chain", value: "$18.00" },
              { label: "Labor", value: "$10.00" },
              { label: "Total", value: "$28.00", strong: true },
            ],
            note: "Price includes sales tax.",
          },
        },
        {
          type: "mc",
          id: "t1-u3-l4-e9",
          prompt: "Your emergency fund is down to $92 from $120. What's the best next step?",
          choices: [
            { text: "Refill it a little each week until it's back to $120", correct: true },
            {
              text: "Leave it at $92, since surprises don't happen often",
              why: "Surprise costs happen to everyone, and sometimes two come close together. Refilling the fund gets you ready for the next one.",
            },
            {
              text: "Move all $40 of your game savings into it today",
              why: "Your fund is still most of the way full. Moving $40 would push it past $120 and wipe out your game progress. A little each week keeps both goals moving.",
            },
          ],
          explain: "An emergency fund is meant to be used and then refilled. Pay yourself first each week until it's back to full.",
        },
        {
          type: "number",
          id: "t1-u3-l4-e10",
          prompt: "You add $4 a week to the fund until it's back to $120. How many weeks will that take?",
          answer: 7,
          suffix: "weeks",
          explain: "You need to replace the $28 you spent. $28 ÷ $4 = 7 weeks.",
          doc: {
            kind: "receipt",
            title: "Spoke & Pedal Bike Shop: receipt",
            rows: [
              { label: "New chain", value: "$18.00" },
              { label: "Labor", value: "$10.00" },
              { label: "Total", value: "$28.00", strong: true },
            ],
            note: "Price includes sales tax.",
          },
        },
      ],
    },
  ],

  quiz: {
    passPercent: 70,
    exercises: [
      {
        type: "mc",
        id: "t1-u3-q-e1",
        prompt: "Which of these is a long-term goal?",
        choices: [
          {
            text: "A $150 pair of shoes for next month",
            why: "It costs a lot, but next month is less than a year away. That makes it short-term.",
          },
          { text: "A car you hope to buy in four years", correct: true },
          {
            text: "Saving $2 a week for a gift next month",
            why: "Saving every week doesn't make a goal long-term. The gift is a month away, so it's short-term.",
          },
          {
            text: "Summer camp in five months",
            why: "Five months is less than a year away, so it's a short-term goal.",
          },
        ],
        explain: "A long-term goal is a year or more away. The price and how often you save don't change that.",
      },
      {
        type: "tf",
        id: "t1-u3-q-e2",
        statement: "Starting to save early for a big goal means you can save a smaller amount each week.",
        answer: true,
        explain: "True. More weeks to save means each week's share is smaller. $120 over 12 weeks is $10 a week, but over 6 weeks it's $20 a week.",
      },
      {
        type: "mc",
        id: "t1-u3-q-e3",
        prompt: "You earn $20 raking leaves. Which plan is paying yourself first?",
        choices: [
          {
            text: "Spend what you need, then save the change",
            why: "That's saving last. There's often little change left.",
          },
          {
            text: "Buy a $4 treat first as a reward",
            why: "\"Yourself\" means your savings, not a treat. The first money goes to savings.",
          },
          { text: "Put $4 in savings right away, then spend the rest", correct: true },
          {
            text: "Keep all $20 in your wallet and save on Sunday",
            why: "Waiting until Sunday makes it easy to spend the money first. Set the savings aside when you get paid.",
          },
        ],
        explain: "Moving $4 to savings as soon as you're paid is paying yourself first. The other $16 is yours to spend.",
      },
      {
        type: "number",
        id: "t1-u3-q-e4",
        prompt: "You earn $25 washing a neighbor's car. You save 20% first. How many dollars go to savings?",
        answer: 5,
        prefix: "$",
        explain: "10% of $25 is $2.50. Double it for 20%: $5. That leaves $20 to spend.",
      },
      {
        type: "fill",
        id: "t1-u3-q-e5",
        prompt: "Fill in the blanks.",
        sentence: "Keep your savings in a ___ place, and save as soon as you get ___.",
        answers: ["separate", "paid"],
        bank: ["separate", "shared", "paid", "change", "home"],
        explain: "A separate place makes savings harder to spend by accident, and saving right when you get paid keeps it from being skipped.",
      },
      {
        type: "number",
        id: "t1-u3-q-e6",
        prompt: "How many weeks until Kofi can buy the speaker?",
        answer: 7,
        suffix: "weeks",
        explain: "$72 minus his $16 head start is $56. $56 ÷ $8 = 7 weeks.",
        doc: {
          kind: "table",
          title: "Kofi's savings plan",
          subtitle: "Goal: portable speaker",
          rows: [
            { label: "Speaker price", value: "$72" },
            { label: "Already saved", value: "$16" },
            { label: "Saves each week", value: "$8" },
          ],
        },
      },
      {
        type: "mc",
        id: "t1-u3-q-e7",
        prompt: "You need $50 and save $8 a week. What's the fewest number of weeks it will take?",
        choices: [
          {
            text: "6 weeks",
            why: "After 6 weeks you'd have $48, which is $2 short.",
          },
          {
            text: "6.25 weeks",
            why: "That's the exact answer to $50 ÷ $8, but you save once a week. Round up to the next whole week.",
          },
          { text: "7 weeks", correct: true },
        ],
        explain: "$50 ÷ $8 = 6.25, so round up to 7 weeks. After 7 weeks you'll have $56, which is enough.",
      },
      {
        type: "number",
        id: "t1-u3-q-e8",
        prompt: "A $48 concert ticket goes on sale in 8 weeks. How many dollars should you save each week to have it in time?",
        answer: 6,
        prefix: "$",
        suffix: "per week",
        explain: "With a deadline, divide by the weeks: $48 ÷ 8 = $6 a week.",
      },
      {
        type: "mc",
        id: "t1-u3-q-e9",
        prompt: "Which cost should come out of an emergency fund?",
        choices: [
          {
            text: "A jacket that's half price this weekend",
            why: "A good sale is still a want. Use fun money or goal savings for it.",
          },
          {
            text: "Concert tickets before they sell out",
            why: "It feels urgent, but it's a want you chose. The emergency fund is for costs you didn't plan for.",
          },
          { text: "Replacing a lost house key", correct: true },
          {
            text: "A gift for a friend's party next week",
            why: "You know about the party ahead of time, so the gift belongs in your regular plan.",
          },
        ],
        explain: "A lost key is a surprise, and you need to replace it. That's what an emergency fund is for.",
      },
      {
        type: "scenario",
        id: "t1-u3-q-e10",
        emoji: "✉️",
        setup: "You used your whole $50 emergency fund to replace a lost calculator. Then your grandma mails you $40. You're also saving for a $60 game.",
        question: "What's the best plan for the $40?",
        choices: [
          {
            text: "Put all $40 toward the game",
            outcome: "The game is closer, but your emergency fund is still at $0. If something else breaks, you'd have to use your game money anyway.",
          },
          {
            text: "Put all $40 back into the emergency fund",
            best: true,
            outcome: "Your fund is back to $40 of its $50, so you're covered if something else goes wrong. Once it's full, you go back to saving for the game.",
          },
          {
            text: "Spend $20 and put $20 toward the game",
            outcome: "You enjoy the $20 and the game gets closer, but your emergency fund is still at $0.",
          },
        ],
      },
    ],
  },
}

export default unit
