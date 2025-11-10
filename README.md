# 🎮 RIFT REWIND

<div align="center">

![Rift Rewind Banner](https://img.shields.io/badge/AWS-Riot_Games_Hackathon_2025-FF9900?style=for-the-badge&logo=amazon-aws)
![License](https://img.shields.io/badge/License-MIT-cyan?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

**An AI-powered League of Legends analysis agent that transforms match data into personalized insights**

[Live Demo](#) • [Video Demo](#) • [Documentation](#getting-started)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Methodology](#-methodology)
- [AWS Services](#-aws-services-used)
- [Project Structure](#-project-structure)
- [Challenges & Learnings](#-challenges--learnings)
- [Future Improvements](#-future-improvements)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

**Rift Rewind** is an AI-powered coaching agent built for the **AWS × Riot Games Hackathon 2025**. It analyzes League of Legends match history data from **500 EUW summoners** (last 20 matches each) to deliver personalized insights that help players **reflect**, **learn**, and **improve** their gameplay.

Unlike traditional stat-tracking sites like op.gg, Rift Rewind leverages **AWS Generative AI services** to provide:
- 🧠 **AI-generated tactical analysis** of playstyle patterns
- 📊 **Performance visualizations** with trend analysis
- 🎯 **Personalized coaching recommendations** based on match history
- 💬 **Interactive AI chatbot** for natural language queries about gameplay
- 🏆 **Champion mastery insights** and performance breakdowns

### 🎯 Hackathon Goals Achieved

✅ **Personalized Insights**: AI-driven analysis of persistent strengths and weaknesses  
✅ **Progress Visualization**: Interactive charts showing KDA, win rate, and CS trends  
✅ **Year-End Recap**: Champion pool analysis, best/worst performances, and playstyle patterns  
✅ **Social Engagement**: Shareable match cards and performance summaries  
✅ **Beyond op.gg**: Generative AI insights that go deeper than traditional stats  

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **Neural Tactical Analysis**: Amazon Bedrock analyzes your last 20 matches to identify playstyle patterns, strengths, and areas for improvement
- **Interactive AI Chatbot**: Ask questions about your gameplay in natural language and get intelligent responses
- **Personalized Coaching**: Receive actionable recommendations tailored to your champion pool and performance

### 📊 Performance Dashboard
- **Overall Statistics**: KDA, Win Rate, CS/min, and total games played
- **Champion Mastery**: Detailed breakdown of your champion pool with individual performance metrics
- **Match History**: Visual timeline of your recent 20 matches with detailed stats
- **Trend Analysis**: Track your performance evolution over time

### 🎮 Match Deep Dive
- **Detailed Match View**: Complete breakdown of each game including items, runes, and summoner spells
- **Team Composition**: Full team rosters with performance comparisons
- **Visual Analytics**: Interactive charts and graphs for easy understanding

### 🎨 Cyberpunk UI/UX
- **Figma-Designed Interface**: Professional, modern design with cyberpunk aesthetics
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and interactions

---

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Recharts** - Data visualization
- **Shadcn/ui** - Component library

### Backend & AI
- **AWS Lambda** - Serverless compute
- **Amazon Bedrock** - Generative AI foundation models
- **Amazon DynamoDB** - NoSQL database for match data
- **API Gateway** - RESTful API management

### Data Source
- **Riot Games League API** - Official match history data
- **500 EUW Summoners** - Dataset scope
- **Last 20 Matches per Player** - Analysis window

### Design
- **Figma** - UI/UX design and prototyping

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+ 
npm or yarn
AWS Account (for backend services)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LadyWinterD/rift-rewind.git
cd rift-rewind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your AWS credentials:
```env
NEXT_PUBLIC_API_GATEWAY_URL=your_api_gateway_url
AWS_REGION=your_aws_region
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

### Building for Production
```bash
npm run build
npm start
```

---

## 🧠 Methodology

### Data Collection & Processing

1. **Dataset Scope**
   - **500 summoners** from the Europe West (EUW) server
   - **Last 20 matches** per summoner (10,000 total matches)
   - Match data includes: champion picks, KDA, CS, items, runes, summoner spells, game duration, and win/loss

2. **Data Pipeline**
   ```
   Riot API → Python Crawler → DynamoDB → Lambda Functions → Frontend
   ```

3. **Data Enrichment**
   - Calculate aggregate statistics (avg KDA, win rate, CS/min)
   - Identify champion pool and mastery levels
   - Track performance trends over time
   - Extract tactical patterns (early game, mid game, late game performance)

### AI Analysis Approach

#### 1. **Tactical Pattern Recognition**
Using **Amazon Bedrock (Claude 3.5 Sonnet)**, we analyze:
- **Champion Selection Patterns**: Preferred roles, champion diversity
- **Performance Consistency**: KDA variance, win streaks/loss streaks
- **Playstyle Identification**: Aggressive vs. Passive, Farm-focused vs. Fight-focused
- **Time-based Performance**: Early game vs. Late game strengths

#### 2. **Insight Generation**
The AI generates:
- **Strengths**: What the player does well consistently
- **Weaknesses**: Areas needing improvement
- **Recommendations**: Actionable coaching advice
- **Trend Analysis**: Performance trajectory over the last 20 matches

#### 3. **Natural Language Interface**
The chatbot uses:
- **Context-aware responses**: Understands player's match history
- **Preset questions**: Common queries like "What's my best champion?"
- **Custom queries**: Free-form questions about gameplay
- **Match-specific analysis**: Deep dive into individual games

### Key Insights Discovered

During development, we discovered several interesting patterns:

1. **Champion Pool Diversity**: Players with 3-5 main champions tend to have higher win rates than one-tricks or players with too diverse pools
2. **Performance Volatility**: KDA variance is a strong indicator of consistency and skill level
3. **CS Patterns**: CS/min correlates strongly with game outcome, especially in the first 15 minutes
4. **Role Adaptation**: Players who adapt their playstyle based on team composition perform better

---

## ☁️ AWS Services Used

### 1. **Amazon Bedrock**
- **Model**: Claude 3.5 Sonnet
- **Purpose**: Generate tactical analysis, coaching insights, and natural language responses
- **Cost Optimization**: Batch processing, prompt caching, and efficient token usage

### 2. **AWS Lambda**
- **Functions**:
  - `searchSummoner`: Retrieve player data from DynamoDB
  - `chatbot`: Handle AI chatbot interactions
  - `matchAnalysis`: Generate match-specific insights
- **Runtime**: Python 3.12
- **Triggers**: API Gateway HTTP requests

### 3. **Amazon DynamoDB**
- **Tables**:
  - `PlayerData`: Stores summoner profiles and aggregate stats
  - `MatchHistory`: Individual match records
- **Indexes**: GSI on `summonerName` for fast lookups
- **Capacity**: On-demand billing for cost efficiency

### 4. **Amazon API Gateway**
- **Type**: REST API
- **Endpoints**:
  - `GET /search?puuid={puuid}`: Fetch player data
  - `POST /chat`: AI chatbot interactions
  - `GET /match/{matchId}`: Match details
- **CORS**: Enabled for frontend access

### 5. **AWS CloudWatch**
- **Monitoring**: Lambda function logs and metrics
- **Alarms**: Error rate and latency thresholds

### Resource Tagging
All AWS resources are tagged with:
```
Key: rift-rewind-hackathon
Value: 2025
```

---

## 📁 Project Structure

```
rift-rewind/
├── src/
│   ├── app/
│   │   ├── page.js              # Main application page
│   │   ├── layout.js            # Root layout
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── CyberStatCard.tsx    # Stat display cards
│   │   ├── CyberMatchCard.tsx   # Match history cards
│   │   ├── CyberAnalysisPanel.tsx # AI analysis panel
│   │   ├── CyberMatchDetailModal.tsx # Match detail view
│   │   ├── RiftAI.tsx           # AI chatbot component
│   │   ├── PlayerSearchBar.tsx  # Search interface
│   │   ├── CyberLoadingScreen.tsx # Loading animation
│   │   ├── AboutTab.tsx         # About page
│   │   └── ui/                  # Shadcn UI components
│   └── services/
│       └── awsService.ts        # AWS API integration
├── public/
│   ├── items/                   # Item icons
│   └── spells/                  # Summoner spell icons
├── lambda/
│   ├── lambda_chatbot.py        # Chatbot Lambda function
│   └── search_summoner.py       # Search Lambda function
├── scripts/
│   ├── crawler.py               # Data collection script
│   └── data_enrichment.py       # Data processing script
├── player_manifest.json         # Summoner PUUID mapping
└── README.md
```

---

## 💡 Challenges & Learnings

### Challenges Faced

1. **Data Volume Management**
   - **Challenge**: Processing 10,000 matches efficiently
   - **Solution**: Implemented batch processing and DynamoDB pagination

2. **AI Cost Optimization**
   - **Challenge**: Bedrock API costs can escalate quickly
   - **Solution**: Used prompt caching, smaller context windows, and efficient prompts

3. **Real-time Performance**
   - **Challenge**: Generating AI insights without long wait times
   - **Solution**: Pre-computed aggregate stats, async processing, and loading states

4. **Data Consistency**
   - **Challenge**: Riot API rate limits and data format variations
   - **Solution**: Implemented retry logic, error handling, and data validation

### Key Learnings

- **Prompt Engineering**: Crafting effective prompts for consistent AI outputs
- **Serverless Architecture**: Benefits of Lambda for scalable, cost-effective backends
- **UI/UX Design**: Importance of visual feedback during AI processing
- **Data Modeling**: Efficient DynamoDB schema design for fast queries

---

## 🔮 Future Improvements

- [ ] **Expanded Dataset**: Include more summoners and longer match history
- [ ] **Multi-Region Support**: Add support for NA, KR, and other regions
- [ ] **Friend Comparisons**: Social features to compare with friends
- [ ] **Video Highlights**: Integration with match replay analysis
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Live Match Analysis**: Real-time coaching during games
- [ ] **Team Analytics**: 5v5 team performance insights
- [ ] **Export Features**: PDF reports and social media cards

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **AWS** - For providing the AI infrastructure and hackathon opportunity
- **Riot Games** - For the League API and amazing game
- **Faker & T1** - For the inspiration ❤️
- **Community** - For feedback and support

---

## 👩‍💻 About the Developer

**LadyWinterD**  
Passionate League of Legends fan and AI enthusiast combining design and development to create meaningful player experiences.

- 🌐 GitHub: [@LadyWinterD](https://github.com/LadyWinterD)
- 💜 Faker Fan & T1 Supporter
- 🎨 Designed in Figma, Built with ❤️

---

<div align="center">

**Built for AWS × Riot Games Hackathon 2025**

*Dive into the data • Discover your story*

</div>
