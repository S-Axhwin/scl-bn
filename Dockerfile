# Use an official Bun image as the base
FROM oven/bun:latest

# Set working directory inside the container
WORKDIR /app

# Copy package.json and bun.lockb to install dependencies
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of your project files
COPY . .

# Expose the port your app will run on (if necessary)
EXPOSE 3000

# Set the command to start your app (adjust it to match your app's entry point)
CMD ["bun", "run", "dev"]
