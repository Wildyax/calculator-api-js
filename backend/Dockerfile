# Image de base avec Playwright pré-installé (mise à jour v1.61.0)
FROM mcr.microsoft.com/playwright:v1.61.0-jammy

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances (y compris Playwright)
RUN npm install

# Copie du reste du code
COPY . .

# Exposer le port de l'API
EXPOSE 3000

# Commande par défaut
CMD ["npm", "start"]
