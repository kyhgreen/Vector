import type { Doc, Unit } from "../types"

/* ---------- Documents used in this unit ---------- */

const laptopOffer: Doc = {
  kind: "offer",
  title: "Volta Electronics: store card offer",
  subtitle: "Offered at checkout",
  rows: [
    { label: "Laptop price", value: "$1,200.00" },
    { label: "Due today", value: "$0.00" },
    { label: "APR", value: "29.99%" },
    { label: "Paying $35 a month: time to pay off", value: "79 months" },
    { label: "Paying $35 a month: total paid", value: "$2,756.34", strong: true },
  ],
  note: "Estimate assumes no other purchases on the card.",
}

const dealerOffer: Doc = {
  kind: "offer",
  title: "Ridgeline Auto: financing offer",
  subtitle: "Buyer: Mei Lin · 2019 sedan",
  rows: [
    { label: "Price (with tax and fees)", value: "$12,000.00" },
    { label: "Down payment", value: "$2,000.00" },
    { label: "Amount financed", value: "$10,000.00", strong: true },
    { label: "APR", value: "9.90%" },
    { label: "Term", value: "72 months" },
    { label: "Monthly payment", value: "$184.75" },
    { label: "Finance charge", value: "$3,302.00" },
    { label: "Total of payments", value: "$13,302.00", strong: true },
  ],
  note: "Total of payments = $184.75 × 72.",
}

const creditUnionOffer: Doc = {
  kind: "offer",
  title: "Cedar Valley Credit Union: auto loan offer",
  subtitle: "Member: Mei Lin · Pre-approved",
  rows: [
    { label: "Amount financed", value: "$10,000.00", strong: true },
    { label: "APR", value: "6.50%" },
    { label: "Term", value: "48 months" },
    { label: "Monthly payment", value: "$237.15" },
    { label: "Finance charge", value: "$1,383.20" },
    { label: "Total of payments", value: "$11,383.20", strong: true },
  ],
  note: "Offer valid for 30 days. Rate depends on credit history.",
}

const carAfterOneYear: Doc = {
  kind: "table",
  title: "Mei's car after one year (estimate)",
  subtitle: "Purchase price: $12,000 with tax and fees",
  rows: [
    { label: "Car value after one year", value: "$9,500", strong: true },
    { label: "Owed: credit union, 48 months, $2,000 down", value: "$7,738" },
    { label: "Owed: dealer, 72 months, $2,000 down", value: "$8,716" },
    { label: "Owed: dealer, 72 months, $0 down", value: "$10,459" },
  ],
  note: "Balances after 12 payments. Car values vary.",
}

const bnplDue: Doc = {
  kind: "statement",
  title: "Pay-in-4 plans: payments due this month",
  subtitle: "3 active plans · paid from your debit card",
  rows: [
    { label: "Running shoes, payment 2 of 4", value: "$45.00" },
    { label: "Running shoes, payment 3 of 4", value: "$45.00" },
    { label: "Winter jacket, payment 3 of 4", value: "$32.50" },
    { label: "Winter jacket, payment 4 of 4", value: "$32.50" },
    { label: "Earbuds, payment 2 of 4", value: "$22.00" },
    { label: "Earbuds, payment 3 of 4", value: "$22.00" },
  ],
  note: "A failed payment can bring a late fee of up to $8.",
}

const paydayTerms: Doc = {
  kind: "offer",
  title: "Corner Cash Advance: loan terms",
  subtitle: "Single-payment loan · 14 days",
  rows: [
    { label: "Amount borrowed", value: "$300.00" },
    { label: "Fee ($15 per $100)", value: "$45.00" },
    { label: "APR", value: "391.07%" },
    { label: "Rollover fee (adds 14 days)", value: "$45.00" },
    { label: "Total due in 14 days", value: "$345.00", strong: true },
  ],
  note: "After a rollover, the full $300 is still due on the new date.",
}

const yourDebts: Doc = {
  kind: "table",
  title: "Your debts",
  subtitle: "Extra money each month: $100",
  rows: [
    { label: "Store card: $900 balance", value: "24% APR" },
    { label: "Minimum payment", value: "$35", indent: true },
    { label: "Personal loan: $300 balance", value: "15% APR" },
    { label: "Minimum payment", value: "$30", indent: true },
    { label: "Car loan: $2,000 balance", value: "7% APR" },
    { label: "Minimum payment", value: "$95", indent: true },
    { label: "Total minimums", value: "$160", strong: true },
  ],
}

