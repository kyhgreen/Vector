import type { Doc, Unit } from "../types"

/* ---------- Documents (repeated on every exercise that needs them) ---------- */

// Lesson 2 story: Priya compares the same calculator at four stores.
const calculatorPrices: Doc = {
  kind: "table",
  title: "Same calculator, four stores",
  subtitle: "Model SC-200 school calculator",
  rows: [
    { label: "BrightMart (in store)", value: "$11.49" },
    { label: "Corner Books (in store)", value: "$12.99" },
    { label: "Maple Street Office (in store)", value: "$14.99" },
    { label: "ZipCart (online)", value: "$9.99" },
    { label: "Shipping", value: "$4.99", indent: true },
  ],
  note: "ZipCart: free shipping on orders of $25 or more.",
}

// Lesson 2 story: the pencil shelf at BrightMart. 25, 20, and 25 cents per pencil.
const pencilShelf: Doc = {
  kind: "table",
  title: "BrightMart shelf: pencils",
  subtitle: "Same brand and pencils in every pack",
  rows: [
    { label: "12-pack", value: "$3.00" },
    { label: "30-pack", value: "$6.00" },
    { label: "50-pack", value: "$12.50" },
  ],
}

// Lesson 2 story: Priya's receipt. 11.49 + 6.00 + 2.50 + 8.00 = 27.99; 6% tax = 1.68; total 29.67.
const priyaReceipt: Doc = {
  kind: "receipt",
  title: "BrightMart receipt",
  subtitle: "Register 3",
  rows: [
    { label: "Calculator SC-200", value: "$11.49" },
    { label: "Pencils, 30-pack", value: "$6.00" },
    { label: "Glue stick", value: "$2.50" },
    { label: "Notebooks (4 at $2.00)", value: "$8.00" },
    { label: "Subtotal", value: "$27.99" },
    { label: "Sales tax (6%)", value: "$1.68" },
    { label: "Total", value: "$29.67", strong: true },
  ],
}

// Lesson 3: gem bundles that don't match the item price.
const gemShop: Doc = {
  kind: "table",
  title: "Starfall Arena: gem shop",
  subtitle: "Comet Rider skin: 1,200 gems",
  rows: [
    { label: "500 gems", value: "$5.00" },
    { label: "1,000 gems", value: "$9.00" },
    { label: "2,000 gems", value: "$17.00" },
  ],
  note: "Gems can't be turned back into money.",
}

// Lesson 3: one month of small purchases. 5 + 2 + 2 + 5 + 10 + 2 = 26.
const marchPurchases: Doc = {
  kind: "statement",
  title: "Starfall Arena: March purchases",
  subtitle: "Paid with: Mom's saved card",
  rows: [
    { label: "Mar 2 · 500 gems", value: "$5.00" },
    { label: "Mar 6 · Mystery chest", value: "$2.00" },
    { label: "Mar 9 · Mystery chest", value: "$2.00" },
    { label: "Mar 14 · 500 gems", value: "$5.00" },
    { label: "Mar 20 · Season pass", value: "$10.00" },
    { label: "Mar 27 · Mystery chest", value: "$2.00" },
  ],
}

// Lesson 4: a fake prize notice.
const prizeNotice: Doc = {
  kind: "offer",
  title: "Prize notice: Nova Pro game console",
  subtitle: "Sent by DM from @Prize_Claim_Center",
  rows: [
    { label: "Prize", value: "Nova Pro console" },
    { label: "Retail value", value: "$499.99" },
    { label: "Your cost", value: "$0.00", strong: true },
    { label: "Shipping fee", value: "$20.00" },
    { label: "Pay shipping with", value: "Gift card only" },
    { label: "Also needed", value: "Home address and phone" },
    { label: "Claim within", value: "1 hour" },
  ],
  note: "Winner chosen at random from active players.",
}

// Quiz: cereal shelf. 30, 25, and 27 cents per ounce.
const cerealShelf: Doc = {
  kind: "table",
  title: "Corner Market shelf: oat cereal",
  subtitle: "Same cereal, three sizes",
  rows: [
    { label: "10-ounce box", value: "$3.00" },
    { label: "16-ounce box", value: "$4.00" },
    { label: "24-ounce box", value: "$6.48" },
  ],
}

