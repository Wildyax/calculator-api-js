# Calculator API & Frontend

Une application de calculatrice complète avec un backend Node.js (API REST) et un frontend interactif moderne, le tout conteneurisé avec Docker.

## 🚀 Fonctionnalités

- **Calculs de base** : Addition, Soustraction, Multiplication, Division.
- **Interface Moderne** : Design réaliste style calculatrice physique.
- **API REST** : Backend robuste gérant la logique métier et les erreurs (ex: division par zéro).
- **Tests** : Suite de tests unitaires et d'intégration complète avec Jest.
- **Dockerisé** : Déploiement facile avec Docker Compose.

## 📁 Structure du projet

```text
.
├── backend/            # API Node.js & Tests
│   ├── src/            # Code source du serveur et de la calculatrice
│   ├── tests/          # Tests unitaires et d'intégration
│   └── Dockerfile      # Configuration Docker pour le backend
├── frontend/           # Interface utilisateur
│   ├── index.html      # Structure HTML
│   ├── style.css       # Design CSS (Calculatrice réaliste)
│   ├── script.js       # Logique frontend & appels API
│   └── Dockerfile      # Configuration Nginx pour le frontend
└── docker-compose.yml  # Orchestration des containers
```

## 🛠️ Installation et Démarrage

### Prérequis
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Lancer l'application
Pour démarrer le frontend et le backend simultanément :

```bash
docker-compose up --build
```

Une fois les containers lancés :
- **Frontend** : Accessible sur [http://localhost:8080](http://localhost:8080)
- **Backend API** : Accessible sur [http://localhost:3000](http://localhost:3000)

## 🧪 Tests

Les tests sont exécutés à l'intérieur du container backend. Assurez-vous que les containers sont en cours d'exécution avant de lancer les commandes suivantes.

### Exécuter tous les tests
```bash
docker-compose exec backend npm test
```

### Exécuter les tests unitaires
```bash
docker-compose exec backend npm run test:unit
```

### Exécuter les tests de couverture (Coverage)
```bash
docker-compose exec backend npm run test:coverage
```

### Exécuter les tests fonctionnels (Playwright E2E)
```bash
docker-compose exec backend npm run test:e2e
```

## 🔌 API Endpoints

### Calculer
**GET** `/calculate?operation={op}&a={numA}&b={numB}`

- **Paramètres** :
    - `operation` : `add`, `subtract`, `multiply`, `divide`
    - `a` : Nombre
    - `b` : Nombre
- **Exemple** : `http://localhost:3000/calculate?operation=add&a=10&b=5`
- **Réponse** : `{ "operation": "add", "a": 10, "b": 5, "result": 15 }`