const unit: Unit = {
  id: "t2-u4",
  tier: 2,
  order: 4,
  title: "Debt & Loans",
  tagline: "Learn what borrowing really costs and how to pay off debt with a plan.",
  color: "red",
  emoji: "💸",

  guidebook: {
    intro:
      "Borrowing lets you pay for something over time, but you always pay back more than you borrowed. This unit shows how to find the real cost of a loan, how car loans, buy now, pay later, and payday loans work, and how to pay off debt with a plan.",
    keyIdeas: [
      {
        title: "Principal plus interest",
        body: "When you borrow, you repay the **principal** (the amount borrowed) plus **interest** (the cost of borrowing). A higher rate or a longer loan means you pay more in total.",
      },
      {
        title: "When debt can make sense",
        body: "Debt can be reasonable when it helps you earn more later or covers a real need, at a cost you can afford. High-interest debt for things that lose value quickly usually costs more than it is worth.",
      },
      {
        title: "Car loans: look at the total",
        body: "Multiply the monthly payment by the number of months, then add the down payment. A longer term lowers the payment but raises the total interest. A bigger down payment and a shorter term both lower the cost.",
      },
      {
        title: "BNPL and payday loans",
        body: "Buy now, pay later splits a purchase into a few payments, and missed payments can bring fees. Payday loan fees can work out to an APR around 400% or higher, and each rollover adds another fee.",
      },
      {
        title: "Avalanche vs. snowball",
        body: "Pay the minimum on every debt, then put extra money on one. Avalanche targets the highest interest rate and saves the most. Snowball targets the smallest balance and gives quick wins.",
      },
    ],
    funFacts: [
      "The \"b\" in \"debt\" is silent. Scholars added it centuries ago to match the Latin word debitum, but people never started pronouncing it.",
      "\"Mortgage\" comes from Old French words meaning \"dead pledge.\" One common explanation is that the pledge \"dies\" once the loan is paid off.",
      "\"Credit\" comes from the Latin credere, \"to believe,\" as in a lender believing you will pay it back.",
      "The Code of Hammurabi, carved more than 3,500 years ago, includes rules about loans and interest. That is long before the first coins were made.",
      "By the Rule of 72, a balance at 24% interest that is never paid down doubles in about 3 years (72 ÷ 24 = 3).",
    ],
    words: [
      { term: "Principal", meaning: "The amount of money you borrowed." },
      { term: "Interest", meaning: "What a lender charges you to borrow money." },
      { term: "APR", meaning: "The yearly cost of borrowing as a percent, including some fees." },
      { term: "Loan term", meaning: "How long you have to repay a loan." },
      { term: "Down payment", meaning: "Cash paid up front so you borrow less." },
      { term: "Upside down", meaning: "Owing more on a loan than the item is worth." },
      { term: "Buy now, pay later (BNPL)", meaning: "Splitting a purchase into a few scheduled payments." },
      { term: "Payday loan", meaning: "A small loan due on your next payday, with very high fees." },
      { term: "Avalanche method", meaning: "Paying extra on the highest-rate debt first." },
      { term: "Snowball method", meaning: "Paying extra on the smallest balance first." },
    ],
  },

  lessons: [
    /* ---------------- Lesson 1: Good debt vs. bad debt & the cost of interest ---------------- */
    {
      id: "t2-u4-l1",
      title: "What Borrowing Costs",
      description: "Principal, interest, and when debt helps or hurts.",
      exercises: [
        {
          type: "teach",
          id: "t2-u4-l1-e1",
          emoji: "🏦",
          title: "Principal and interest",
          body: "**Debt** is money you owe. When you borrow, you repay two things:\n- The **principal**: the amount you borrowed\n- The **interest**: what the lender charges for letting you use its money\n\nA higher interest rate, or a longer time to repay, means you pay more interest in total.",
          example: "You borrow $1,000. You repay the $1,000 principal plus interest. If you take two years to repay instead of one, interest is charged for twice as long.",
        },
        {
          type: "mc",
          id: "t2-u4-l1-e2",
          prompt: "On a loan, what is interest?",
          choices: [
            { text: "The cost of borrowing, paid on top of the amount borrowed", correct: true },
            { text: "The amount you originally borrowed", why: "That is the principal. Interest is the extra the lender charges on top of it." },
            { text: "A fee charged only when a payment is late", why: "That is a late fee. Interest is charged even when every payment is on time." },
            { text: "A one-time fee paid when the loan starts", why: "Some loans do have upfront fees, but interest keeps building for as long as you owe money." },
          ],
          explain: "Interest is the price of using someone else's money. You pay it in addition to the principal.",
        },
        {
          type: "tf",
          id: "t2-u4-l1-e3",
          statement: "If you borrow $1,000 from a bank and repay it over a year, you will usually repay exactly $1,000.",
          answer: false,
          explain: "False. Banks charge interest, so you repay the $1,000 plus more. Interest is how lenders earn money on loans.",
        },
        {
          type: "teach",
          id: "t2-u4-l1-e4",
          emoji: "🧮",
          title: "Estimating interest",
          body: "Loan rates are written as a yearly percent, usually called the **APR**. For a simple loan repaid all at once after one year:\n\n**Interest = amount borrowed × rate**\n\nLoans with monthly payments are calculated a little differently, but the pattern holds: a higher rate means more interest.",
          example: "Borrow $1,000 at 10% for one year, repaid at the end. Interest = $1,000 × 0.10 = $100, so you repay $1,100.",
        },
        {
          type: "number",
          id: "t2-u4-l1-e5",
          prompt: "You borrow $500 at 20% for one year and repay it all at the end. How much do you repay in total?",
          answer: 600,
          prefix: "$",
          explain: "Interest is $500 × 0.20 = $100. Add the $500 principal for a total of $600.",
        },
        {
          type: "mc",
          id: "t2-u4-l1-e6",
          prompt: "You borrow $800 at 15% for one year, repaid at the end. How much interest do you owe?",
          choices: [
            { text: "$120", correct: true },
            { text: "$15", why: "15% is a rate, not a dollar amount. Multiply: $800 × 0.15 = $120." },
            { text: "$920", why: "That is the total you repay, principal plus interest. The interest alone is $120." },
            { text: "$80", why: "That would be 10% of $800. At 15%, the interest is $800 × 0.15 = $120." },
          ],
          explain: "Interest = $800 × 0.15 = $120. You would repay $920 in total.",
        },
        {
          type: "teach",
          id: "t2-u4-l1-e7",
          emoji: "⚖️",
          title: "When debt can make sense",
          body: "Whether debt helps depends on what it pays for and what it costs.\n- **Can make sense:** it helps you earn more later or covers a real need, at a cost you can afford, like job training or a reasonable car loan to get to work\n- **Usually costly:** high-interest debt for things that are used up or lose value fast, like a card balance from restaurant meals\n\nEven useful debt becomes a problem if the payments don't fit your budget.",
        },
        {
          type: "sort",
          id: "t2-u4-l1-e8",
          prompt: "Sort each debt by how it usually turns out.",
          buckets: ["Can help", "Usually hurts"],
          items: [
            { text: "Loan for nursing school", bucket: 0 },
            { text: "Affordable car loan for work", bucket: 0 },
            { text: "Loan for welding certification", bucket: 0 },
            { text: "Card balance from takeout", bucket: 1 },
            { text: "Payday loan for new shoes", bucket: 1 },
            { text: "Vacation on a 25% card", bucket: 1 },
          ],
          explain: "Debt that raises your earning power or gets you to work can pay off. High-interest debt for things that are quickly used up leaves you paying for something you no longer have.",
        },
        {
          type: "mc",
          id: "t2-u4-l1-e9",
          prompt: "Which question best tells you whether a loan might be worth taking?",
          choices: [
            { text: "Will it help me long term, at a cost I can afford?", correct: true },
            { text: "Is the monthly payment low?", why: "A low payment can hide a long term and a large total. Check the total cost too." },
            { text: "Will the lender approve me?", why: "Approval means the lender is willing to lend. It doesn't mean the loan fits your budget." },
            { text: "Is the interest rate lower than a credit card's?", why: "A lower rate helps, but a loan for something you don't need still costs money. The rate is only one part of the decision." },
          ],
          explain: "A loan worth taking does two things: it leaves you better off over time, and its rate, fees, and payments fit your budget.",
        },
        {
          type: "teach",
          id: "t2-u4-l1-e10",
          emoji: "📈",
          funFact: true,
          title: "The Rule of 72 works on debt too",
          body: "The **Rule of 72** estimates how many years it takes money to double: divide 72 by the interest rate.\n\nIt is usually used for savings, but it works the same way on debt. If interest keeps adding to a balance and you never pay it down, the rule tells you roughly how fast that balance doubles.",
          example: "A balance at 24% that is never paid down: 72 ÷ 24 = about 3 years to double.",
        },
        {
          type: "number",
          id: "t2-u4-l1-e11",
          prompt: "Using the Rule of 72, about how many years would it take a balance at 18% interest to double if it is never paid down?",
          answer: 4,
          suffix: "years",
          explain: "72 ÷ 18 = 4. In about 4 years, the balance would be twice as large.",
        },
        {
          type: "scenario",
          id: "t2-u4-l1-e12",
          emoji: "💻",
          setup: "You're 18 with $400 saved, and you can set aside $150 a week from your job. You need a $1,200 laptop for classes in two months. The store offers its own card at 29.99% APR.",
          question: "What's the best plan?",
          doc: laptopOffer,
          choices: [
            {
              text: "Open the card and pay $35 a month",
              outcome: "It would take 79 months, more than six years, to pay off. You would pay about $2,756 for a $1,200 laptop.",
            },
            {
              text: "Put your $400 down and use the card for the other $800",
              outcome: "Borrowing less helps. At $35 a month, the $800 takes 35 months to repay, and the laptop costs about $1,600 in total.",
            },
            {
              text: "Save for 6 more weeks, then pay cash",
              best: true,
              outcome: "$400 plus 6 × $150 = $1,300, enough to buy the laptop before classes start. You pay $1,200 and no interest.",
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 2: Car loans (connected story) ---------------- */
    {
      id: "t2-u4-l2",
      title: "Mei Buys a Car",
      description: "Follow one car purchase from down payment to signing.",
      exercises: [
        {
          type: "teach",
          id: "t2-u4-l2-e1",
          emoji: "🚗",
          title: "How a car loan works",
          body: "With a car loan, a lender pays for the car and you repay the lender every month for a set **term**, such as 36, 48, 60, or 72 months, plus interest.\n\nThe car is **collateral**. If you stop paying, the lender can **repossess** it (take it back). If it sells for less than you owe, you can still owe the difference.",
          example: "Meet Mei. She's 18, works at a hardware store, and needs a car to get to work and classes. She found a used sedan for $12,000, including tax and fees.",
        },
        {
          type: "mc",
          id: "t2-u4-l2-e2",
          prompt: "Mei sees \"60-month term\" on a loan ad. What does the term tell her?",
          choices: [
            { text: "How long she has to repay the loan", correct: true },
            { text: "The interest rate the lender charges", why: "The rate is the cost of borrowing. The term is how long the loan lasts." },
            { text: "The car's price before tax and fees", why: "The price is a separate number. The term is the number of months of payments." },
            { text: "How much cash she must pay up front", why: "That is the down payment. The term is the length of the loan." },
          ],
          explain: "The term is the length of the loan in months. A 60-month term means five years of payments.",
        },
        {
          type: "tf",
          id: "t2-u4-l2-e3",
          statement: "If Mei stops making her car payments, the lender can take the car back.",
          answer: true,
          explain: "True. The car is collateral, so the lender can repossess it. If it sells for less than she owes, she can still owe the rest, and the missed payments hurt her credit.",
        },
        {
          type: "teach",
          id: "t2-u4-l2-e4",
          emoji: "💵",
          title: "The down payment",
          body: "A **down payment** is cash you pay up front. The more you put down, the less you borrow, which means:\n- less interest\n- smaller monthly payments\n- less chance of owing more than the car is worth\n\nIt still makes sense to keep some savings for emergencies after you buy.",
          example: "A $9,000 car with $1,800 down means borrowing $7,200.",
        },
        {
          type: "scenario",
          id: "t2-u4-l2-e5",
          emoji: "🧾",
          setup: "Mei has $2,500 saved. The car costs $12,000 with tax and fees. Her first insurance bill is due the month she buys it, and older cars need repairs now and then.",
          question: "How much should Mei put down?",
          choices: [
            {
              text: "$2,000, keeping $500 for emergencies",
              best: true,
              outcome: "She borrows $10,000 and still has a cushion for a repair or her first insurance bill.",
            },
            {
              text: "All $2,500, to borrow as little as possible",
              outcome: "She borrows $9,500, but the first repair or insurance bill would have to go on a credit card.",
            },
            {
              text: "Nothing, so she keeps all her savings",
              outcome: "She borrows the full $12,000, pays more interest, and is more likely to owe more than the car is worth.",
            },
          ],
        },
        {
          type: "teach",
          id: "t2-u4-l2-e6",
          emoji: "📄",
          title: "Read the whole offer",
          body: "Mei puts $2,000 down and borrows $10,000. The dealer's offer is below. Every loan offer should show:\n- the **APR** and the term\n- the monthly payment\n- the **finance charge**: the dollar cost of borrowing\n- the **total of payments**\n\nSalespeople often ask what monthly payment you want. Compare offers by APR and total cost instead.",
          doc: dealerOffer,
        },
        {
          type: "mc",
          id: "t2-u4-l2-e7",
          prompt: "The salesperson asks, \"What monthly payment are you hoping for?\" What is Mei's best answer?",
          choices: [
            { text: "\"I'm comparing APR and total cost, not just the payment.\"", correct: true },
            { text: "\"Around $180 a month.\"", why: "Naming a payment lets the dealer reach it by stretching the term, which can raise the total cost." },
            { text: "\"Whatever gets the payment lowest.\"", why: "The lowest payment usually comes from the longest term, which means paying interest for more months." },
            { text: "\"Whatever rate my credit score qualifies for.\"", why: "Her score affects the rate, but she should still compare offers from more than one lender." },
          ],
          explain: "A monthly payment can be lowered by adding months. Asking about APR and total cost keeps the focus on what the car really costs.",
        },
        {
          type: "mc",
          id: "t2-u4-l2-e8",
          prompt: "Using the dealer's offer, how much would the car cost Mei in total, counting her down payment?",
          doc: dealerOffer,
          choices: [
            { text: "$15,302.00", correct: true },
            { text: "$13,302.00", why: "That is the total of payments on the loan. Add the $2,000 she paid up front." },
            { text: "$12,000.00", why: "That is the price before financing. Borrowing adds a $3,302.00 finance charge." },
            { text: "$3,302.00", why: "That is the finance charge, the interest alone. The full cost is the down payment plus the total of payments." },
          ],
          explain: "$2,000 down + $13,302.00 in payments = $15,302.00. Financing makes the $12,000 car cost $3,302 more.",
        },
        {
          type: "number",
          id: "t2-u4-l2-e9",
          prompt: "Mei's credit union pre-approves her (offer shown). The dealer's total was $13,302.00. How much less would the credit union loan cost? Round to the nearest dollar.",
          doc: creditUnionOffer,
          answer: 1919,
          tolerance: 1,
          prefix: "$",
          explain: "$13,302.00 - $11,383.20 = $1,918.80, so she would save about $1,919 by choosing the credit union offer.",
        },
        {
          type: "mc",
          id: "t2-u4-l2-e10",
          prompt: "The credit union payment is about $52 more per month than the dealer's. Why does it still cost less overall?",
          doc: creditUnionOffer,
          choices: [
            { text: "A lower APR, and 24 fewer months of interest", correct: true },
            { text: "The credit union doesn't charge interest", why: "It does. The finance charge is $1,383.20. The rate is just lower." },
            { text: "A higher monthly payment always means a cheaper loan", why: "Not always. What saves money here is the lower APR and shorter term, not the payment size itself." },
            { text: "The dealer's offer includes hidden fees", why: "The dealer's offer shows no added fees. The difference comes from the rate and the term." },
          ],
          explain: "Interest is charged on what you still owe each month. A lower rate for 48 months instead of 72 means a much smaller finance charge: $1,383.20 versus $3,302.00.",
        },
        {
          type: "teach",
          id: "t2-u4-l2-e11",
          emoji: "📉",
          title: "Owing more than the car is worth",
          body: "Cars lose value over time. On a long loan, the balance falls slowly, because each payment is smaller and more of it goes to interest. You can end up **upside down**: owing more than the car is worth.\n\nIf you're upside down and need to sell, the sale won't cover the loan, and you'd still owe the rest. A bigger down payment and a shorter term both help.",
          doc: carAfterOneYear,
        },
        {
          type: "mc",
          id: "t2-u4-l2-e12",
          prompt: "Which loan would leave Mei upside down after one year?",
          doc: carAfterOneYear,
          choices: [
            { text: "The dealer loan with $0 down", correct: true },
            { text: "The dealer loan with $2,000 down", why: "She would owe $8,716 on a car worth about $9,500. That is closer than the credit union loan, but not upside down." },
            { text: "The credit union loan with $2,000 down", why: "She would owe $7,738 on a car worth about $9,500, so the car is worth more than the loan." },
          ],
          explain: "With $0 down she would owe $10,459 on a car worth about $9,500, which is $959 more than it's worth. Her $2,000 down payment keeps the other two loans below the car's value.",
        },
        {
          type: "fill",
          id: "t2-u4-l2-e13",
          sentence: "A bigger ___ means borrowing less, and a shorter ___ means paying interest for fewer months.",
          answers: ["down payment", "term"],
          bank: ["down payment", "term", "monthly payment", "finance charge", "credit score"],
          explain: "The down payment shrinks the loan, and a shorter term shrinks the time interest is charged. Together they lower the total cost.",
        },
        {
          type: "scenario",
          id: "t2-u4-l2-e14",
          emoji: "🤝",
          setup: "Mei tells the dealer about her credit union offer. He says he can lower her payment to $165.50 by stretching the loan to 84 months at 9.9%. After insurance and gas, her budget allows up to $260 a month for the loan.",
          question: "Which loan should Mei choose?",
          choices: [
            {
              text: "The credit union: $237.15 a month for 48 months",
              best: true,
              outcome: "She pays $11,383.20 in total and owns the car outright in four years. The payment fits under her $260 limit.",
            },
            {
              text: "The dealer's new offer: $165.50 a month for 84 months",
              outcome: "Her payment is the lowest, but she pays $13,902.00 in total, $2,518.80 more than the credit union loan, and stays in debt for seven years.",
            },
            {
              text: "The dealer's first offer: $184.75 a month for 72 months",
              outcome: "She pays $13,302.00 in total, $1,918.80 more than the credit union loan, to get a lower payment she didn't need.",
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 3: BNPL & payday loan traps ---------------- */
    {
      id: "t2-u4-l3",
      title: "BNPL and Payday Loans",
      description: "How quick loans work and what they really cost.",
      exercises: [
        {
          type: "teach",
          id: "t2-u4-l3-e1",
          emoji: "🛍️",
          title: "Buy now, pay later",
          body: "**Buy now, pay later (BNPL)** splits a purchase into a few payments, often four payments two weeks apart. Many pay-in-4 plans charge no interest if every payment is on time.\n\nThe risks: a missed payment can bring a late fee, some BNPL loans can show up on credit reports, and several plans at once are easy to lose track of. Most BNPL services require you to be at least 18.",
          example: "An $80 pair of headphones becomes four $20 payments. Each payment feels small, but you still owe $80.",
        },
        {
          type: "number",
          id: "t2-u4-l3-e2",
          prompt: "You split $180 running shoes into 4 equal payments, with the first one due today. After that first payment, how much do you still owe?",
          answer: 135,
          prefix: "$",
          explain: "Each payment is $180 ÷ 4 = $45. After paying $45 today, you still owe 3 × $45 = $135.",
        },
        {
          type: "tf",
          id: "t2-u4-l3-e3",
          statement: "Buy now, pay later plans can never affect your credit.",
          answer: false,
          explain: "False. Some BNPL loans can show up on credit reports, and missed payments can lead to fees.",
        },
        {
          type: "number",
          id: "t2-u4-l3-e4",
          prompt: "These BNPL payments are all due this month. How much do they add up to?",
          doc: bnplDue,
          answer: 199,
          prefix: "$",
          explain: "$45 + $45 + $32.50 + $32.50 + $22 + $22 = $199. Six small payments add up to more than most people expect.",
        },
        {
          type: "mc",
          id: "t2-u4-l3-e5",
          prompt: "You have $150 in checking until your next paycheck. What is the biggest risk with these plans?",
          doc: bnplDue,
          choices: [
            { text: "Some payments could fail and bring late fees", correct: true },
            { text: "None, since the plans charge no interest", why: "No interest isn't the same as no cost. A failed payment can bring a late fee." },
            { text: "The store will cancel the orders", why: "The purchases stand. You still owe the payments, plus any late fees." },
            { text: "You only need to cover the next payment", why: "All six payments are due this month, $199 in total, which is more than your $150." },
          ],
          explain: "You owe $199 this month and have $150. When payments come out automatically, a shortfall can mean failed payments and late fees. Before adding a plan, add up what is already due.",
        },
        {
          type: "teach",
          id: "t2-u4-l3-e6",
          emoji: "⏱️",
          title: "How payday loans work",
          body: "A **payday loan** is a small loan due in full on your next payday, usually about two weeks away. The fee is often around $15 for every $100 borrowed.\n\nIf you can't repay on time, many lenders let you **roll over** the loan by paying another fee. You still owe the full amount, and the fees keep adding up.",
          doc: paydayTerms,
        },
        {
          type: "number",
          id: "t2-u4-l3-e7",
          prompt: "You can't repay on the first due date, so you roll the loan over 3 times, then repay the $300. Counting the first fee, how much did you pay in fees?",
          doc: paydayTerms,
          answer: 180,
          prefix: "$",
          explain: "The first fee plus 3 rollovers is 4 × $45 = $180 in fees, and you still had to repay the full $300. That is $180 to borrow $300 for eight weeks.",
        },
        {
          type: "teach",
          id: "t2-u4-l3-e8",
          emoji: "🔍",
          funFact: true,
          title: "Where 400% comes from",
          body: "A $15 fee on $100 sounds small, but it covers only **two weeks**.\n\nA year has 26 two-week periods. Borrowing $100 that way all year would cost $15 × 26 = $390 in fees. That is why payday loan APRs are often around **400%**.",
          example: "Credit card APRs are often above 20%. A payday loan at about 400% APR costs roughly 20 times as much per year.",
        },
        {
          type: "fill",
          id: "t2-u4-l3-e9",
          sentence: "A payday loan is usually due on your next ___, and its APR can be around ___.",
          answers: ["payday", "400%"],
          bank: ["payday", "400%", "15%", "40%", "statement date"],
          explain: "Payday loans are due in about two weeks. The $15 fee per $100 covers only those two weeks, which works out to an APR around 400%. The 15% is the two-week fee, not the yearly rate.",
        },
        {
          type: "sort",
          id: "t2-u4-l3-e10",
          prompt: "You need a few hundred dollars before payday. Sort these options.",
          buckets: ["Usually costly", "Usually cheaper"],
          items: [
            { text: "Payday loan, rolled over", bucket: 0 },
            { text: "Several BNPL plans at once", bucket: 0 },
            { text: "No-credit-check cash loan", bucket: 0 },
            { text: "Your emergency fund", bucket: 1 },
            { text: "Small credit union loan", bucket: 1 },
            { text: "Payment plan with the provider", bucket: 1 },
          ],
          explain: "Fast loans with few questions usually carry the highest fees. Savings, a small credit union loan, or a payment plan from the business you owe usually costs far less.",
        },
        {
          type: "scenario",
          id: "t2-u4-l3-e11",
          emoji: "🔧",
          setup: "You're 18, and your car needs a $300 repair before you can drive to work. You have $100 in your emergency fund, and payday is 10 days away. A payday lender nearby advertises cash in 15 minutes.",
          question: "What's the best move?",
          choices: [
            {
              text: "Borrow $300 from the payday lender and repay it on payday",
              outcome: "If everything goes as planned, you pay a $45 fee. If your paycheck comes up short, a rollover adds another $45.",
            },
            {
              text: "Use your $100 and ask the shop about a payment plan for $200",
              best: true,
              outcome: "Many shops offer payment plans. You get the car fixed without loan fees, then rebuild your emergency fund.",
            },
            {
              text: "Put off the repair and miss shifts until payday",
              outcome: "Missed shifts cost you income, and a problem left alone can turn into a more expensive repair.",
            },
          ],
        },
      ],
    },

    /* ---------------- Lesson 4: Paying off debt ---------------- */
    {
      id: "t2-u4-l4",
      title: "Paying Off Debt",
      description: "Avalanche vs. snowball, and how to stay on track.",
      exercises: [
        {
          type: "teach",
          id: "t2-u4-l4-e1",
          emoji: "🧱",
          title: "Start with every minimum",
          body: "If you have more than one debt, first pay at least the **minimum payment** on every one. A missed minimum can bring late fees and hurt your credit.\n\nThen put any extra money toward **one** debt at a time. Focusing your extra money clears one debt sooner, and then you can move on to the next.",
        },
        {
          type: "tf",
          id: "t2-u4-l4-e2",
          statement: "Skipping the minimum on a small debt so you can pay more on a large one is a good strategy.",
          answer: false,
          explain: "False. A skipped minimum can bring a late fee and hurt your credit. Pay every minimum first, then put extra money on one debt.",
        },
        {
          type: "teach",
          id: "t2-u4-l4-e3",
          emoji: "🏔️",
          title: "The avalanche method",
          body: "With the **avalanche** method, extra money goes to the debt with the **highest interest rate** first. When that debt is paid off, move to the next-highest rate.\n\nThis saves the most money in interest, because the most expensive debt shrinks first. The size of each balance doesn't decide the order.",
          doc: yourDebts,
        },
        {
          type: "mc",
          id: "t2-u4-l4-e4",
          prompt: "Using the avalanche method, which debt gets your extra $100 first?",
          doc: yourDebts,
          choices: [
            { text: "Store card ($900 at 24%)", correct: true },
            { text: "Personal loan ($300 at 15%)", why: "That is the smallest balance, which is the snowball choice. Avalanche targets the highest rate." },
            { text: "Car loan ($2,000 at 7%)", why: "It has the largest balance, but also the lowest rate, so it costs you the least per dollar owed." },
          ],
          explain: "The store card charges 24%, the highest rate on the list. Every extra dollar there avoids the most interest.",
        },
        {
          type: "teach",
          id: "t2-u4-l4-e5",
          emoji: "☃️",
          title: "The snowball method",
          body: "With the **snowball** method, extra money goes to the debt with the **smallest balance** first, whatever its rate.\n\nYou pay off a whole debt quickly, and for many people that early progress keeps them motivated. It can cost more interest than avalanche, but a plan you stick with works better than a cheaper plan you give up on.",
        },
        {
          type: "mc",
          id: "t2-u4-l4-e6",
          prompt: "Using the snowball method, which debt gets your extra $100 first?",
          doc: yourDebts,
          choices: [
            { text: "Personal loan ($300 at 15%)", correct: true },
            { text: "Store card ($900 at 24%)", why: "That is the avalanche choice, the highest rate. Snowball targets the smallest balance." },
            { text: "Car loan ($2,000 at 7%)", why: "That is the largest balance. Snowball starts with the smallest." },
          ],
          explain: "The personal loan has the smallest balance, $300. Paying $130 a month on it ($30 minimum plus $100 extra), it is gone in about three months.",
        },
        {
          type: "sort",
          id: "t2-u4-l4-e7",
          prompt: "Avalanche or snowball? Sort each description.",
          buckets: ["Avalanche", "Snowball"],
          items: [
            { text: "Saves the most interest", bucket: 0 },
            { text: "Highest rate first", bucket: 0 },
            { text: "Ignores balance size", bucket: 0 },
            { text: "Quick early wins", bucket: 1 },
            { text: "Smallest balance first", bucket: 1 },
            { text: "Ignores interest rate", bucket: 1 },
          ],
          explain: "Avalanche picks by rate and saves the most money. Snowball picks by balance and gives faster early wins. Both work better than paying only the minimums.",
        },
        {
          type: "teach",
          id: "t2-u4-l4-e8",
          emoji: "❄️",
          funFact: true,
          title: "Why it's called a snowball",
          body: "When a debt is paid off, don't spend the money you were paying on it. **Roll it** into the payment on the next debt.\n\nEach payoff makes the next payment bigger, the way a snowball grows as it rolls downhill. Rolling payments works with the avalanche method too.",
          example: "You were paying $60 a month on a debt that's now gone. Add that $60 to the next debt's payment. Your budget stays the same, and the next debt is paid off sooner.",
        },
        {
          type: "number",
          id: "t2-u4-l4-e9",
          prompt: "With snowball, you pay $130 a month on the personal loan ($30 minimum plus $100 extra). Once it's paid off, you add that $130 to the store card's minimum. What is the new store card payment?",
          doc: yourDebts,
          answer: 165,
          prefix: "$",
          explain: "$35 minimum + $130 rolled over = $165 a month on the store card. Your total debt payments stay the same. They are just aimed at the next debt.",
        },
        {
          type: "scenario",
          id: "t2-u4-l4-e10",
          emoji: "🎯",
          setup: "You have $100 extra each month. You owe $200 on a 0% BNPL plan, $1,500 on a credit card at 25% APR, and $4,000 on a car loan at 6%. You want to pay the least interest possible.",
          question: "Where should the extra $100 go?",
          choices: [
            {
              text: "Pay all minimums, and put the extra $100 on the card",
              best: true,
              outcome: "This is the avalanche method. The 25% card shrinks fastest, which saves the most interest.",
            },
            {
              text: "Pay all minimums, and put the extra $100 on the BNPL plan",
              outcome: "You would clear it quickly, but it charges 0%. Paying it early saves no interest while the 25% card keeps growing.",
            },
            {
              text: "Split the extra $100 evenly across all three",
              outcome: "Each balance shrinks a little, but most of the 25% card balance keeps building interest for longer.",
            },
            {
              text: "Skip the car payment and put everything on the card",
              outcome: "The car loan could charge a late fee, and the missed payment can hurt your credit. Minimums come first.",
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
        type: "mc",
        id: "t2-u4-q-e1",
        prompt: "You take out a $2,000 loan to pay for a welding course. What is the $2,000 called?",
        choices: [
          { text: "The principal", correct: true },
          { text: "The interest", why: "Interest is the extra you pay to borrow. The amount borrowed is the principal." },
          { text: "The down payment", why: "A down payment is cash you pay up front, not money you borrow." },
          { text: "The finance charge", why: "The finance charge is the dollar cost of borrowing. The amount borrowed is the principal." },
        ],
        explain: "The principal is the amount you borrow. Interest is charged on top of it.",
      },
      {
        type: "number",
        id: "t2-u4-q-e2",
        prompt: "Using the Rule of 72, about how many years would a balance at 12% interest take to double if it is never paid down?",
        answer: 6,
        suffix: "years",
        explain: "72 ÷ 12 = 6. Left alone, the balance would be about twice as large in 6 years.",
      },
      {
        type: "mc",
        id: "t2-u4-q-e3",
        prompt: "A car salesperson asks, \"What monthly payment are you looking for?\" Which number matters most when comparing offers?",
        choices: [
          { text: "The total you'll pay over the whole loan", correct: true },
          { text: "The monthly payment", why: "A low payment can come from a long term. Multiply the payment by the number of months to see the total." },
          { text: "The car's sticker price", why: "The price matters, but financing can add thousands. Compare the down payment plus the total of payments." },
          { text: "The length of the loan", why: "The term matters, but it doesn't show the rate or the payment. The total cost combines all three." },
        ],
        explain: "The down payment plus the monthly payment times the number of months is what the car really costs.",
      },
      {
        type: "number",
        id: "t2-u4-q-e4",
        prompt: "A car loan is $300 a month for 48 months, and you put $1,500 down. What is the total cost of the car?",
        answer: 15900,
        prefix: "$",
        explain: "$300 × 48 = $14,400 in payments. Add the $1,500 down payment for a total of $15,900.",
      },
      {
        type: "tf",
        id: "t2-u4-q-e5",
        statement: "At the same interest rate, a longer car loan usually means paying less interest overall.",
        answer: false,
        explain: "False. A longer loan has smaller payments, but interest is charged for more months, so the total interest goes up.",
      },
      {
        type: "mc",
        id: "t2-u4-q-e6",
        prompt: "You split $200 headphones into 4 BNPL payments and miss the third one. What could happen?",
        choices: [
          { text: "A late fee, and possibly an effect on your credit", correct: true },
          { text: "Nothing, since the plan charges no interest", why: "No interest isn't the same as no penalties. Missed payments can bring fees, and some BNPL loans can show up on credit reports." },
          { text: "The rest of the plan is canceled", why: "You still owe the remaining payments, possibly plus a fee." },
          { text: "The missed amount moves to the last payment, with no fee", why: "You can't count on that. Missed BNPL payments can bring late fees." },
        ],
        explain: "BNPL is easy to start, but a missed payment can bring a late fee, and some BNPL loans can show up on your credit report.",
      },
      {
        type: "number",
        id: "t2-u4-q-e7",
        prompt: "A payday lender charges $15 for every $100 borrowed. What is the fee to borrow $400 for two weeks?",
        answer: 60,
        prefix: "$",
        explain: "$400 is four $100s, so the fee is 4 × $15 = $60 for two weeks. That works out to an APR around 400%.",
      },
      {
        type: "fill",
        id: "t2-u4-q-e8",
        sentence: "Payday loans can have APRs around ___, and paying a fee to push back the due date is called a ___.",
        answers: ["400%", "rollover"],
        bank: ["400%", "rollover", "15%", "40%", "grace period", "refund"],
        explain: "The two-week fees on payday loans add up to an APR around 400% or higher. Each rollover adds a new fee while the original amount is still owed.",
      },
      {
        type: "tf",
        id: "t2-u4-q-e9",
        statement: "The snowball method (smallest balance first) always saves the most money on interest.",
        answer: false,
        explain: "False. The avalanche method (highest rate first) saves the most interest. Snowball can cost more, but its early wins help many people stay motivated.",
      },
      {
        type: "scenario",
        id: "t2-u4-q-e10",
        emoji: "🎂",
        setup: "You get $300 in birthday money and already have a small emergency fund. You owe $250 on a store card at 28% APR and $3,000 on a car loan at 6%.",
        question: "What's the best use of the $300?",
        choices: [
          {
            text: "Pay off the store card and save the other $50",
            best: true,
            outcome: "The card has the highest rate and the smallest balance, so both methods point to it. The 28% interest is gone.",
          },
          {
            text: "Put all $300 toward the car loan",
            outcome: "The car loan shrinks a little, but the card keeps charging 28% on its full balance.",
          },
          {
            text: "Pay $150 on each debt",
            outcome: "Both balances shrink, but $100 stays on the 28% card and keeps building interest.",
          },
          {
            text: "Add all of it to your emergency fund",
            outcome: "Savings matter, but you already have a cushion, and the card's 28% rate costs far more than savings would earn.",
          },
        ],
      },
    ],
  },
}

export default unit
