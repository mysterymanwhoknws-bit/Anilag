# Use a combined Python/Node image
FROM nikolaik/python-nodejs:python3.11-nodejs20

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Playwright browsers and system dependencies
RUN playwright install chromium
RUN playwright install-deps

# Install Node dependencies
COPY package.json .
RUN npm install

# Copy rest of the code
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
