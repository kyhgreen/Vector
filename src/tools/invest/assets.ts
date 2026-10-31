/*
  The pretend market: eight made-up investments in the made-up country of
  Fakeland, plus the news that pushes their prices around.

  drift = long-run average growth per year (0.08 = 8%)
  vol   = how wildly the price swings in a year (0.16 = a typical year lands
          within about 16% of the average)
  corr  = how much it moves together with the whole market (0 = does its own thing)
  beta  = how hard market-wide news and slides hit it
*/
import type { UnitColor } from '../../content/types'

export type Ticker = 'SAVE' | 'BNDY' | 'KNIT' | 'TMIX' | 'SNAK' | 'MEOW' | 'HOVR' | 'DMOON'

/** 0 = never goes down ... 5 = hold onto your hat. */
export type Risk = 0 | 1 | 2 | 3 | 4 | 5

export interface Asset {
  ticker: Ticker
  name: string
  /** Short name for tight spots and sentences ("If Snack Attack has a bad week..."). */
  short: string
  emoji: string
  color: UnitColor
  kind: string
  risk: Risk
  drift: number
  vol: number
  corr: number
  beta: number
  /** Price on day 1. */
  start: number
  /** Chance per day of company news. */
  newsOdds: number
  /** The one-liner on the market list. */
  blurb: string
  /** A little more teaching, shown in the detail sheet. */
  detail: string
  /** Plain-words growth and swing descriptions for the detail sheet. */
  growthText: string
  swingText: string
}

export const ASSETS: readonly Asset[] = [
  {
    ticker: 'SAVE',
    name: 'Savings Account',
    short: 'Savings',
    emoji: '🏦',
    color: 'green',
    kind: 'Savings',
    risk: 0,
    drift: 0.04,
    vol: 0,
    corr: 0,
    beta: 0,
    start: 10,
    newsOdds: 0,
    blurb: 'Grows 4% a year and never goes down.',
    detail: 'It never goes down, but it grows slowly.',
    growthText: '4% a year',
    swingText: 'None',
  },
  {
    ticker: 'BNDY',
    name: 'Bedrock Bond Fund',
    short: 'Bedrock Bonds',
    emoji: '📜',
    color: 'teal',
    kind: 'Bond fund',
    risk: 1,
    drift: 0.04,
    vol: 0.05,
    corr: -0.15,
    beta: -0.25,
    start: 50,
    newsOdds: 1 / 150,
    blurb: 'Lends money out and earns interest. Moves slowly.',
    detail: 'A bond is a loan that pays interest. Bonds swing less than stocks and often hold up when stocks fall.',
    growthText: 'About 4% a year',
    swingText: 'Small',
  },
  {
    ticker: 'KNIT',
    name: "Grandma's Sweaters",
    short: "Grandma's Sweaters",
    emoji: '🧶',
    color: 'red',
    kind: 'Stock',
    risk: 1,
    drift: 0.035,
    vol: 0.09,
    corr: 0.35,
    beta: 0.5,
    start: 18,
    newsOdds: 1 / 110,
    blurb: 'An old, steady company. Sells the most in winter.',
    detail: 'A share of stock is a small piece of ownership in a company. Older, steady companies usually grow slowly and swing less.',
    growthText: 'About 3.5% a year',
    swingText: 'Mild',
  },
  {
    ticker: 'TMIX',
    name: 'Total Market Index',
    short: 'the Total Market Index',
    emoji: '🌎',
    color: 'blue',
    kind: 'Index fund',
    risk: 2,
    drift: 0.08,
    vol: 0.16,
    corr: 0.97,
    beta: 1,
    start: 100,
    newsOdds: 0,
    blurb: 'Owns a small part of every company in Fakeland.',
    detail: 'Owns hundreds of companies, so one company doing badly has little effect. It still rises and falls with the whole market.',
    growthText: 'About 8% a year, with some bad years',
    swingText: 'Medium',
  },
  {
    ticker: 'SNAK',
    name: 'Snack Attack Inc.',
    short: 'Snack Attack',
    emoji: '🍿',
    color: 'orange',
    kind: 'Stock',
    risk: 3,
    drift: 0.1,
    vol: 0.26,
    corr: 0.6,
    beta: 1.1,
    start: 42,
    newsOdds: 1 / 70,
    blurb: 'A single company that makes chips and snacks.',
    detail: 'This is one company with one main product, so bad news about it hits the price hard.',
    growthText: 'About 10% a year',
    swingText: 'Big, on big news',
  },
  {
    ticker: 'MEOW',
    name: 'CloudKitty Games',
    short: 'CloudKitty',
    emoji: '🐱',
    color: 'purple',
    kind: 'Stock',
    risk: 4,
    drift: 0.12,
    vol: 0.38,
    corr: 0.5,
    beta: 1.3,
    start: 63,
    newsOdds: 1 / 60,
    blurb: 'A video game company. One failed game can drop the price a lot.',
    detail: 'Game companies depend on their next hit, so the price can drop fast.',
    growthText: 'About 12% a year',
    swingText: 'Large',
  },
  {
    ticker: 'HOVR',
    name: 'Hoverboard Co.',
    short: 'Hoverboard Co.',
    emoji: '🛹',
    color: 'pink',
    kind: 'Stock',
    risk: 4,
    drift: 0.13,
    vol: 0.48,
    corr: 0.45,
    beta: 1.5,
    start: 87,
    newsOdds: 1 / 55,
    blurb: 'A young company with big plans and small sales so far.',
    detail: 'The price is based on sales the company hopes to make later. If those sales don\'t happen, the price can fall hard.',
    growthText: 'About 13% a year, if its plans work out',
    swingText: 'Very large',
  },
  {
    ticker: 'DMOON',
    name: 'DogeMoon Coin',
    short: 'DogeMoon',
    emoji: '🐶',
    color: 'yellow',
    kind: 'Meme coin',
    risk: 5,
    drift: -0.2,
    vol: 1.1,
    corr: 0.2,
    beta: 1.5,
    start: 0.42,
    newsOdds: 1 / 26,
    blurb: 'A digital coin with no company or product behind it.',
    detail: 'Nothing backs a meme coin, so its price depends on how popular it is. Most lose value over time.',
    growthText: 'Usually down',
    swingText: 'Can double or halve in a week',
  },
]

