FROM node:18-alpine

WORKDIR /app

# 1. Copier uniquement le package.json depuis le dossier api
COPY api/package*.json ./
RUN npm install

# 2. Copier tout le dossier api en conservant sa structure (ou en ciblant explicitement)
COPY api/ .

# 3. Le reste de vos instructions (EXPOSE et CMD)
EXPOSE 3000
CMD ["npm", "start"]