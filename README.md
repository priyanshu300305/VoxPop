# VoxPop Anonymous Feedback Platform

A modern, anonymous feedback platform built with React, TypeScript, and Tailwind CSS. Users can submit anonymous feedback, engage in two-way conversations with administrators, and track community progress on various issues.

## 🚀 Features

- **100% Anonymous Feedback**: Complete privacy protection for users
- **Two-Way Chat**: Continue conversations with administrators using session IDs
- **Community Feed**: See trending issues and upvote posts
- **Progress Tracking**: Monitor how community issues are being addressed
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Modern UI**: Beautiful, responsive design built with Radix UI components

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voxpop-feedback-platform.git
   cd voxpop-feedback-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy with Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project
   - Click "Deploy"

### Alternative: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 📱 Usage

### For Users
1. **Submit Feedback**: Go to the "Submit" tab and share your thoughts anonymously
2. **Get Session ID**: After submission, you'll receive a unique session ID
3. **Track Progress**: Use your session ID to view responses and continue conversations
4. **Community**: Browse and upvote other community issues

### For Administrators
1. **Dashboard**: Access the "Admin" tab for comprehensive analytics
2. **Manage Responses**: Respond to feedback and update issue status
3. **Analytics**: View sentiment analysis and trending topics
4. **Progress Tracking**: Update the status of community issues

## 🔧 Configuration

The platform uses Supabase for backend functionality. Update the configuration in `src/utils/supabase/info.tsx`:

```typescript
export const projectId = "your-supabase-project-id"
export const publicAnonKey = "your-supabase-anon-key"
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── AdminDashboard.tsx
│   ├── AnonymousChat.tsx
│   ├── CommunityFeed.tsx
│   ├── FeedbackSubmission.tsx
│   └── ProgressTracker.tsx
├── styles/              # Global styles
├── utils/               # Utility functions
└── main.tsx            # Application entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from [Figma](https://www.figma.com/design/OSajssuZRMLBzA0Z1DD2ir/VoxPop-Anonymous-Feedback-Platform)
- Built with modern web technologies for optimal performance and user experience

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**VoxPop** - Empowering communities through anonymous feedback and transparent progress tracking.
  