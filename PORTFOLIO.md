# Todo API — Notes de portfolio

API REST d'une application de gestion de tâches. Le projet sert avant tout de terrain d'exploration d'une stack Node.js/TypeScript moderne : authentification multi-stratégies, validation bout-en-bout, génération de documentation OpenAPI à partir des schémas, et pipeline de déploiement conteneurisé. L'accent est mis sur les choix d'architecture plutôt que sur le périmètre fonctionnel.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| Node.js v22 / TypeScript 5.7 | Runtime et typage strict (`strict: true`, target ES2022) |
| Express 4 | Framework HTTP, middleware chain |
| MongoDB / Mongoose 8 | Base de données document, schémas avec hooks pre-save/pre-delete |
| Passport.js | Authentification multi-stratégies (Local, JWT, Google OAuth2, Slack OAuth2) |
| jsonwebtoken | Access token + Refresh token (cookie HttpOnly) |
| bcryptjs | Hachage des mots de passe (salt factor 10) |
| Zod 3 | Validation des entrées (body, query, params, headers, cookies) |
| @asteasolutions/zod-to-openapi | Génération du schéma OpenAPI 3.1 à partir des schémas Zod |
| Swagger UI Express | Documentation interactive servie sur `/api-docs` |
| Resend + React Email | Envoi d'emails transactionnels via templates React |
| express-rate-limit | Limitation de débit sur les endpoints d'authentification |
| date-fns / @date-fns/tz | Manipulation de dates avec support timezone par utilisateur |
| Jest + ts-jest + Supertest | Tests d'intégration sur les endpoints HTTP |
| Docker (multi-stage) | Image de production allégée, utilisateur non-root |
| GitHub Actions | CI/CD vers serveur via SSH |

---

## Fonctionnalités

- Authentification email/mot de passe, Google OAuth2, Slack OAuth2
- Gestion de compte : vérification d'email, réinitialisation de mot de passe
- CRUD de tâches avec tags, priorité, date d'échéance et position (ordre manuel)
- Opérations en lot sur les tâches (bulk update/delete) protégées par API Key
- Emails de rappel quotidiens envoyés à l'heure locale de chaque utilisateur
- Documentation OpenAPI auto-générée et servie en live

---

## Architecture

L'API suit une architecture en couches stricte :

```
routes/          → définition des endpoints, branchement des middlewares
controllers/     → extraction des données de la requête, appel service, réponse HTTP
services/        → logique métier (users.service, tasks.service)
models/          → schémas Mongoose, hooks de cycle de vie
schemas/         → schémas Zod partagés entre validation et génération OpenAPI
middlewares/     → auth, validateRequest, rateLimiter, verifyApiKey
```

**Points notables :**

- **Validation centralisée** — un middleware `validateRequest` reçoit un schéma Zod et valide n'importe quelle partie de la requête ; les erreurs remontent formatées avec chemin et message.
- **Auth par callback Passport** — les stratégies ne gèrent pas de session ; chaque requête est authentifiée via JWT Bearer ou cookie refresh, avec un handler dédié qui expose `req.user`.
- **Schéma unique, double usage** — les schémas Zod sont enregistrés dans un registre OpenAPI (`openapi/registry.ts`) ; la documentation est ainsi toujours synchronisée avec la validation réelle.
- **Tokens JWT** — access token de courte durée transmis en Bearer, refresh token en cookie HttpOnly (Secure + SameSite selon l'environnement). La rotation est gérée dans le contrôleur d'auth.
- **OAuth state sécurisé** — le paramètre `state` encode en base64url la timezone et l'URL de redirection ; il est vérifié à la callback pour prévenir le CSRF.
- **Erreurs typées** — hiérarchie de classes (`CustomError`, `NotFoundError`, `BadRequestError`, `UnauthorizedError`, `InternalError`) interceptées par un handler centralisé qui mappe vers les codes HTTP appropriés.
- **Emails avec React** — les templates sont des composants React rendus server-side via `react-dom/server` ; le serveur de prévisualisation (`@react-email/preview-server`) est disponible en développement.

---

## Déploiement

Pipeline GitHub Actions déclenché sur push vers `development` :

1. Checkout du code
2. Injection de la clé SSH via `webfactory/ssh-agent`
3. SSH sur le serveur → pull + `docker-compose` avec la config de production

**Image Docker multi-stage :**

| Stage | Rôle |
|---|---|
| `base` | Node LTS Alpine, copie des manifestes |
| `development` | Installation des dépendances, hot-reload (`ts-node-dev`) |
| `builder` | Compilation TypeScript, résolution des alias de chemins (`tsc-alias`) |
| `production` | Image finale Alpine, dépendances de prod uniquement, utilisateur non-root (`apiuser`, UID 1001) |
