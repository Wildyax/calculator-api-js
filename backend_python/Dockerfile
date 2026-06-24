# Image de base Python
FROM python:3.11-slim

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY requirements.txt .

# Installation des dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copie du reste du code
COPY . .

# Exposer le port de l'API
EXPOSE 3000

# Commande par défaut
CMD ["python", "src/server.py"]
