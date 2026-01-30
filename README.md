
# XCAL Frontend

A modern, real-time collaborative whiteboard application built with Next.js, featuring a hand-drawn aesthetic powered by Rough.js.


**Live Site:** [https://xcal.codexbuild.website/](https://xcal.codexbuild.website/)

## 🎥 Demo

![App Demo](./assets/xcal_embed.gif)

## 🚀 Features

- **Real-time Collaboration**: Draw and sketch with others in real-time.
- **Tools**:
  - ✏️ **Pencil**: Freehand drawing.
  - ⬜ **Rectangle**: Create geometric shapes.
  - 🟣 **Ellipse**: Draw circles and ovals.
  - ➖ **Line**: Connect elements with straight lines.
  - ➡️ **Arrow**: Indicate direction and flow.
- **Hand-Drawn Style**: Shapes are rendered with a sketchy, organic look using Rough.js.
- **Authentication**: Secure user access.
- **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.
- **Dark Mode**: Optimized for visual comfort.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Graphics**: [Rough.js](https://roughjs.com/), HTML5 Canvas API
- **State Management**: React Hooks
- **Database Helper**: Prisma ORM
- **Authentication**: Clerk
- **Networking**: Axios, WebSocket

##  Repository Structure

The project follows a standard Next.js App Router structure with additional directories for game logic and utilities.

```bash
xcal_fe/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/              # Backend API routes
│   ├── canvas/           # Canvas page
│   ├── dashboard/        # User dashboard page
│   ├── draw/             # Drawing interface page
│   ├── joinRoom/         # Room joining page
│   ├── globals.css       # Global styles
│   └── page.tsx          # Landing page
├── components/           # Reusable React components
│   └── ui/               # UI components (buttons, inputs, etc.)
├── draw/                 # Core drawing logic
│   ├── draw.ts           # Canvas drawing implementation (Rough.js integration)
│   └── http.ts           # Game-specific HTTP helpers
├── lib/                  # Utilities and configuration
│   ├── prisma/           # Prisma schema
│   ├── prismaClient.ts   # Prisma client instance
│   └── utils.ts          # General utility functions
└── public/               # Static assets
```

## �📦 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm, yarn, pnpm, or bun

## 🏁 Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd xcal_fe
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Configure Environment Variables:**

    Copy the `.env.example` file to `.env` and fill in the required values:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your specific configuration (Backend URL, WebSocket URL, Auth secrets).

4.  **Database Setup:**
    
    Generate the Prisma client:

    ```bash
    npx prisma generate
    ```

5.  **Run the Development Server:**

    ```bash
    pnpm run dev
    ```

    Open [http://localhost:3001](http://localhost:3001) (or the port specified in the console) to view the application.

## 📜 Scripts

- `pnpm run dev`: Starts the development server with TurboPack.
- `pnpm run build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm run lint`: Lints the codebase.
- `pnpm run check-types`: Runs TypeScript type checking.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📄 License

[MIT](LICENSE)
