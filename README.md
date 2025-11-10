# 🎮 Rift Rewind

An AI-powered League of Legends match analysis platform that transforms gameplay data into personalized insights and performance analytics.

![Rift Rewind](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![AWS](https://img.shields.io/badge/AWS-Amplify-orange?style=for-the-badge&logo=amazon-aws)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

- 🤖 **AI-Powered Insights** - Leverage Amazon Bedrock to analyze match patterns
- 📊 **Performance Analytics** - Track trends across your last 20 matches
- 🎯 **Match Deep Dive** - Detailed analysis of champion picks and performance
- 💬 **AI Chat Assistant** - Interactive AI that answers questions about your gameplay
- 🌍 **EUW Player Pool** - Compare performance across 500 Europe West summoners
- 🎨 **Cyberpunk UI** - Stunning Figma-designed interface with animations

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- AWS Account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rift-rewind.git
cd rift-rewind

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API URLs to .env.local
# NEXT_PUBLIC_API_GATEWAY_URL=your-api-url
# NEXT_PUBLIC_CHAT_API_URL=your-chat-api-url

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📦 Project Structure

```
rift-rewind/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   └── services/         # API services
├── public/               # Static assets
├── scripts/              # Utility scripts
├── docs/                 # Documentation
├── amplify.yml           # AWS Amplify config
└── package.json
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible components
- **Recharts** - Data visualization

### Backend & AI
- **AWS Bedrock** - AI model inference
- **AWS Lambda** - Serverless functions
- **DynamoDB** - NoSQL database
- **API Gateway** - REST API management

### Deployment
- **AWS Amplify** - Hosting and CI/CD
- **CloudFront** - Global CDN

## 🌐 Deployment

### Deploy to AWS Amplify (Recommended)

1. **Visit AWS Amplify Console**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **Create New App**
   - Click "New app" → "Host web app"
   - Select "GitHub" and authorize

3. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_GATEWAY_URL=your-api-url
   NEXT_PUBLIC_CHAT_API_URL=your-chat-api-url
   NEXT_PUBLIC_AWS_REGION=us-east-1
   ```

4. **Deploy**
   - Click "Save and deploy"
   - Wait 3-5 minutes
   - Done! 🎉

For detailed deployment instructions, see [docs/AMPLIFY_DEPLOYMENT.md](docs/AMPLIFY_DEPLOYMENT.md)

## 📚 Documentation

- [Deployment Guide](docs/AMPLIFY_DEPLOYMENT.md) - Complete AWS Amplify deployment guide
- [Quick Start](docs/AMPLIFY_QUICK_START.txt) - Quick reference for deployment
- [Deployment Checklist](docs/AMPLIFY_CHECKLIST.md) - Pre-deployment checklist

## 🎨 Design

The UI was designed in Figma with a cyberpunk aesthetic featuring:
- Neon color scheme (cyan, magenta, yellow)
- Animated grid backgrounds
- Glowing effects and scanlines
- Smooth transitions and hover effects

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_GATEWAY_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_CHAT_API_URL=https://your-api.execute-api.us-east-1.amazonaws.com/prod/chat
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👩‍💻 Author

**LadyWinterD**
- GitHub: [@LadyWinterD](https://github.com/LadyWinterD)
- A passionate League of Legends fan combining AI and design

## 🏆 Acknowledgments

- Built for AWS × Riot Games Hackathon 2025
- Powered by AWS AI services
- Data from Riot Games API
- Inspired by the League of Legends community

## 📊 Project Stats

- **500 Summoners** analyzed
- **Europe West Server** data
- **Last 20 Matches** per player
- **AI-powered** insights

---

Made with ❤️ for the League of Legends community
