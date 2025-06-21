# KFAR Marketplace - Voice Commerce Platform

An innovative AI-powered voice commerce platform for the KFAR organic marketplace in Israel.

## 🌟 Features

- **🎤 Voice Commerce**: Natural language shopping with AI-powered understanding
- **🛒 Multi-Vendor Marketplace**: 6 unique vendors with diverse organic products
- **📱 Mobile-First Design**: Fully responsive and optimized for mobile devices
- **🌍 Multi-Language Support**: English and Hebrew (coming soon)
- **💳 QR Payment Integration**: Modern payment solutions
- **🤖 AI Assistant**: Intelligent product recommendations and search

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bakiel/kfar-shop.git
cd kfar-shop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your API keys.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Voice**: Web Speech API, ElevenLabs TTS
- **AI**: OpenRouter (Google Gemini 2.0)
- **Email**: SendGrid
- **Hosting**: Vercel

## 📁 Project Structure

```
├── app/              # Next.js app directory
├── components/       # React components
├── lib/              # Core services and utilities
├── hooks/           # Custom React hooks
├── config/          # Configuration files
├── public/          # Static assets
├── styles/          # Global styles
└── supabase/        # Database migrations
```

## 🔑 Environment Variables

See `.env.example` for all required environment variables.

## 📦 Deployment

This project is configured for automatic deployment to Vercel.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/bakiel/kfar-shop)

### Manual Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary software for KFAR Marketplace.

## 🔗 Links

- [Live Site](https://kfar-shop.vercel.app)
- [Documentation](docs/README.md)

---

Built with ❤️ for KFAR Marketplace