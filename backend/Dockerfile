# Image de base
FROM node:20-slim

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code
COPY . .

# Exposer le port de l'API
EXPOSE 3000

# Commande par défaut (démarrage du serveur)
CMD ["npm", "start"]
