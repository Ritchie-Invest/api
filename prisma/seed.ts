// prisma/seed.ts
import { PrismaClient, GameType, TickerType, Currency } from '@prisma/client'

const prisma = new PrismaClient()

/** ---- utilitaires ---- **/

// PRNG déterministe pour des seeds reproductibles
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(42)

function randFloat(min: number, max: number) {
  return +(min + (max - min) * rand()).toFixed(2)
}
function randInt(min: number, max: number) {
  return Math.floor(min + (max - min + 1) * rand())
}

function isWeekend(d: Date) {
  const day = d.getUTCDay()
  return day === 0 || day === 6
}

/**
 * Génère N *jours ouvrés* de daily bars en remontant depuis aujourd’hui (exclu).
 * OHLC cohérents + volume.
 */
function generateDailyBars(
  tickerId: string,
  startPrice: number,
  businessDays: number
) {
  const bars: {
    tickerId: string
    date: Date
    open: number
    high: number
    low: number
    close: number
    volume: number
  }[] = []

  let price = startPrice
  let d = new Date()
  d.setUTCHours(0, 0, 0, 0)

  while (bars.length < businessDays) {
    d.setUTCDate(d.getUTCDate() - 1)
    if (isWeekend(d)) continue

    // volatilité ~1.5% journalière
    const drift = randFloat(-0.008, 0.012)
    const open = +price.toFixed(2)
    const intradayMove = Math.abs(randFloat(0.002, 0.02)) * open
    const high = +(Math.max(open, open * (1 + drift)) + intradayMove * rand()).toFixed(2)
    const low = +(Math.min(open, open * (1 + drift)) - intradayMove * rand()).toFixed(2)
    const close = +randFloat(low, high).toFixed(2)
    const volume = randInt(500_000, 2_500_000)

    bars.push({
      tickerId,
      date: new Date(d), // unique par date/ticker
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume,
    })

    price = close
  }

  // on renvoie dans l'ordre chronologique croissant
  return bars.reverse()
}

async function main() {
  console.log('🌱 Seeding database...')

  /** ---- Chapters (5) ---- **/
  const chaptersInfo = [
    { title: 'Introduction à la Finance', description: 'Concepts de base pour débuter' },
    { title: 'Marchés & Instruments', description: 'Actions, obligations, ETF, dérivés' },
    { title: 'Analyse Financière', description: 'Ratios, états financiers, valorisation' },
    { title: 'Gestion de Portefeuille', description: 'Allocation, diversification, risque' },
    { title: 'Stratégies & Comportements', description: 'Facteurs, behavior finance' },
  ]

  const chapters = await Promise.all(
    chaptersInfo.map((c, idx) =>
      prisma.chapter.create({
        data: {
          ...c,
          order: idx + 1,
          isPublished: true,
        },
      })
    )
  )

  /** ---- Lessons (5 par chapitre = 25) + GameModule + sous-modules ---- **/
  const lessonTitles = [
    ['Qu’est-ce que la finance ?', 'Intermédiaires financiers', 'Temps & valeur de l’argent', 'Inflation et taux', 'Risque et rendement'],
    ['Actions vs obligations', 'ETF et indices', 'Liquidité & profondeur', 'Carnet d’ordres', 'Frais & fiscalité de base'],
    ['Bilan & compte de résultat', 'Flux de trésorerie', 'Ratios clés', 'Valorisation DCF', 'Multiples de marché'],
    ['Allocation stratégique', 'Allocation tactique', 'Diversification', 'Gestion du risque', 'Rebalancement'],
    ['Biais comportementaux', 'Effet momentum', 'Value vs growth', 'Facteurs de risque', 'Backtests & limites'],
  ]

  const allLessons = []
  for (let ci = 0; ci < chapters.length; ci++) {
    const chapter = chapters[ci]
    for (let li = 0; li < 5; li++) {
      const gameTypeCycle = [GameType.MCQ, GameType.FILL_IN_THE_BLANK, GameType.TRUE_OR_FALSE]
      const gameType = gameTypeCycle[(ci * 5 + li) % gameTypeCycle.length]

      if (!chapter) {
        throw new Error(`Chapter at index ${ci} is undefined`)
      }
      const lesson = await prisma.lesson.create({
        data: {
          title: lessonTitles[ci]?.[li] ?? `Leçon ${li + 1} du chapitre "${chapter.title}"`,
          description: `Leçon ${li + 1} du chapitre "${chapter.title}"`,
          order: li + 1,
          isPublished: true,
          chapterId: chapter.id,
          gameType,
        },
      })
      allLessons.push(lesson)

      // Un GameModule par leçon
      const gm = await prisma.gameModule.create({
        data: { lessonId: lesson.id },
      })

      // Crée la sous-entrée selon le type du cours
      if (gameType === GameType.MCQ) {
        await prisma.mcqModule.create({
          data: {
            gameModuleId: gm.id,
            question: `Question MCQ — ${lesson.title}`,
            choices: [
              { label: 'Option A', correct: (ci + li) % 4 === 0 },
              { label: 'Option B', correct: (ci + li) % 4 === 1 },
              { label: 'Option C', correct: (ci + li) % 4 === 2 },
              { label: 'Option D', correct: (ci + li) % 4 === 3 },
            ],
          },
        })
      } else if (gameType === GameType.FILL_IN_THE_BLANK) {
        await prisma.fillInTheBlankModule.create({
          data: {
            gameModuleId: gm.id,
            firstText: 'La diversification réduit le ________ non-systématique.',
            secondText: 'Elle est obtenue via la ________ des actifs.',
            blanks: [
              { idx: 0, answer: 'risque' },
              { idx: 1, answer: 'corrélation' },
            ],
          },
        })
      } else {
        await prisma.trueOrFalseModule.create({
          data: {
            gameModuleId: gm.id,
            sentence: 'Un ETF est nécessairement géré activement.',
            isTrue: false,
          },
        })
      }
    }
  }

  /** ---- Tickers (5) ---- **/
  await prisma.ticker.createMany({
    data: [
      { name: 'S&P 500 ETF', symbol: 'SPY', type: TickerType.ETF, currency: Currency.USD },
      { name: 'NASDAQ 100 ETF', symbol: 'QQQ', type: TickerType.ETF, currency: Currency.USD },
      { name: 'Euro Stoxx 50 ETF', symbol: 'SX5E', type: TickerType.ETF, currency: Currency.EUR },
      { name: 'FTSE 100 ETF', symbol: 'UKX', type: TickerType.ETF, currency: Currency.GBP },
      { name: 'MSCI World ETF', symbol: 'URTH', type: TickerType.ETF, currency: Currency.USD },
    ],
    skipDuplicates: true,
  })

  const tickers = await prisma.ticker.findMany()

  /** ---- DailyBars (365 jours ouvrés par ticker) ---- **/
  for (const t of tickers) {
    const start =
      t.symbol === 'SPY' ? 450 :
      t.symbol === 'QQQ' ? 380 :
      t.symbol === 'SX5E' ? 4000 :
      t.symbol === 'UKX' ? 7600 :
      300 // URTH

    const bars = generateDailyBars(t.id, start, 365)
    // createMany en batchs pour éviter de dépasser les limites de requête
    const chunkSize = 200
    for (let i = 0; i < bars.length; i += chunkSize) {
      await prisma.dailyBar.createMany({
        data: bars.slice(i, i + chunkSize),
        skipDuplicates: true,
      })
    }
  }

  console.log('✅ Seed terminé !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => prisma.$disconnect())
