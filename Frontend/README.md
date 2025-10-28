# SynthScore

SynthScore is an advanced educational assessment platform that provides automated evaluation and detailed feedback for student assignments. The platform offers a seamless experience for both students and educators, with features like detailed question analysis, performance tracking, and interactive dashboards.

## Features

### For Students
- View detailed evaluation reports
- Access question-by-question feedback
- Track performance over time
- Understand mistakes with detailed explanations

### For Educators
- Upload and evaluate answer sheets
- Generate comprehensive reports
- Track class performance
- Provide targeted feedback

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm (v9 or later) or yarn
- Python (v3.8 or later) for backend services

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/synthscore.git
   cd synthscore
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   # Add other environment variables as needed
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
synthscore/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── ...
├── components/            # Reusable UI components
├── lib/                   # Utility functions
├── public/                # Static files
└── styles/                # Global styles
```

## Tech Stack

- **Frontend**: Next.js 13+ with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Shadcn/UI
- **Form Handling**: React Hook Form
- **State Management**: React Context API
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - your.email@example.com

Project Link: [https://github.com/yourusername/synthscore](https://github.com/yourusername/synthscore)
