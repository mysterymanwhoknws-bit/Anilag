# Use a slim image that has both Node and Python
FROM nikolaik/python-nodejs:python3.11-nodejs20-slim

# 1. Install system dependencies manually (avoids 'install-deps' error)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Install Playwright and ONLY Chromium (saves space/time)
# We use 'install chromium' instead of 'install-deps'
RUN npx playwright install chromium

# 4. Install Node dependencies
COPY package.json .
RUN npm install

# 5. Copy the rest of your code
COPY . .

# Set environment variable so Playwright knows where browsers are
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

EXPOSE 3000
CMD ["npm", "start"]
