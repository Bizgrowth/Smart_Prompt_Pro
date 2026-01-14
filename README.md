# AI Prompt Pro

Professional Prompt Engineering Platform for managing AI prompts across Claude, ChatGPT, and Gemini.

## Features

✅ **Multi-LLM Support** - Work with Claude, ChatGPT, and Gemini from one platform
✅ **Quick & Advanced Modes** - Natural language or structured form builder  
✅ **Cloud Database** - Supabase backend with cross-device sync
✅ **Prompt Library** - Store, search, and organize all your prompts
✅ **Performance Tracking** - Monitor success rates and effectiveness
✅ **Template System** - Pre-built templates for common use cases
✅ **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: CSS Modules with custom design system
- **APIs**: Anthropic (Claude), OpenAI (ChatGPT), Google (Gemini)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)
- API keys for LLMs you want to use (optional, can add later)

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up (~2 minutes)
4. Go to **Project Settings** > **API**
5. Copy your **Project URL** and **anon/public key**

### 2. Set Up Database Schema

1. In your Supabase project, go to the **SQL Editor**
2. Create a new query
3. Copy the entire contents of `supabase/schema.sql` from this project
4. Run the query to create all tables, indexes, and security policies

### 3. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
AI_Prompt_Pro/
├── app/                      # Next.js app router pages
│   ├── auth/                 # Authentication pages
│   │   ├── login/           
│   │   └── signup/          
│   ├── dashboard/            # Main dashboard
│   ├── builder/              # Prompt builder (quick & advanced)
│   ├── templates/            # Template library
│   ├── library/              # Saved prompts library
│   ├── analytics/            # Performance tracking
│   ├── globals.css           # Global styles & design system
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/               # Reusable components
│   ├── ui/                   # UI components (Button, Input, etc.)
│   ├── builder/              # Prompt builder components
│   ├── templates/            # Template components
│   └── layout/               # Layout components
├── lib/                      # Utilities and configurations
│   ├── supabase/             # Supabase client & types
│   ├── llm/                  # LLM API integrations
│   ├── nlp/                  # Natural language processing
│   └── utils/                # Helper functions
├── supabase/                 # Database schema & migrations
│   └── schema.sql            # Complete database schema
└── package.json
```

## Database Schema

The application uses 5 main tables:

1. **prompt_projects** - Master table for organizing work
2. **prompt_components** - Detailed prompt engineering fields
3. **prompt_templates** - Reusable templates
4. **generated_prompts** - Compiled prompts with execution results
5. **performance_tracking** - Usage analytics and metrics

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## API Integration

### Adding API Keys

API keys are stored securely in the browser (not on the server) to protect your privacy.

1. Sign in to your  account
2. Go to Settings > API Keys
3. Add your keys for:
   - **Claude**: Get from [console.anthropic.com](https://console.anthropic.com)
   - **ChatGPT**: Get from [platform.openai.com](https://platform.openai.com)
   - **Gemini**: Get from [makersuite.google.com](https://makersuite.google.com)

### Supported Models

- **Claude**: claude-3-opus, claude-3-sonnet, claude-3-haiku
- **OpenAI**: gpt-4, gpt-4-turbo, gpt-3.5-turbo
- **Gemini**: gemini-pro

## Usage

### Quick Mode

1. Go to Dashboard > Quick Mode
2. Describe your prompt in natural language
3. Answer AI-generated questions to fill in details
4. Review and edit extracted fields
5. Save to your library

### Advanced Mode

1. Go to Dashboard > Advanced Builder
2. Fill in structured sections:
   - Role Definition
   - Context & Background
   - Task & Instructions
   - Input/Output Specifications
   - Examples & Few-Shot Learning
   - Edge Cases & Guardrails
   - Quality & Refinement
3. Preview compiled prompt
4. Save and execute

### Executing Prompts

1. Select a saved prompt from your library
2. Choose LLM provider and model
3. Input test data
4. Execute and view results
5. Results are automatically saved with the prompt

### Templates

1. Browse the template library
2. Select a template for your use case
3. Customize fields to match your needs
4. Save as a new project

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Node.js

Make sure to set the environment variables wherever you deploy.

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Security

- **Authentication**: Handled by Supabase Auth with secure tokens
- **Row Level Security**: Database policies ensure users only access their data
- **API Keys**: Stored client-side in encrypted browser storage
- **Environment Variables**: Never committed to version control

## Contributing

This is a personal/business tool, but suggestions and improvements are welcome!

## License

Private use only.

## Support

For issues or questions:
1. Check the documentation in `docs/`
2. Review the database schema in `supabase/schema.sql`
3. Check the implementation plan in the artifacts folder

## Roadmap

- [ ] AI-powered prompt optimization suggestions
- [ ] Prompt versioning and comparison
- [ ] Team collaboration features
- [ ] Export prompts to PDF/JSON
- [ ] Bulk testing against multiple inputs
- [ ] Integration with popular tools (Zapier, Slack, etc.)
- [ ] Advanced analytics and reporting

---

Built with ❤️ for professional prompt engineering
