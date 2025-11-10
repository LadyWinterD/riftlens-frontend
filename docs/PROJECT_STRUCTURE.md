# 📁 Project Structure

## Overview

```
rift-rewind/
├── src/                    # Source code
│   ├── app/               # Next.js App Router
│   │   ├── page.js        # Main page
│   │   ├── layout.js      # Root layout
│   │   └── globals.css    # Global styles
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── CyberAnalysisPanel.tsx
│   │   ├── CyberMatchCard.tsx
│   │   ├── CyberMatchDetailModal.tsx
│   │   ├── CyberStatCard.tsx
│   │   ├── PlayerSearchBar.tsx
│   │   ├── RiftAI.tsx
│   │   └── AboutTab.tsx
│   └── services/          # API services
│       └── awsService.ts  # AWS API integration
├── public/                # Static assets
│   ├── items/            # Item icons
│   └── spells/           # Summoner spell icons
├── scripts/               # Utility scripts
│   ├── crawler.py        # Data crawler
│   ├── uploader.py       # S3 uploader
│   └── lambda_chatbot_updated.py  # Lambda function
├── docs/                  # Documentation
│   ├── AMPLIFY_DEPLOYMENT.md
│   ├── AMPLIFY_CHECKLIST.md
│   ├── AWS_DEPLOYMENT_GUIDE.md
│   └── QUICK_DEPLOY.md
├── amplify.yml            # AWS Amplify config
├── .env.example           # Environment variables template
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS config
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies
└── README.md              # Project documentation
```

## Key Directories

### `/src`
Main source code directory containing all application logic.

### `/src/app`
Next.js 13+ App Router directory with pages and layouts.

### `/src/components`
Reusable React components:
- **ui/** - Shadcn UI components (buttons, cards, dialogs, etc.)
- **Cyber*** - Custom cyberpunk-styled components
- **RiftAI** - AI chat interface
- **AboutTab** - About page component

### `/src/services`
API integration services for AWS Lambda and API Gateway.

### `/public`
Static assets served directly:
- **items/** - League of Legends item icons
- **spells/** - Summoner spell icons

### `/scripts`
Backend scripts and utilities:
- Data crawlers
- Lambda functions
- Deployment scripts
- Test scripts

### `/docs`
Project documentation:
- Deployment guides
- Configuration instructions
- Quick start guides

## Important Files

### Configuration Files

- **amplify.yml** - AWS Amplify build configuration
- **next.config.mjs** - Next.js framework configuration
- **tailwind.config.js** - Tailwind CSS styling configuration
- **tsconfig.json** - TypeScript compiler configuration
- **.env.example** - Environment variables template

### Data Files

- **player_manifest.json** - List of 500 EUW summoners with PUUIDs

### Documentation

- **README.md** - Main project documentation
- **LICENSE** - MIT License

## Environment Variables

Required environment variables (see `.env.example`):

```env
NEXT_PUBLIC_API_GATEWAY_URL=your-api-gateway-url
NEXT_PUBLIC_CHAT_API_URL=your-chat-api-url
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## Build Output

- **/.next/** - Next.js build output (gitignored)
- **/out/** - Static export output (gitignored)
- **/node_modules/** - Dependencies (gitignored)

## Ignored Files

See `.gitignore` for complete list of ignored files and directories.
