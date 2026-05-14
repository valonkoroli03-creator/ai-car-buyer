# 🚗 AI Car Buyer Pro

Application web premium qui analyse les annonces de voitures d'occasion (AutoScout24, Anibis, Comparis…) et fournit deux niveaux d'analyse :

1. **Analyse gratuite** — résumé rapide, scores, première impression
2. **Analyse premium** — comparaison complète, coûts réels en Suisse (assurance, plaques par canton), fiabilité, revente, script de négociation

## ✨ Fonctionnalités v2

- 🔗 **Liens uniquement** — saisie via URL d'annonce, un par bloc, "+ Ajouter une annonce"
- 🇨🇭 **QCM suisse** — ville (Genève, Lausanne, Zurich…), usage, km annuel, priorité, type d'assurance, profil conducteur
- 💰 **Coûts cantonaux réels** — estimation d'assurance et d'impôts automobiles selon votre ville
- 🧠 **Analyse IA Claude** — extraction des données, comparaisons moteur, fiabilité par modèle
- 🔒 **Paywall démo** — faux paiement à CHF 19 pour débloquer l'analyse premium
- 📊 **9 sections premium** — résumé, comparaison générale, moteur, coûts, options, fiabilité, revente, négociation, verdict
- 🎨 **Design noir/blanc/jaune** `#F5F200`, premium et fluide

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Clé API Anthropic ([console.anthropic.com](https://console.anthropic.com))

### Installation

```bash
unzip ai-car-buyer.zip
cd ai-car-buyer
npm install
cp .env.example .env.local
# Éditer .env.local et coller la clé : ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Ouvre http://localhost:3000.

## ☁️ Déploiement Vercel (5 minutes)

1. Pousser sur GitHub :
   ```bash
   git init
   git add .
   git commit -m "AI Car Buyer Pro v2"
   gh repo create ai-car-buyer --public --source=. --push
   ```

2. Sur [vercel.com](https://vercel.com) : **Add New Project** → choisir le repo.

3. Dans **Environment Variables** :
   - `ANTHROPIC_API_KEY` = ta clé
   - `ANTHROPIC_MODEL` = `claude-sonnet-4-5` (optionnel)

4. **Deploy**.

## 🏗️ Architecture

```
ai-car-buyer/
├── app/
│   ├── api/
│   │   ├── analyze/free/route.ts       # Étape 1 : scrape + scoring + impression
│   │   └── analyze/premium/route.ts    # Étape 2 : analyse complète après "paiement"
│   ├── globals.css                     # Variables CSS palette
│   ├── layout.tsx
│   └── page.tsx                        # Orchestrateur du flow
├── components/
│   ├── Landing.tsx                     # Saisie URLs (bloc + bouton "+ Ajouter")
│   ├── Questionnaire.tsx               # 7 questions adaptatives
│   ├── LoadingScreen.tsx               # Loading mode free/premium
│   ├── FreeAnalysisScreen.tsx          # Cartes véhicules + paywall
│   ├── PaywallScreen.tsx               # Faux paiement
│   ├── PremiumAnalysisScreen.tsx       # 9 sections détaillées
│   ├── TopBar.tsx
│   ├── Footer.tsx
│   └── ui.tsx
├── lib/
│   ├── scraper.ts                      # Scraping AutoScout24, Anibis, etc.
│   ├── claude.ts                       # aiExtractListing, aiFreeAnalysis, aiPremiumAnalysis
│   └── scoring.ts
└── types/index.ts
```

## 🔄 Flow utilisateur

```
1. Landing
   └─ Coller liens AutoScout (au moins 1)
        ▼
2. Questionnaire (7 étapes)
   └─ Budget → Ville → Usage → Km annuel → Priorité → Assurance → Profil conducteur
        ▼
3. Loading "free"
   └─ Backend : scrape parallèle → AI extraction si besoin → scoring → AI free analysis
        ▼
4. Free Result
   └─ Cartes véhicules avec score, première impression, badges
   └─ Bouton "Débloquer l'analyse complète"
        ▼
5. Paywall (CHF 19, faux paiement démo)
        ▼
6. Loading "premium"
   └─ Backend : aiPremiumAnalysis (1 gros appel Claude avec contexte canton, profil…)
        ▼
7. Premium Result — 9 sections
   ├─ Résumé final
   ├─ Comparaison générale (tableau 12 critères)
   ├─ Comparaison moteur
   ├─ Coûts réels en Suisse (par canton)
   ├─ Options & équipements
   ├─ Fiabilité & risques
   ├─ Revente en Suisse
   ├─ Négociation (script personnalisé)
   └─ Verdict final
```

## ⚠️ Important

- **Ne jamais inventer de véhicules** : l'app analyse UNIQUEMENT les annonces fournies.
- Les estimations de coûts (assurance, plaques) sont **indicatives** — toujours confirmer avec un assureur ou le SAN cantonal.
- Le paiement actuel est **factice** (mode démo). Pour un vrai paiement : intégrer Stripe Checkout avec une API route `/api/checkout` puis vérifier `paid: true` avant de déclencher `analyze/premium`.

## 🎨 Personnalisation

### Palette
Toutes les couleurs sont dans `app/globals.css` (variables CSS). Modifie `--accent` pour changer le jaune.

### Ajouter un site supporté
Édite `lib/scraper.ts` :
1. Ajoute la détection dans `detectSource()`
2. Crée `scrapeMonSite(html, url)` (modèle : `scrapeAutoScout`)

### Modifier les questions du QCM
Édite la constante `QUESTIONS` dans `components/Questionnaire.tsx`.

### Activer Stripe (paiement réel)
1. Crée une `/api/checkout/route.ts` qui retourne une URL Stripe Checkout
2. Sur succès Stripe, redirige vers `/?paid=true&session_id=xxx`
3. Vérifie côté serveur le `session_id` avant de servir `/api/analyze/premium`

## 📜 Légal

Les recommandations sont indicatives et ne remplacent pas une expertise mécanique professionnelle. Le scraping respecte les conditions d'utilisation usuelles.

## 📄 Licence

Personnel uniquement.
