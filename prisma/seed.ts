import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (except user-related tables)
  await prisma.mcqModule.deleteMany();
  await prisma.gameModule.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.dailyBar.deleteMany();
  await prisma.ticker.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Seed Chapters
  console.log('📚 Seeding chapters...');
  const chapters = await Promise.all([
    prisma.chapter.create({
      data: {
        title: 'Introduction aux Marchés Financiers',
        description: 'Découvrez les bases des marchés financiers et les concepts fondamentaux de l\'investissement.',
        order: 1,
        isPublished: true,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Les ETF et leur Fonctionnement',
        description: 'Apprenez tout sur les Exchange-Traded Funds et comment ils peuvent diversifier votre portefeuille.',
        order: 2,
        isPublished: true,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Stratégies d\'Investissement',
        description: 'Explorez différentes stratégies d\'investissement pour optimiser vos rendements.',
        order: 3,
        isPublished: true,
      },
    }),
    prisma.chapter.create({
      data: {
        title: 'Gestion des Risques',
        description: 'Comprenez comment évaluer et gérer les risques dans vos investissements.',
        order: 4,
        isPublished: false,
      },
    }),
  ]);

  console.log(`✅ Created ${chapters.length} chapters`);

  // Seed Lessons for each chapter
  console.log('📖 Seeding lessons...');
  const lessonsData = [
    // Chapter 1 lessons
    {
      title: 'Qu\'est-ce qu\'un marché financier ?',
      description: 'Introduction aux concepts de base des marchés financiers',
      chapterId: chapters[0].id,
      order: 1,
      isPublished: true,
    },
    {
      title: 'Types d\'actifs financiers',
      description: 'Découvrez les différents types d\'actifs disponibles',
      chapterId: chapters[0].id,
      order: 2,
      isPublished: true,
    },
    {
      title: 'Comprendre les prix et la volatilité',
      description: 'Apprenez à interpréter les mouvements de prix',
      chapterId: chapters[0].id,
      order: 3,
      isPublished: true,
    },
    // Chapter 2 lessons
    {
      title: 'Introduction aux ETF',
      description: 'Qu\'est-ce qu\'un ETF et comment ça fonctionne',
      chapterId: chapters[1].id,
      order: 1,
      isPublished: true,
    },
    {
      title: 'Avantages des ETF',
      description: 'Découvrez pourquoi les ETF sont populaires',
      chapterId: chapters[1].id,
      order: 2,
      isPublished: true,
    },
    {
      title: 'Choisir le bon ETF',
      description: 'Critères de sélection d\'un ETF',
      chapterId: chapters[1].id,
      order: 3,
      isPublished: true,
    },
    // Chapter 3 lessons
    {
      title: 'Buy and Hold',
      description: 'La stratégie d\'investissement à long terme',
      chapterId: chapters[2].id,
      order: 1,
      isPublished: true,
    },
    {
      title: 'Dollar Cost Averaging',
      description: 'Investir régulièrement pour lisser les prix',
      chapterId: chapters[2].id,
      order: 2,
      isPublished: true,
    },
    // Chapter 4 lessons
    {
      title: 'Évaluation des risques',
      description: 'Comment mesurer le risque d\'un investissement',
      chapterId: chapters[3].id,
      order: 1,
      isPublished: false,
    },
  ];

  const lessons = [];
  for (const lessonData of lessonsData) {
    const lesson = await prisma.lesson.create({
      data: lessonData,
    });
    lessons.push(lesson);
  }

  console.log(`✅ Created ${lessons.length} lessons`);

  // Seed Game Modules and MCQ modules
  console.log('🎮 Seeding game modules...');
  const mcqQuestions = [
    {
      question: 'Qu\'est-ce qu\'un marché financier ?',
      choices: [
        { text: 'Un lieu physique où on vend des produits', correct: false },
        { text: 'Un système permettant l\'échange d\'actifs financiers', correct: true },
        { text: 'Une banque centrale', correct: false },
        { text: 'Un type de monnaie', correct: false },
      ],
    },
    {
      question: 'Que signifie ETF ?',
      choices: [
        { text: 'European Trading Fund', correct: false },
        { text: 'Exchange-Traded Fund', correct: true },
        { text: 'Electronic Transfer Fund', correct: false },
        { text: 'Equity Trading Facility', correct: false },
      ],
    },
    {
      question: 'Quel est l\'avantage principal du Dollar Cost Averaging ?',
      choices: [
        { text: 'Garantit des profits', correct: false },
        { text: 'Élimine tous les risques', correct: false },
        { text: 'Lisse le prix d\'achat moyen', correct: true },
        { text: 'Augmente toujours les rendements', correct: false },
      ],
    },
    {
      question: 'Qu\'est-ce que la volatilité ?',
      choices: [
        { text: 'Le volume d\'échange d\'un actif', correct: false },
        { text: 'La mesure des fluctuations de prix', correct: true },
        { text: 'Le dividende versé', correct: false },
        { text: 'La capitalisation boursière', correct: false },
      ],
    },
    {
      question: 'Quel est l\'objectif principal de la diversification ?',
      choices: [
        { text: 'Maximiser les profits', correct: false },
        { text: 'Réduire les risques', correct: true },
        { text: 'Augmenter la volatilité', correct: false },
        { text: 'Concentrer les investissements', correct: false },
      ],
    },
  ];

  let moduleCount = 0;
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    
    // Skip if lesson is undefined (shouldn't happen but TypeScript safety)
    if (!lesson) continue;
    
    // Create 2-3 modules per lesson
    const modulesPerLesson = Math.floor(Math.random() * 2) + 2; // 2 ou 3 modules
    
    for (let j = 0; j < modulesPerLesson; j++) {
      const gameModule = await prisma.gameModule.create({
        data: {
          lessonId: lesson.id,
        },
      });

      const questionIndex = (moduleCount + j) % mcqQuestions.length;
      const question = mcqQuestions[questionIndex];

      if (question) {
        await prisma.mcqModule.create({
          data: {
            question: question.question,
            choices: question.choices,
            gameModuleId: gameModule.id,
          },
        });
      }
    }
    
    moduleCount += modulesPerLesson;
  }

  console.log(`✅ Created ${moduleCount} game modules with MCQ questions`);

  // Seed Tickers (ETFs)
  console.log('📈 Seeding tickers...');
  const tickers = await Promise.all([
    prisma.ticker.create({
      data: {
        name: 'SPDR S&P 500 ETF Trust',
        symbol: 'SPY',
        type: 'ETF',
        currency: 'USD',
      },
    }),
    prisma.ticker.create({
      data: {
        name: 'Vanguard Total Stock Market ETF',
        symbol: 'VTI',
        type: 'ETF',
        currency: 'USD',
      },
    }),
    prisma.ticker.create({
      data: {
        name: 'iShares Core MSCI Total International Stock ETF',
        symbol: 'IXUS',
        type: 'ETF',
        currency: 'USD',
      },
    }),
    prisma.ticker.create({
      data: {
        name: 'Vanguard FTSE Europe ETF',
        symbol: 'VGK',
        type: 'ETF',
        currency: 'USD',
      },
    }),
    prisma.ticker.create({
      data: {
        name: 'iShares Core Euro Stoxx 50 UCITS ETF',
        symbol: 'SX5E',
        type: 'ETF',
        currency: 'EUR',
      },
    }),
  ]);

  console.log(`✅ Created ${tickers.length} tickers`);

  // Seed Daily Bars (historical data for last 2 years)
  console.log('📊 Seeding daily bars...');
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 2); // 2 ans de données

  let totalBars = 0;
  
  for (const ticker of tickers) {
    const currentDate = new Date(startDate);
    let basePrice = Math.random() * 200 + 50; // Prix de base entre 50 et 250
    
    while (currentDate <= new Date()) {
      // Skip weekends
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Simulate realistic price movements
        const volatility = 0.02; // 2% volatility daily
        const change = (Math.random() - 0.5) * volatility * basePrice;
        
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * 0.01 * basePrice;
        const low = Math.min(open, close) - Math.random() * 0.01 * basePrice;
        const volume = Math.floor(Math.random() * 10000000) + 1000000; // Volume entre 1M et 11M

        await prisma.dailyBar.create({
          data: {
            tickerId: ticker.id,
            date: new Date(currentDate),
            open: Math.round(open * 100) / 100,
            high: Math.round(high * 100) / 100,
            low: Math.round(low * 100) / 100,
            close: Math.round(close * 100) / 100,
            volume,
          },
        });

        basePrice = close;
        totalBars++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  console.log(`✅ Created ${totalBars} daily bars`);

  console.log('🎉 Database seeding completed successfully!');
  
  // Summary
  console.log('\n📋 Summary:');
  console.log(`- ${chapters.length} chapters`);
  console.log(`- ${lessons.length} lessons`);
  console.log(`- ${moduleCount} game modules with MCQ questions`);
  console.log(`- ${tickers.length} tickers (ETFs)`);
  console.log(`- ${totalBars} daily bars (historical data)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
