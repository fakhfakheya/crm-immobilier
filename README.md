# CRM Immobilier Augmenté — ZEN Group

Application CRM pour conseillers immobiliers : pipeline de prospects, catalogue de biens, matching automatique, planification de visites avec détection de conflits, et automatisations n8n avec IA.

## 🔗 Démo

- **Application déployée** : https://crm-immobilier-two.vercel.app
- **Dépôt Git** : https://github.com/fakhfakheya/crm-immobilier

## 🛠️ Stack technique

- **Frontend / Backend** : Next.js 16 (App Router, Server Actions)
- **Base de données** : PostgreSQL (Neon) + Prisma ORM
- **Styling** : Tailwind CSS
- **Automatisations** : n8n (3 workflows)
- **IA** : Groq (llama via API compatible OpenAI) — extraction de critères et génération de messages
- **Email** : Resend
- **Déploiement** : Vercel

## 📦 Installation locale

\`\`\`bash
git clone https://github.com/fakhfakheya/crm-immobilier.git
cd crm-immobilier
npm install
\`\`\`

1. Copier \`.env.example\` vers \`.env\` et renseigner vos propres valeurs (base Neon, clé Resend)
2. Appliquer le schéma de base de données :

\`\`\`bash
npx prisma migrate dev
\`\`\`

3. Lancer le serveur de développement :

\`\`\`bash
npm run dev
\`\`\`

4. Ouvrir http://localhost:3000

## 🏗️ Architecture

- \`app/leads\` — Pipeline, liste, création et fiche détaillée des prospects
- \`app/properties\` — Catalogue des biens + comparaison de 3 biens
- \`app/pipeline\` — Vue Kanban des prospects par étape
- \`app/api\` — Routes API (leads, tâches, visites, export RGPD)
- \`lib/matching.ts\` — Moteur de scoring de compatibilité prospect/bien
- \`lib/prisma.ts\` — Client Prisma singleton
- \`prisma/schema.prisma\` — Modèle de données (Agent, Lead, Property, Visit, Task, PropertyStatusLog)
- \`workflows/\` — Exports JSON des 3 workflows n8n

## 🤖 Workflows n8n

| Workflow | Déclencheur | Étapes |
|---|---|---|
| **W1 — Nouveau lead** | Webhook | Réception formulaire → extraction critères par IA (Groq) → création du lead + assignation conseiller |
| **W2 — Préparation visite** | Webhook | Réception confirmation → email de confirmation (Resend) |
| **W3 — Relance intelligente** | Manuel (simulerait un Cron quotidien) | Détection leads inactifs 5j+ → génération message par IA → sauvegarde en tâche à valider → conseiller valide manuellement avant envoi réel |

Les exports JSON sont dans le dossier \`workflows/\`.

## ✅ Fonctionnalités clés

- **Matching automatique** : score de compatibilité prospect/bien basé sur le budget, avec pénalités explicites
- **Détection de conflits d'agenda** : impossible de planifier 2 visites pour le même conseiller ou le même bien sur un créneau ±1h
- **RGPD** : export des données d'un prospect en JSON, suppression complète (cascade sur tâches et visites)
- **IA contrôlée** : toute génération de message (relance) passe par une validation humaine avant envoi — aucun envoi automatique

## ⚠️ Limites connues

- L'envoi d'emails utilise le domaine de test Resend (\`onboarding@resend.dev\`), limité à l'adresse du compte Resend. En production, un domaine vérifié serait nécessaire.
- Le workflow W3 (relance) est déclenché manuellement dans n8n pour la démo ; en production, un nœud Cron quotidien remplacerait le déclenchement manuel.
- Le masquage RGPD des logs est implémenté via \`lib/gdpr.ts\` mais n'est pas encore appliqué systématiquement à tous les \`console.log\` du projet.
- Pas de système d'authentification (hors périmètre du test technique).
- Le catalogue de biens n'a pas de pagination — pourrait être ajouté pour un volume important de biens.

