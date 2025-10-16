# 🚀 Express Boilerplate

A modular, scalable, and TypeScript-ready Express.js boilerplate with built-in code generation, structured to help you build robust Node.js applications quickly and cleanly.

---

## 📁 Project Structure

```
.
├── .vscode/                    # VSCode workspace settings
├── dist/                       # Compiled output (ignored in Git)
├── node_modules/               # Project dependencies
├── src/                        # Application source code
│   ├── common/                 # Shared utilities and helpers
│   ├── environments/           # Environment-specific configs
│   ├── generator/              # CLI generator to scaffold modules
│   ├── middlewares/            # Express middleware functions
│   ├── modules/                # Business logic modules
│   ├── paymentGateways/        # Payment gateway integrations
│   ├── services/               # External/internal service logic
│   ├── types/                  # TypeScript types and interfaces
│   ├── app.ts                  # Express app initialization
│   ├── main.ts                 # App entry point
│   ├── routes.ts               # Global routes config
│   └── sockets.ts              # WebSocket setup
├── static/                     # Public static files
├── .env                        # Environment variable file
├── .gitignore                  # Files to ignore in Git
├── .prettierignore             # Files to ignore during formatting
├── .prettierrc                 # Prettier configuration
├── build.ts                    # Optional build entry
├── package.json                # Project metadata and scripts
├── package-lock.json           # Locked versions of dependencies
├── serviceAccountKey.json      # Firebase or third-party config (secured)
├── tsconfig.json               # TypeScript compiler options
└── readme.md                   # Project documentation
```

---

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/atiq021/exrpress-boilerplate-v2.git
cd exrpress-boilerplate-v2
```

### 2. Install Root Dependencies

```bash
npm install
npm install -g tsx
```

### 3. Install Generator Dependencies

```bash
cd src/generator
npm install
cd ../../
```

---

## ⚙️ Using the Module Generator

This project includes a built-in generator for quickly scaffolding modules.

### 📌 Usage

```bash
npm run generate <ModuleName>
```

### 📌 Example

```bash
npm run generate Post
```

This will create a new `Post` module under `src/modules/`.

---

## 🚀 Running the App

### Development Mode (with tsx)

```bash
npm run dev
```

### Build & Run Production

**Note:** Before building, make sure `NODE_ENV` is set to either `production` or `staging` based on your environment. You can do this by updating the `.env` file or setting the environment variable directly.

```bash
# Set the environment variable (optional if using .env file)
export NODE_ENV=production   # or staging

# Build the project
npm run build

# Start the production server
npm start

```

---

## 🌐 Static Files

All files placed in the `static/` directory will be publicly served at the `/static` route.

**Example:**  
`static/uploads/avatar.png` → accessible at `http://localhost:5000/static/images/avatar.png`

---

## 📜 Available Scripts

| Script             | Description                      |
| ------------------ | -------------------------------- |
| `npm run dev`      | Run app with hot-reloading       |
| `npm run build`    | Compile TypeScript to JavaScript |
| `npm start`        | Run the compiled app             |
| `npm run generate` | Generate a new module            |

---

## 🧪 Technologies Used

- **Node.js** + **Express.js**
- **TypeScript**
- **Mongoose** (MongoDB)
- **Sequelize** (Mysql)
- **Prettier** for code formatting
- **Dotenv** for managing environment variables
- **Custom module generator**

---

## 🛡️ License

MIT License © atiqghata

---

## 💬 Questions or Feedback?

Feel free to open an issue or submit a pull request!
