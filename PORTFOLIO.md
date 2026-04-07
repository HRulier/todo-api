# Todo API - Application Web Full-Stack avec Orchestration Intelligente

## 🎯 Concept

Une application de gestion de tâches conçue comme une vitrine technique de ma stack de prédilection, avec une architecture pensée pour l'intégration d'IA et l'automatisation multi-services. Le projet privilégie la solidité technique et l'extensibilité plutôt que l'innovation UI/UX.

---

## 🏗️ Stack Technique Maîtrisée

**Backend Robuste**
- **Node.js + TypeScript** - Type safety et developer experience optimale
- **Express.js** - Framework éprouvé avec architecture middleware
- **MongoDB + Mongoose** - Base NoSQL avec ODM puissant
- **Passport.js** - Stratégies d'authentification multiples (Local, JWT, OAuth2)

**Sécurité & Standards**
- **JWT dual-token** (access + refresh avec rotation automatique)
- **bcryptjs** - Hashing de mots de passe (salt factor 10)
- **Validation stricte** avec Zod schemas
- **Rate limiting** et CORS configuré
- **OpenAPI/Swagger** - Documentation API auto-générée

---

## 🔐 Système d'Authentification Complet

**Multi-stratégies** avec architecture Passport:
- Authentification email/password traditionnelle
- OAuth2 Google & Slack
- Vérification email obligatoire
- Reset de mot de passe sécurisé

**Sécurité renforcée**:
- Refresh token stocké en HTTP-only cookie
- Token rotation à chaque refresh
- Expiration automatique des tokens
- Protection XSS et CSRF

---

## 🤖 Architecture "AI-Ready" - La Vraie Innovation

### **1. Pattern d'Orchestration via Opérations Pendantes**

**Le concept**: Une couche d'abstraction qui permet à des services externes (Slack, n8n, MCP) de créer des "opérations en attente" nécessitant une validation humaine avant exécution.

**Fonctionnement**:
```typescript
// Création d'opération depuis Slack/n8n
POST /api/operations
{
  "user": "slack_user_id",
  "source": "slack",
  "type": "bulk_create_tasks",
  "payload": { "tasks": [...] },
  "metadata": { "channel": "channel_id" }
}

// Validation et exécution
PATCH /api/operations/:shortId
{ "status": "approved" | "rejected" }
```

**Avantages**:
- ✅ Validation humaine dans la boucle (human-in-the-loop)
- ✅ Traçabilité complète (qui, quand, d'où)
- ✅ Extensible à d'autres types d'opérations
- ✅ Source-agnostic (Slack, n8n, MCP, CLI...)

### **2. Intégration Slack Bot + n8n**

**Use case réel**:
1. L'utilisateur envoie un message naturel à Slack
2. n8n intercepte, parse avec IA, structure les tâches
3. Création d'une opération `pending` via l'API
4. Slack affiche les tâches avec boutons Approve/Deny
5. Validation → exécution atomique et feedback instantané

**Stack d'automatisation**:
- Slack App avec OAuth2 intégration
- n8n workflows pour l'orchestration
- API Operations comme couche de validation
- Webhooks pour le feedback asynchrone

### **3. MCP Server (Model Context Protocol) - En développement**

Permettra aux IA (Claude, GPT) d'interagir directement avec l'API pour :
- Lire et créer des tâches en contexte
- Analyser la charge de travail
- Suggérer des optimisations de planning
- Automatiser la création de tâches récurrentes

---

## ✨ Features Avancées

- **Gestion de timezone** par utilisateur
- **Tâches récurrentes** (quotidien, hebdomadaire, mensuel)
- **Emails transactionnels** avec React Email
- **Soft delete** et restauration
- **Filtres et recherche** avancée
- **Bulk operations** pour performances optimales

---

## 📈 Évolutions Futures

- **MCP Server** pour intégration Claude/GPT native
- **Migration MongoDB Cluster** pour exploiter les transactions ACID et garantir la cohérence des opérations multi-collections

---

## 🔑 Pourquoi ce Projet ?

Ce n'est pas "juste une todo app" - c'est une **plateforme d'orchestration** qui démontre :

✅ Ma maîtrise de la **stack TypeScript/Node.js/MongoDB**  
✅ Ma compréhension de l'**architecture orientée services**  
✅ Ma capacité à **anticiper l'intégration IA** (MCP, LLM-friendly APIs)  
✅ Mon approche **sécurité-first** (auth complète, validation stricte)  
✅ Ma vision **DevOps** (Docker, tests, CI/CD)  

**L'innovation n'est pas dans l'interface** - elle est dans l'architecture qui permet à des humains et des IA de collaborer via des opérations orchestrées et validées.

---

## 📦 Liens

- **Repository**: [github.com/HRulier/todo-api](https://github.com/HRulier/todo-api)
- **API Documentation**: Swagger auto-générée
- **Stack**: TypeScript, Express, MongoDB, Passport, JWT, Zod, Docker
