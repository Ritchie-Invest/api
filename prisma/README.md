# Script de Peuplement de la Base de Données

Ce script permet de peupler la base de données avec des données fictives pour le développement et les tests.

## Tables peuplées

Le script remplit les tables suivantes avec des données fictives :

### 📚 Contenu pédagogique
- **Chapters** : 4 chapitres sur les marchés financiers et l'investissement
- **Lessons** : 9 leçons réparties dans les chapitres
- **GameModule** : 2-3 modules de jeu par leçon
- **McqModule** : Questions à choix multiples pour chaque module

### 📈 Données financières
- **Ticker** : 5 ETFs populaires (SPY, VTI, IXUS, VGK, SX5E)
- **DailyBar** : 2 années d'historique de prix pour chaque ETF

## Tables exclues

Les tables suivantes ne sont **pas** peuplées par ce script (données utilisateur) :
- User
- RefreshToken
- LessonCompletion
- LessonAttempt
- ModuleAttempt
- UserPortfolio
- PortfolioPosition
- Transaction

## Utilisation

### Prérequis
- Base de données PostgreSQL configurée
- Variables d'environnement correctement définies (DATABASE_URL)
- Prisma Client généré (`npx prisma generate`)

### Exécution du script

```bash
# Option 1: Utiliser le script npm
npm run db:seed

# Option 2: Exécuter directement
npx ts-node prisma/seed.ts

# Option 3: Avec node (après compilation)
node dist/prisma/seed.js
```

## Contenu généré

### Chapitres et leçons
1. **Introduction aux Marchés Financiers** (3 leçons)
   - Qu'est-ce qu'un marché financier ?
   - Types d'actifs financiers
   - Comprendre les prix et la volatilité

2. **Les ETF et leur Fonctionnement** (3 leçons)
   - Introduction aux ETF
   - Avantages des ETF
   - Choisir le bon ETF

3. **Stratégies d'Investissement** (2 leçons)
   - Buy and Hold
   - Dollar Cost Averaging

4. **Gestion des Risques** (1 leçon, non publiée)
   - Évaluation des risques

### Questions MCQ
Le script inclut 5 questions types qui sont réutilisées cycliquement :
- Définition d'un marché financier
- Signification d'ETF
- Avantages du Dollar Cost Averaging
- Définition de la volatilité
- Objectif de la diversification

### ETFs et données historiques
- **SPY** : SPDR S&P 500 ETF Trust (USD)
- **VTI** : Vanguard Total Stock Market ETF (USD)
- **IXUS** : iShares Core MSCI Total International Stock ETF (USD)
- **VGK** : Vanguard FTSE Europe ETF (USD)
- **SX5E** : iShares Core Euro Stoxx 50 UCITS ETF (EUR)

Chaque ETF dispose de 2 années d'historique de prix avec :
- Prix OHLC (Open, High, Low, Close) réalistes
- Volume d'échange simulé
- Volatilité de 2% par jour
- Données uniquement pour les jours ouvrables

## Nettoyage

Le script nettoie automatiquement les données existantes dans les tables concernées avant d'insérer les nouvelles données. Les données utilisateur sont préservées.

## Personnalisation

Pour modifier le contenu généré, éditez le fichier `prisma/seed.ts` :
- Ajoutez/modifiez les chapitres dans le tableau `chapters`
- Modifiez les leçons dans `lessonsData`
- Ajoutez de nouvelles questions MCQ dans `mcqQuestions`
- Ajoutez de nouveaux ETFs dans la section tickers

## Troubleshooting

### Erreur de connexion à la base
Vérifiez que :
- PostgreSQL est démarré
- La variable `DATABASE_URL` est correctement définie
- L'utilisateur a les permissions nécessaires

### Erreur de schéma
Assurez-vous que :
- Les migrations Prisma sont appliquées : `npx prisma migrate dev`
- Le client Prisma est généré : `npx prisma generate`

### Performance
Le script peut prendre quelques minutes à s'exécuter car il génère ~2600 barres de prix par ETF (520 jours ouvrables × 5 ETFs).
