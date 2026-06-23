module.exports = {
  apps: [{
    name: "kfar",
    script: "node_modules/.bin/next",
    args: "start -p 3006",
    cwd: "/opt/kfar",
    max_restarts: 10,
    min_uptime: "10s",
    restart_delay: 3000,
    env: {
      NODE_ENV: "production",
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      POSTGRES_HOST: process.env.POSTGRES_HOST || "localhost",
      POSTGRES_PORT: process.env.POSTGRES_PORT || "5432",
      POSTGRES_DB: process.env.POSTGRES_DB || "kfar_marketplace",
      POSTGRES_USER: process.env.POSTGRES_USER || "kfar",
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      NEXT_PUBLIC_APP_URL: "https://kfarapp.com",
      SMTP_HOST: "localhost",
      SMTP_PORT: "25",
      EMAIL_FROM_ADDRESS: "noreply@kfarapp.com",
      EMAIL_FROM_NAME: "KFAR Marketplace"
    }
  }]
};
