# TypeScript File Runner 📚

Simple interactive tool to run TypeScript files in DSA, HLD, and LLD folders with auto-reload.

## Installation

```bash
npm install
```

## Usage

**One command to do everything:**

```bash
npm start
```

This will:
1. **📋 List all TypeScript files** with details
2. **🎯 Select by number** (1, 2, 3, etc.)
3. **🔄 Run in watch mode** with auto-reload
4. **⚡ Save changes** and see results instantly

### Example:
```
📚 TypeScript Files in Your Project

 1. DSA/Problem_1/solution-practise
    📁 DSA/Problem_1/solution-practise.ts
    📊 0 B • Modified: 10/4/2025

 2. DSA/Problem_1/solution
    📁 DSA/Problem_1/solution.ts
    📊 4.5 KB • Modified: 10/3/2025

Enter file number (1-2) or 'q' to quit: 2

🚀 Running in watch mode:
📄 DSA/Problem_1/solution.ts
🔄 File will auto-reload when changed.
```

## File Structure

Automatically discovers TypeScript files in this structure:

```
DSA/
├── Problem_1/
│   ├── Question.md
│   ├── solution.ts
│   ├── solution-practise.ts
│   └── solution.md
HLD/
├── Problem_1/
│   ├── Question.md
│   ├── solution.ts
│   └── solution.md
LLD/
├── Problem_1/
│   ├── Question.md
│   ├── solution.ts
│   └── solution.md
```

## Features

✅ **Single command** - `npm start` does everything  
✅ **Interactive selection** - Pick files by number  
✅ **Watch mode** - Auto-reload on file changes  
✅ **File metadata** - Shows size and modification date  
✅ **Dynamic discovery** - Finds all `.ts` files automatically  

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Interactive file selector + watch mode |
| `npm run` | Same as npm start |

That's it! Simple and focused. 🚀