export const TICKERS: readonly Ticker[] = ASSETS.map((a) => a.ticker)
export const ASSET_BY_TICKER = Object.fromEntries(ASSETS.map((a) => [a.ticker, a])) as Record<Ticker, Asset>
export const assetIndex = (t: Ticker) => TICKERS.indexOf(t)
export const isTicker = (t: unknown): t is Ticker => typeof t === 'string' && (TICKERS as readonly string[]).includes(t)

export const RISK_LABELS: Record<Risk, string> = {
  0: 'No swings',
  1: 'Low risk',
  2: 'Medium risk',
  3: 'Medium-high risk',
  4: 'High risk',
  5: 'Very high risk',
}

export const RISK_COLORS: Record<Risk, UnitColor | 'gray'> = {
  0: 'green',
  1: 'teal',
  2: 'blue',
  3: 'orange',
  4: 'red',
  5: 'purple',
}

/* ---------- News ---------- */

export interface NewsTemplate {
  emoji: string
  text: string
  /** Price jump it causes (0.12 = up 12%). The real jump wobbles around this. */
  move: number
}

export const COMPANY_NEWS: Partial<Record<Ticker, NewsTemplate[]>> = {
  SNAK: [
    { emoji: '⚠️', text: 'Snack Attack recalls a batch of chips over a labeling mistake.', move: -0.15 },
    { emoji: '🥒', text: "Snack Attack's new dill pickle chips sell far better than expected.", move: 0.12 },
    { emoji: '📦', text: 'Snack Attack signs a deal to stock vending machines in 2,000 schools.', move: 0.1 },
    { emoji: '👎', text: "Reviews of Snack Attack's new chips are mostly negative.", move: -0.08 },
    { emoji: '💨', text: 'Shoppers complain that Snack Attack made its bags smaller but kept the same price.', move: -0.11 },
    { emoji: '📊', text: 'Snack Attack reports record sales for the year.', move: 0.07 },
    { emoji: '🚚', text: 'Delivery delays leave Snack Attack shelves empty for a week.', move: -0.06 },
  ],
  MEOW: [
    { emoji: '🎮', text: "CloudKitty's new game becomes the #1 game in Fakeland.", move: 0.18 },
    { emoji: '⏳', text: 'CloudKitty delays its biggest game by a year.', move: -0.16 },
    { emoji: '🐾', text: 'A small CloudKitty side project becomes a hit game.', move: 0.12 },
    { emoji: '💥', text: "CloudKitty's servers crash on launch day.", move: -0.12 },
    { emoji: '📺', text: 'CloudKitty signs a deal for a TV series based on its games.', move: 0.09 },
    { emoji: '🐛', text: "A bug in CloudKitty's top game drives some players away.", move: -0.07 },
  ],
  HOVR: [
    { emoji: '🚀', text: 'Hoverboard Co. passes a key safety test for its first board.', move: 0.25 },
    { emoji: '🔙', text: 'Hoverboard Co. recalls 40,000 boards over a battery problem.', move: -0.22 },
    { emoji: '📣', text: "Hoverboard Co.'s CEO announces a launch date for next year.", move: 0.08 },
    { emoji: '🚫', text: 'Several cities ban hoverboards on sidewalks.', move: -0.13 },
    { emoji: '🔋', text: 'Hoverboard Co. shows a new battery that lasts twice as long.', move: 0.15 },
    { emoji: '🌧️', text: 'Early buyers report boards failing in the rain, and sales drop.', move: -0.1 },
  ],
  KNIT: [
    { emoji: '❄️', text: "A surprise cold snap sends Grandma's Sweaters sales up.", move: 0.08 },
    { emoji: '👎', text: "Grandma's Sweaters' new wool line gets poor reviews.", move: -0.06 },
    { emoji: '🎄', text: "Grandma's Sweaters' holiday line sells out early.", move: 0.06 },
    { emoji: '☀️', text: 'A warm winter cuts sweater sales.', move: -0.07 },
    { emoji: '📱', text: "A popular video about the company's founder brings in new customers.", move: 0.05 },
  ],
  BNDY: [
    { emoji: '📈', text: 'Interest rates rise, so bond prices dip. The two move in opposite directions.', move: -0.03 },
    { emoji: '📉', text: 'Interest rates drop, so older bonds look better and bond prices rise.', move: 0.03 },
    { emoji: '🏛️', text: "Fakeland's government pays every bill on time, so bonds look safer.", move: 0.015 },
  ],
  DMOON: [
    { emoji: '🌕', text: 'A large trading app adds DogeMoon, and the price jumps.', move: 0.45 },
    { emoji: '🕳️', text: 'The DogeMoon creators disappear, and the price crashes.', move: -0.45 },
    { emoji: '🛒', text: 'A big online store stops accepting DogeMoon as payment.', move: -0.18 },
    { emoji: '📢', text: 'A celebrity mentions DogeMoon online, and the price jumps.', move: 0.35 },
    { emoji: '🖨️', text: 'A bug lets people create new DogeMoon coins for free, so each coin is worth less.', move: -0.32 },
    { emoji: '🗣️', text: 'Online forums hype DogeMoon, and the price jumps even though nothing about it changed.', move: 0.25 },
    { emoji: '😴', text: 'Interest in DogeMoon fades, and the price falls.', move: -0.25 },
  ],
}

/** News that hits the whole market. Stocks feel it by their beta; bonds often wiggle the other way. */
export const MARKET_NEWS: NewsTemplate[] = [
  { emoji: '🌧️', text: "Fakeland's economy hits a rough patch. Almost everything drops.", move: -0.06 },
  { emoji: '📰', text: 'Gloomy headlines make investors nervous, so they sell.', move: -0.045 },
  { emoji: '💼', text: 'A strong jobs report lifts the market.', move: 0.045 },
  { emoji: '🎉', text: "Fakeland's economy is booming, and stocks rise.", move: 0.05 },
  { emoji: '🤷', text: 'Stocks fall today, and experts disagree on why.', move: -0.03 },
  { emoji: '🏭', text: 'Factories in Fakeland are busier than ever. Stocks climb.', move: 0.04 },
]

export const SLIDE_START: Omit<NewsTemplate, 'move'> = {
  emoji: '🐻',
  text: "Fakeland's market starts a long slide, called a correction.",
}

export const SLIDE_END: Omit<NewsTemplate, 'move'> = {
  emoji: '🌤️',
  text: 'The slide looks over, and prices are steadying.',
}