const unit: Unit = {
  id: "t1-u5",
  tier: 1,
  order: 5,
  title: "Smart Shopping & Scams",
  tagline: "Learn how ads and sales push you to spend, and how to spot a scam.",
  color: "orange",
  emoji: "🛒",

  guidebook: {
    intro:
      "Ads, store signs, game shops, and scammers all want your money, and each one goes about it differently. In this unit you'll learn how each one works, how to compare prices, and how to keep your accounts and personal info safe.",
    keyIdeas: [
      {
        title: "Ads are made to sell",
        body: "Ads use music, famous faces, and \"today only\" pressure to make you feel something. Before you buy, look for facts you can check, like the price, reviews from regular buyers, and the return policy.",
      },
      {
        title: "Paid posts should say so",
        body: "If a creator is paid or gets free products to promote something, the FTC says they should clearly label it, with tags like #ad or \"paid partnership.\" A labeled post is still an ad, even if the creator really likes the product.",
      },
      {
        title: "Compare the total price",
        body: "Check a few stores, and count shipping and sales tax. The unit price (price ÷ amount) shows which size is the better deal. The biggest package isn't always the cheapest per item.",
      },
      {
        title: "Sale signs aren't proof",
        body: "A \"was\" price may never have been the real price. \"2 for $5\" can cost the same as buying one at a time. A free shipping minimum can get you to spend more than the shipping would have cost.",
      },
      {
        title: "Game currency is real money",
        body: "Turn gems or coins back into dollars before you buy. Bundles often leave you with leftover gems, and loot boxes are random, so a rare prize can cost a lot. Set a limit, and ask before using a family card.",
      },
      {
        title: "Scams follow a pattern",
        body: "Scams promise something big, rush you, and ask for your password, a login code, or a gift card payment. Real companies never ask you to pay with gift cards. Don't tap the link, tell a trusted adult, and report it at ReportFraud.ftc.gov.",
      },
    ],
    funFacts: [
      "The \"ph\" in phishing is a play on \"fishing,\" since scammers send out bait and wait for someone to bite.",
      "Marketers call prices that end in .99 \"charm pricing.\" $9.99 can feel closer to $9 than to $10, even though it's only one cent less than $10.",
      "More than 100 years ago, a con called the \"Spanish Prisoner\" used letters asking people to pay to free a rich prisoner, who would supposedly reward them.",
      "Grocery stores often put pricier brands at eye level, so it's worth checking the higher and lower shelves too.",
      "In 2018, Belgium's Gaming Commission said paid loot boxes count as gambling under its laws.",
      "With a 1% drop rate, more than 1 in 3 players who open 100 boxes still won't get the prize.",
    ],
    words: [
      { term: "Influencer", meaning: "A creator whose posts can change what fans buy." },
      { term: "Sponsored", meaning: "Paid for by a brand. A sponsored post is an ad." },
      { term: "Comparison shopping", meaning: "Checking the price of the same item in a few places before you buy." },
      { term: "Unit price", meaning: "The cost for one unit, like one ounce or one pencil. Price ÷ amount." },
      { term: "Sales tax", meaning: "Money added to the price at the register in most states. The rate depends on where you live." },
      { term: "Charm pricing", meaning: "Ending prices in .99 so they feel lower." },
      { term: "In-game currency", meaning: "Gems or coins in a game, often bought with real money." },
      { term: "Loot box", meaning: "A mystery prize in a game that you pay for." },
      { term: "Drop rate", meaning: "The chance of getting a certain prize from a loot box." },
      { term: "Phishing", meaning: "A fake message that tries to trick you into sharing your info." },
      { term: "Scam", meaning: "A trick to take your money, your account, or your info." },
    ],
  },

  lessons: [
    /* ---------------- Lesson 1: Ads & influencers (9) ---------------- */
    {
      id: "t1-u5-l1",
      title: "How Ads Work on You",
      description: "What ads are for, the tricks they use, and how to spot a paid post.",
      exercises: [
        {
          type: "teach",
          id: "t1-u5-l1-e1",
          emoji: "📺",
          title: "What an ad is for",
          body: "An **ad** (short for advertisement) is a message a company pays for to get you to buy something.\n\nAds show up in videos, games, apps, and on the back of cereal boxes. The people who make them study what gets your attention and what makes you want things.",
          example: "A sneaker ad shows a player jumping in slow motion while loud music plays. It doesn't tell you the price, the sizes, or how long the shoes last. It is built to make you feel something.",
        },
        {
          type: "mc",
          id: "t1-u5-l1-e2",
          prompt: "What is the main goal of almost every ad?",
          choices: [
            { text: "To get you to want the product and buy it", correct: true },
            { text: "To give you the facts you need to compare products", why: "Ads share some facts, but usually only the ones that help sell. To compare fairly, you need prices and reviews from other places too." },
            { text: "To entertain you, like a short video", why: "The jokes and music are real, but they have a purpose. A funny ad is easier to remember, and so is the brand." },
            { text: "To tell you which product is the best one", why: "Every company says its product is great. An ad can't tell you how it compares with the others." },
          ],
          explain: "Ads exist to sell. That doesn't make them bad, but it means you should look for real information before you decide.",
        },
        {
          type: "teach",
          id: "t1-u5-l1-e3",
          emoji: "🎯",
          title: "Four common ad tricks",
          body: "Most ads use a few of the **same tricks**:\n- Hype: exciting music, slow motion, everyone smiling\n- Hurry: \"Today only!\" or \"Almost sold out!\"\n- Everyone has it: making you feel left out\n- Famous face: a star using the product\n\nWhen you can name the trick, it's easier to stop and think before you buy.",
        },
        {
          type: "match",
          id: "t1-u5-l1-e4",
          prompt: "Match each trick to an example.",
          pairs: [
            { left: "Hurry", right: "\"Sale ends in 10 minutes!\"" },
            { left: "Everyone has it", right: "\"Every kid at school has one!\"" },
            { left: "Famous face", right: "A pro athlete eating the cereal" },
            { left: "Hype", right: "Fireworks, slow motion, and loud music" },
          ],
          explain: "Ads for very different products use these same tricks. Spotting them gives you a moment to think.",
        },
        {
          type: "tf",
          id: "t1-u5-l1-e5",
          statement: "If an ad says \"limited time only,\" the deal will never come back after it ends.",
          answer: false,
          explain: "Not necessarily. Many \"limited time\" deals come back, or a similar sale shows up later. The goal is to get you to decide quickly, before you compare.",
        },
        {
          type: "sort",
          id: "t1-u5-l1-e6",
          prompt: "Is it an ad trick, or information you can check?",
          buckets: ["Ad trick", "Can check"],
          items: [
            { text: "Exciting music and slow motion", bucket: 0 },
            { text: "\"Everyone is getting one!\"", bucket: 0 },
            { text: "\"Only 2 hours left!\"", bucket: 0 },
            { text: "A star holding it", bucket: 0 },
            { text: "The price", bucket: 1 },
            { text: "Battery lasts 10 hours", bucket: 1 },
            { text: "Reviews from many buyers", bucket: 1 },
            { text: "30-day return policy", bucket: 1 },
          ],
          explain: "Tricks work on how you feel. Facts like the price, battery life, reviews, and return rules can be checked and compared. Use those to decide.",
        },
        {
          type: "teach",
          id: "t1-u5-l1-e7",
          emoji: "🤳",
          title: "When a post is really an ad",
          body: "An **influencer** is a creator whose posts can change what fans buy.\n\nBrands often pay creators, or send them free products, to post about something. In the US, the FTC (a government agency that protects shoppers) says creators should clearly tell you, with a label like **#ad** or \"paid partnership.\" The label should be easy to see, not buried in a long list of hashtags.",
        },
        {
          type: "mc",
          id: "t1-u5-l1-e8",
          prompt: "A creator you like posts, \"Best headphones I've ever used! #sponsored\". What does #sponsored tell you?",
          choices: [
            { text: "A brand paid them or gave them something for the post", correct: true },
            { text: "They bought the headphones with their own money", why: "That would be a regular review. #sponsored means a brand is involved." },
            { text: "The headphones passed an official quality test", why: "No test is involved. The tag tells you who paid for the post, not how good the product is." },
            { text: "The creator's opinion must be fake", why: "Not necessarily. Paid creators can still like a product. The tag tells you money or free products were involved, so the opinion may not be neutral." },
          ],
          explain: "#sponsored and #ad both mean the post is an ad. The creator may really like the headphones, but they were also paid, so check reviews from regular buyers before you decide.",
        },
        {
          type: "scenario",
          id: "t1-u5-l1-e9",
          emoji: "🖱️",
          setup: "Your favorite streamer says a $60 glowing gaming mouse made her much better at the game. A small #sponsored tag is on the video. You have exactly $60 saved for a game you've wanted for months.",
          question: "What's your best move?",
          choices: [
            { text: "Buy the mouse today in case the deal ends", outcome: "The mouse works fine, but your aim is about the same as before. The $60 you saved for the game is gone." },
            { text: "Wait a day and read reviews from regular buyers", best: true, outcome: "Reviews say it's a decent mouse, but not a big upgrade. Your old mouse works, so you buy the game you saved for." },
            { text: "Buy it now and return it if it doesn't help", outcome: "You find out the store only gives store credit for opened items. Your $60 is now stuck at that store." },
          ],
        },
      ],
    },

    /* ---------------- Lesson 2: Comparison shopping, unit prices & sale tricks (14, connected story) ---------------- */
    {
      id: "t1-u5-l2",
      title: "Priya's Supply Run",
      description: "Follow one shopping trip: compare stores, unit prices, sale signs, and tax.",
      exercises: [
        {
          type: "teach",
          id: "t1-u5-l2-e1",
          emoji: "🎒",
          title: "Shop around first",
          body: "Priya is 12. She has **$30** from her birthday to buy school supplies: a calculator, pencils, a glue stick, and 4 notebooks.\n\nBefore she buys anything, she does some **comparison shopping**. That means checking the price of the same item in a few places. The same calculator can cost a few dollars more or less depending on where you buy it.",
        },
        {
          type: "mc",
          id: "t1-u5-l2-e2",
          prompt: "Priya checks four stores for the same calculator. Which one has the lowest total cost?",
          doc: calculatorPrices,
          choices: [
            { text: "BrightMart, $11.49", correct: true },
            { text: "ZipCart, $9.99", why: "ZipCart has the lowest price tag, but shipping adds $4.99. That makes the total $14.98." },
            { text: "Corner Books, $12.99", why: "That's $1.50 more than BrightMart for the same calculator." },
            { text: "Maple Street Office, since higher prices mean better quality", why: "It's the same calculator model at every store. The higher price doesn't buy anything extra." },
          ],
          explain: "Compare the total you'll actually pay. ZipCart's $9.99 becomes $14.98 with shipping, so BrightMart's $11.49 is the lowest.",
        },
        {
          type: "number",
          id: "t1-u5-l2-e3",
          prompt: "How much does Priya save by buying the calculator at BrightMart instead of Maple Street Office?",
          doc: calculatorPrices,
          answer: 3.5,
          prefix: "$",
          explain: "$14.99 minus $11.49 is $3.50. A few minutes of checking left her more money for the rest of her list.",
        },
        {
          type: "teach",
          id: "t1-u5-l2-e4",
          emoji: "🧮",
          title: "Find the unit price",
          doc: pencilShelf,
          body: "Next, pencils. BrightMart sells the same pencils in three pack sizes. To compare them, Priya finds the **unit price**: the cost of one item.\n\nUnit price = price ÷ number of items\n\nMany stores print the unit price on the shelf tag in small type.",
          example: "A 10-pack of erasers for $2.00 costs $2.00 ÷ 10 = 20 cents per eraser.",
        },
        {
          type: "number",
          id: "t1-u5-l2-e5",
          prompt: "How much does one pencil cost in the 12-pack? Answer in cents.",
          doc: pencilShelf,
          answer: 25,
          suffix: "cents",
          explain: "$3.00 ÷ 12 = $0.25, which is 25 cents per pencil.",
        },
        {
          type: "mc",
          id: "t1-u5-l2-e6",
          prompt: "Which pack has the lowest price per pencil?",
          doc: pencilShelf,
          choices: [
            { text: "The 30-pack", correct: true },
            { text: "The 50-pack, because bigger packs cost less per item", why: "Not this time. $12.50 ÷ 50 = 25 cents per pencil, the same as the 12-pack." },
            { text: "The 12-pack, because it has the lowest price", why: "It has the lowest price tag, but that only buys 12 pencils. Per pencil, it costs 25 cents." },
            { text: "All three cost the same per pencil", why: "Two of them do (25 cents each), but the 30-pack is cheaper: $6.00 ÷ 30 = 20 cents." },
          ],
          explain: "The 30-pack costs 20 cents per pencil. Priya goes through a lot of pencils, so she buys it. A low unit price only helps if you'll actually use what you buy.",
        },
        {
          type: "tf",
          id: "t1-u5-l2-e7",
          statement: "The biggest package on the shelf always has the lowest unit price.",
          answer: false,
          explain: "Bigger packs are often cheaper per item, but not always. On Priya's shelf, the 50-pack cost the same per pencil as the 12-pack. Checking the unit price is the only way to know.",
        },
        {
          type: "teach",
          id: "t1-u5-l2-e8",
          emoji: "🏷️",
          title: "Watch for sale tricks",
          body: "Stores use signs and prices to get you to spend more:\n- \"Was\" prices that may never have been the real price\n- \"2 for $5\" when one costs $2.50 anyway\n- Free shipping once your order reaches a set amount\n- Prices like $14.99 that feel closer to $14 than $15, called **charm pricing**\n\nA deal only saves you money if it's on something you need.",
        },
        {
          type: "mc",
          id: "t1-u5-l2-e9",
          prompt: "BrightMart's sign says \"Glue sticks, 2 for $5.00.\" The tag below says $2.50 each. Priya needs one. What should she do?",
          choices: [
            { text: "Buy one for $2.50", correct: true },
            { text: "Buy two, since the sign says it's a deal", why: "2 for $5.00 is $2.50 each, the same as buying one. She'd spend $2.50 more on a glue stick she doesn't need." },
            { text: "Wait for glue sticks to go on sale", why: "The sign makes it look like a sale already, and the price per stick is the same either way. She needs one now, so waiting doesn't help." },
          ],
          explain: "\"2 for $5.00\" sounds like a discount, but it's the same $2.50 per glue stick. Priya buys one for $2.50.",
        },
        {
          type: "mc",
          id: "t1-u5-l2-e10",
          prompt: "A big sign says \"Notebooks: Was $4.00, now $2.00!\" Priya has seen the same notebooks for $2.00 at other stores for months. What does that tell her?",
          choices: [
            { text: "$2.00 is the usual price, not a special deal", correct: true },
            { text: "She saves $8.00 on her 4 notebooks", why: "That would only be true if $4.00 was ever the real price. Other stores charge $2.00, so she isn't saving anything." },
            { text: "It's a rare deal, so she should stock up", why: "If the price is always $2.00, there's no reason to rush or buy extra." },
            { text: "The other stores must be having a sale too", why: "When every store has charged $2.00 for months, that's the regular price." },
          ],
          explain: "A \"was\" price only matters if the item really sold for that much. Priya buys the 4 notebooks she needs for $8.00 and nothing extra.",
        },
        {
          type: "scenario",
          id: "t1-u5-l2-e11",
          emoji: "📦",
          doc: calculatorPrices,
          setup: "Priya's friend has an idea: \"Order the calculator from ZipCart and add a $16 pack of gel pens. Then shipping is free.\" Priya doesn't need gel pens.",
          question: "What should Priya do?",
          choices: [
            { text: "Add the gel pens to get free shipping", outcome: "She pays $25.99 for the order. That's $14.50 more than the BrightMart calculator, for pens she didn't need." },
            { text: "Order just the calculator and pay the shipping", outcome: "She pays $14.98, which is $3.49 more than buying it at BrightMart." },
            { text: "Buy the calculator at BrightMart for $11.49", best: true, outcome: "She pays the lowest total for the calculator and keeps the rest of her money for the other supplies on her list." },
          ],
        },
        {
          type: "fill",
          id: "t1-u5-l2-e12",
          sentence: "Maple Street's price of $14.99 is an example of ___ pricing. It is really about $___.",
          answers: ["charm", "15"],
          bank: ["charm", "15", "14", "unit", "sale"],
          explain: "Prices that end in .99 are called charm pricing. $14.99 is only one cent less than $15, even though it can feel closer to $14.",
        },
        {
          type: "mc",
          id: "t1-u5-l2-e13",
          prompt: "Priya added up her price tags and got $27.99. Why is her receipt total $29.67?",
          doc: priyaReceipt,
          choices: [
            { text: "Sales tax was added at the register", correct: true },
            { text: "The store charged her for a bag", why: "Some stores do charge for bags, but there's no bag fee on this receipt. Look at the line under the subtotal." },
            { text: "The calculator rang up at a higher price", why: "The calculator rang up at $11.49, the same as the shelf. The extra $1.68 is listed as sales tax." },
            { text: "The total was rounded up to the next dollar", why: "$29.67 isn't a whole dollar amount. The extra $1.68 is the 6% sales tax." },
          ],
          explain: "In most states, sales tax is added at the register, so you pay a bit more than the price tags. The rate depends on where you live. Here, 6% of $27.99 is about $1.68.",
        },
        {
          type: "number",
          id: "t1-u5-l2-e14",
          prompt: "Priya pays with her $30.00. How much change does she get?",
          doc: priyaReceipt,
          answer: 0.33,
          prefix: "$",
          explain: "$30.00 minus $29.67 is $0.33. She got everything on her list, but only because she compared prices. With the Maple Street calculator, her subtotal alone would have been $31.49, over her $30.",
        },
      ],
    },

    /* ---------------- Lesson 3: In-game purchases & loot boxes (12) ---------------- */
    {
      id: "t1-u5-l3",
      title: "Gems, Coins & Loot Boxes",
      description: "Turn game currency into real dollars and understand the odds.",
      exercises: [
        {
          type: "teach",
          id: "t1-u5-l3-e1",
          emoji: "💎",
          title: "Game money is real money",
          body: "Many games sell **in-game currency**, like gems or coins, for real money.\n\nThose numbers can make spending feel smaller. \"800 gems\" doesn't sound like much, but if 100 gems cost $1, that's $8. Before you buy anything in a game, turn the price back into dollars.",
          example: "If 100 coins cost $1, a 2,000-coin outfit costs 2,000 ÷ 100 = $20.",
        },
        {
          type: "number",
          id: "t1-u5-l3-e2",
          prompt: "In a game, 100 gems cost $1. A dragon skin costs 1,500 gems. How much is that in real dollars?",
          answer: 15,
          prefix: "$",
          explain: "1,500 ÷ 100 = 15, so the skin costs $15. That's the same as spending $15 at any store.",
        },
        {
          type: "tf",
          id: "t1-u5-l3-e3",
          statement: "Paying with gems instead of dollars means you're spending less real money.",
          answer: false,
          explain: "The gems were bought with real money, so the cost is the same. Paying in gems just makes it harder to notice how much you're spending.",
        },
        {
          type: "teach",
          id: "t1-u5-l3-e4",
          emoji: "🧩",
          title: "Bundles that don't fit",
          doc: gemShop,
          body: "Games usually sell gems in set bundles, and the bundles often don't match item prices.\n\nThis skin costs 1,200 gems, but there's no 1,200-gem bundle. You have to buy more than you need. The **leftover gems** stay in your account, which makes it easy to spend again later.",
        },
        {
          type: "mc",
          id: "t1-u5-l3-e5",
          prompt: "You want the Comet Rider skin for 1,200 gems. What's the cheapest way to get enough gems?",
          doc: gemShop,
          choices: [
            { text: "One 1,000-gem pack and one 500-gem pack: $14", correct: true },
            { text: "One 1,000-gem pack: $9", why: "1,000 gems is 200 short of the 1,200 you need." },
            { text: "Three 500-gem packs: $15", why: "That gets you 1,500 gems, but it costs $1 more than a 1,000 pack plus a 500 pack." },
            { text: "One 2,000-gem pack: $17", why: "The big pack is cheaper per gem, but you'd spend $3 more and end up with 800 gems you didn't need." },
          ],
          explain: "$9 + $5 = $14 for 1,500 gems. That's the least you can spend to reach 1,200, so getting this skin costs you $14.",
        },
        {
          type: "number",
          id: "t1-u5-l3-e6",
          prompt: "You buy the 1,000-gem and 500-gem packs, then buy the 1,200-gem skin. How many gems are left over?",
          doc: gemShop,
          answer: 300,
          suffix: "gems",
          explain: "1,000 + 500 = 1,500 gems, and 1,500 minus 1,200 is 300. Leftover gems are easy to forget until a new item comes out and you only need \"a few more.\"",
        },
        {
          type: "teach",
          id: "t1-u5-l3-e7",
          emoji: "🎁",
          title: "Loot boxes and drop rates",
          body: "A **loot box** is a mystery prize you pay for. You don't know what's inside until you open it.\n\nSome games list the **drop rate**: the chance of getting each prize. A 1% drop rate means about 1 out of every 100 boxes has that prize, on average. That's an average, not a promise. Each box has the same 1% chance, no matter how many you've opened before.",
        },
        {
          type: "mc",
          id: "t1-u5-l3-e8",
          prompt: "A rare pet has a 1% drop rate. You've opened 60 boxes without getting it. Which is true?",
          choices: [
            { text: "Your next box still has a 1% chance", correct: true },
            { text: "Your next box is more likely to have it, since you're due", why: "This is a very common mistake. Each box has the same 1% chance, no matter how many you've already opened." },
            { text: "You're sure to get it within 40 more boxes", why: "1 in 100 is an average, not a promise. It can take far more than 100 boxes in total." },
            { text: "Over 60 boxes, you had a 60% chance of getting it", why: "Chances don't add up that way. The chance of getting it at least once in 60 boxes is only about 45%, so missing it is normal." },
          ],
          explain: "With a 1% chance, even 100 boxes isn't enough for everyone. More than 1 in 3 players who open 100 boxes still won't get the prize.",
        },
        {
          type: "number",
          id: "t1-u5-l3-e9",
          prompt: "Each box costs $2. If it takes 100 boxes to get the pet, how many dollars is that?",
          answer: 200,
          prefix: "$",
          explain: "100 × $2 = $200 for one pet. Some players need fewer boxes and some need many more, so it could cost a lot more than $200.",
        },
        {
          type: "teach",
          id: "t1-u5-l3-e10",
          emoji: "⚖️",
          title: "One country's ruling",
          funFact: true,
          body: "Countries don't all agree about loot boxes. In 2018, Belgium's Gaming Commission said paid loot boxes count as gambling under its laws.\n\nIts reasoning was that players pay money for a random chance at a prize.",
        },
        {
          type: "number",
          id: "t1-u5-l3-e11",
          prompt: "You've been buying things in a game with your mom's saved card. This is your March history. How much did you spend in all?",
          doc: marchPurchases,
          answer: 26,
          prefix: "$",
          explain: "$5 + $2 + $2 + $5 + $10 + $2 = $26. None of the purchases seemed big on its own, but together they add up.",
        },
        {
          type: "scenario",
          id: "t1-u5-l3-e12",
          emoji: "💳",
          doc: marchPurchases,
          setup: "You and your mom agreed on a $15 limit for March, but you never added up your purchases. Now a $5 Mega Chest is on sale for the next hour.",
          question: "What should you do?",
          choices: [
            { text: "Buy it, since it's only $5 and the sale ends soon", outcome: "Your March total becomes $31, more than twice the limit. Your mom finds out when the card bill comes." },
            { text: "Skip it and don't mention the $26", outcome: "You avoid a hard talk for now, but your mom will still see the extra $11 on her bill, and it's harder to explain later." },
            { text: "Skip it, tell your mom you went over, and make a plan", best: true, outcome: "She isn't happy about the extra $11, but she's glad you told her. You agree to check the purchase history every week." },
          ],
        },
      ],
    },

    /* ---------------- Lesson 4: Spotting scams (13) ---------------- */
    {
      id: "t1-u5-l4",
      title: "Spot the Scam",
      description: "Fake prizes, phishing messages, and how to protect your info.",
      exercises: [
        {
          type: "teach",
          id: "t1-u5-l4-e1",
          emoji: "🚩",
          title: "Too good to be true",
          body: "A **scam** is a trick to take your money, your account, or your personal info.\n\nMany scams start with an offer that sounds amazing: a free phone, free Robux or V-Bucks, or a prize from a contest you never entered. If an offer sounds too good to be true, it probably is.",
        },
        {
          type: "tf",
          id: "t1-u5-l4-e2",
          statement: "A website offering free game currency is safe to use if it looks professional and has good reviews.",
          answer: false,
          explain: "Scam sites can look polished, and fake reviews are easy to post. \"Free currency generators\" are a common way to steal accounts. Only get game currency through the game's official store.",
        },
        {
          type: "teach",
          id: "t1-u5-l4-e3",
          emoji: "🚨",
          title: "Scam red flags",
          body: "Scams often follow the same pattern. Watch for:\n- A prize or deal that seems too good\n- Pressure to act fast: \"Reply in 10 minutes or lose it!\"\n- A request for your password or login code\n- Payment by gift card or crypto\n\n**Real companies never ask you to pay with gift cards.**",
        },
        {
          type: "sort",
          id: "t1-u5-l4-e4",
          prompt: "Is this a risky move or a safe move?",
          buckets: ["Risky", "Safe"],
          items: [
            { text: "Sharing your login code", bucket: 0 },
            { text: "Tapping a \"you won\" link", bucket: 0 },
            { text: "Paying a fee with gift cards", bucket: 0 },
            { text: "Trying a free gems generator", bucket: 0 },
            { text: "Checking inside the real app", bucket: 1 },
            { text: "Telling a trusted adult", bucket: 1 },
            { text: "Reporting the message", bucket: 1 },
            { text: "Blocking the account", bucket: 1 },
          ],
          explain: "A scam only works if you do what the message asks. The safe moves keep your money and your login away from the scammer.",
        },
        {
          type: "teach",
          id: "t1-u5-l4-e5",
          emoji: "📜",
          title: "An old trick",
          funFact: true,
          body: "Scams aren't new. More than 100 years ago, a con called the \"Spanish Prisoner\" used letters asking people to pay to free a rich prisoner, who would supposedly reward them.\n\nMany fake prize messages today work the same way: pay a little now for a big reward that never comes.",
        },
        {
          type: "teach",
          id: "t1-u5-l4-e6",
          emoji: "🎣",
          title: "Phishing messages",
          body: "**Phishing** is a fake email, text, or DM that pretends to be from someone you trust, like a game, your school, or a bank.\n\nThe goal is to get you to tap a link and type your password. Warning signs include spelling mistakes, strange web addresses, and scary words like \"URGENT\" or \"account locked.\"",
          example: "\"Ur acount will be deleted in 1 hour. Verify now: starfall-help-desk.biz\" The spelling is off, the address isn't the game's real site, and the message is trying to rush you.",
        },
        {
          type: "mc",
          id: "t1-u5-l4-e7",
          prompt: "You get a text: \"Your game account is locked. Tap here and enter your password to unlock it.\" What should you do?",
          choices: [
            { text: "Don't tap. Open the real app yourself to check.", correct: true },
            { text: "Tap the link just to see if it looks real", why: "Fake login pages are made to look exactly like the real one, so looking real proves nothing." },
            { text: "Reply and ask if the message is real", why: "A scammer will say yes. Replying can also tell them your number is active." },
            { text: "Enter your password, since the text uses the game's name", why: "Anyone can type a game's name or copy its logo. That doesn't make the message real." },
          ],
          explain: "If you're worried about your account, skip the link and go to the app or website the way you normally do. If something is really wrong, you'll see it there.",
        },
        {
          type: "match",
          id: "t1-u5-l4-e8",
          prompt: "Match each scam to the kind of message it sends.",
          pairs: [
            { left: "Phishing", right: "\"Verify your password at this link\"" },
            { left: "Fake giveaway", right: "\"You won! Just pay for shipping.\"" },
            { left: "Gems generator", right: "\"Free currency, just log in here\"" },
            { left: "Gift card ask", right: "\"Pay this fee with gift cards\"" },
          ],
          explain: "Each one is after the same things: your money or your login.",
        },
        {
          type: "teach",
          id: "t1-u5-l4-e9",
          emoji: "🔐",
          title: "Protect your info",
          body: "Some information lets a stranger get into your accounts or find you. Never share:\n- Your passwords\n- **Login codes**, the one-time codes sent to your phone or email (also called 2-factor codes)\n- Your home address or school, with people you only know online\n\nThat includes someone who says they work for the game. Real game staff won't ask for your password or code.",
        },
        {
          type: "tf",
          id: "t1-u5-l4-e10",
          statement: "A real game company might message you and ask for your login code to \"verify your account.\"",
          answer: false,
          explain: "Real companies don't ask for that code. It's sent to you so that only you can get in, so anyone asking for it is trying to get into your account.",
        },
        {
          type: "mc",
          id: "t1-u5-l4-e11",
          prompt: "You never entered a contest, but you got this notice. It says the console is free. What would claiming it actually cost you?",
          doc: prizeNotice,
          choices: [
            { text: "$20 in gift cards, plus your address and phone number", correct: true },
            { text: "$0, since it says your cost is $0.00", why: "The notice also asks for a $20 fee and your personal info. The word \"free\" doesn't match the details." },
            { text: "Only $20, a small price for a $499.99 console", why: "The $20 isn't the only cost. You'd also give a stranger your home address and phone number, and the console would never arrive." },
          ],
          explain: "You never entered, real prizes don't require gift card payments, and the 1-hour deadline is there to rush you. Claiming it would cost you $20 and your personal info, and you'd get nothing back.",
        },
        {
          type: "scenario",
          id: "t1-u5-l4-e12",
          emoji: "🎮",
          doc: prizeNotice,
          setup: "The DM with this notice says, \"Hurry, other winners are already claiming theirs!\" You never entered any contest.",
          question: "What do you do?",
          choices: [
            { text: "Ask them to prove the prize is real", outcome: "Within seconds they send a winner certificate and a photo of the console. Fake proof is easy to make, and now they know you're interested." },
            { text: "Pay the $20, since it's small next to $499.99", outcome: "The gift card money is gone, and the console never arrives. Gift card payments are very hard to get back." },
            { text: "Send your address now and pay the fee later", outcome: "A stranger now has your home address and phone number, and the messages asking for the $20 keep coming." },
            { text: "Don't reply. Block them and tell a trusted adult.", best: true, outcome: "The scammer gets nothing. Your adult helps you report the account, and you move on." },
          ],
        },
        {
          type: "mc",
          id: "t1-u5-l4-e13",
          prompt: "You spotted a scam message, but you didn't lose any money. Can you still report it?",
          choices: [
            { text: "Yes, at ReportFraud.ftc.gov", correct: true },
            { text: "No, reports only count if you lost money", why: "You can report a scam attempt even if you didn't fall for it. Reports help warn and protect other people." },
            { text: "Yes, by tapping the \"report\" link in the message", why: "Links in a scam message go to the scammer. Use the app's own report button or the FTC's website instead." },
          ],
          explain: "The FTC collects scam reports at ReportFraud.ftc.gov, and most apps have a report button too. Tell a trusted adult as well, so they can help.",
        },
      ],
    },
  ],

  quiz: {
    passPercent: 70,
    exercises: [
      {
        type: "mc",
        id: "t1-u5-q-e1",
        prompt: "A creator's post ends with #ad. What does that tell you?",
        choices: [
          { text: "A brand paid them or gave them something to post it", correct: true },
          { text: "The creator tested it against other products", why: "#ad doesn't mean any testing happened. It tells you money or free products were involved." },
          { text: "The post is the creator's own unpaid opinion", why: "It's the opposite. #ad means the post is an advertisement." },
        ],
        explain: "#ad means the post is an ad. The creator might like the product, but they were paid or given something, so look for reviews from regular buyers too.",
      },
      {
        type: "tf",
        id: "t1-u5-q-e2",
        statement: "An ad's main job is to give you all the facts you need to compare products.",
        answer: false,
        explain: "An ad's main job is to sell. It shares the facts that help it sell and leaves out the rest. Prices, reviews, and return policies help you compare.",
      },
      {
        type: "mc",
        id: "t1-u5-q-e3",
        prompt: "Which box of cereal is the best deal per ounce?",
        doc: cerealShelf,
        choices: [
          { text: "The 16-ounce box", correct: true },
          { text: "The 24-ounce box", why: "$6.48 ÷ 24 = 27 cents an ounce. The biggest box isn't the cheapest per ounce here." },
          { text: "The 10-ounce box", why: "It has the lowest price tag, but $3.00 ÷ 10 = 30 cents an ounce." },
        ],
        explain: "$4.00 ÷ 16 = 25 cents an ounce, the lowest of the three.",
      },
      {
        type: "number",
        id: "t1-u5-q-e4",
        prompt: "A game costs $24 online plus $6 shipping, or $27 at a store near you. Before tax, how much do you save by buying at the store?",
        answer: 3,
        prefix: "$",
        explain: "Online costs $24 + $6 = $30. The store costs $27, so buying at the store saves $3.",
      },
      {
        type: "fill",
        id: "t1-u5-q-e5",
        sentence: "Pricing something at $9.99 instead of $10 is called ___ pricing.",
        answers: ["charm"],
        bank: ["charm", "unit", "sale", "fair"],
        explain: "Charm pricing makes $9.99 feel closer to $9 than to $10, even though it's only one cent less than $10.",
      },
      {
        type: "number",
        id: "t1-u5-q-e6",
        prompt: "In a game, 100 coins cost $1. A jetpack costs 2,500 coins. How much is that in real dollars?",
        answer: 25,
        prefix: "$",
        explain: "2,500 ÷ 100 = 25, so the jetpack costs $25 of real money.",
      },
      {
        type: "tf",
        id: "t1-u5-q-e7",
        statement: "If a loot box prize has a 1% drop rate, opening 100 boxes guarantees you'll get it.",
        answer: false,
        explain: "1% is an average, not a promise. More than 1 in 3 players who open 100 boxes still won't get the prize.",
      },
      {
        type: "match",
        id: "t1-u5-q-e8",
        prompt: "Match each word to its meaning.",
        pairs: [
          { left: "Sponsored", right: "Paid for by a brand" },
          { left: "Unit price", right: "Cost for one ounce or item" },
          { left: "Drop rate", right: "Chance of getting a certain prize" },
          { left: "Phishing", right: "Fake message to steal your info" },
        ],
        explain: "A sponsored post is an ad, a unit price lets you compare sizes, a drop rate is the chance of a prize, and phishing tries to steal your login or info.",
      },
      {
        type: "mc",
        id: "t1-u5-q-e9",
        prompt: "Which of these is always a sign of a scam?",
        choices: [
          { text: "Someone asks you to pay with a gift card", correct: true },
          { text: "A text comes from a number you don't know", why: "That can be a scam, but many real texts come from unknown numbers, like appointment reminders. It's a reason to be careful, not proof." },
          { text: "A message has a link in it", why: "Lots of real messages have links. Be careful with them, but a link alone doesn't prove a scam." },
          { text: "The message has a spelling mistake", why: "Spelling mistakes are a warning sign, but real messages have typos sometimes too. It's a reason to look closer, not proof." },
        ],
        explain: "Real companies never ask for payment in gift cards. Anyone who does is running a scam.",
      },
      {
        type: "scenario",
        id: "t1-u5-q-e10",
        emoji: "💎",
        setup: "A video promises \"unlimited free gems\" if you type your username and password on a website. Your friend says it worked for their cousin.",
        question: "What do you do?",
        choices: [
          { text: "Try it, since it worked for someone you know", outcome: "Someone logs into your account within the hour and changes your password. You lose the account and everything in it." },
          { text: "Try it with a spare account you don't care about", outcome: "No gems show up. The site was only collecting logins, and if that password is used anywhere else, those accounts are now at risk." },
          { text: "Skip it. Only enter your password in the real game.", best: true, outcome: "Your account stays safe. You tell your friend these sites are a common way to steal accounts." },
        ],
      },
    ],
  },
}

export default unit
