# Use Node.js 18 as base
FROM node:18-bullseye

# Install Chrome and dependencies
RUN apt-get update && apt-get install -y \
    chromium-browser \
    libgbm1 \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    fonts-liberation \
    xdg-utils \
    wget \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /opt/render/.cache/puppeteer \
    && chmod -R 777 /opt/render/.cache/puppeteer

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install Puppeteer browsers
RUN npx puppeteer browsers install chrome

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Switch to non-root user
USER pptruser

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
