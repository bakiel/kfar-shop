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
      JWT_SECRET: "f188d148e3181c7c2946e0d81509f7a9e9b289a0d5a5aac8716cf2cdf9c93629",
      JWT_REFRESH_SECRET: "866db63e400ec8af95e4fefabea07150ffdd99a43a8ba5a1e3864a4dc61ac456",
      GEMINI_API_KEY: "AIzaSyAYP5kQRGJJVKB1gVsYFx6ZXWLxE_13Xi0",
      POSTGRES_HOST: "localhost",
      POSTGRES_PORT: "5432",
      POSTGRES_DB: "kfar_marketplace",
      POSTGRES_USER: "kfar",
      POSTGRES_PASSWORD: "kfar_secure_2025",
      NEXT_PUBLIC_APP_URL: "https://kfarapp.com",
      SMTP_HOST: "localhost",
      SMTP_PORT: "25",
      EMAIL_FROM_ADDRESS: "noreply@kfarapp.com",
      EMAIL_FROM_NAME: "KFAR Marketplace"
    }
  }]
};
