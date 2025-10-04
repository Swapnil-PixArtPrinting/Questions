#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

class SimpleInteractiveRunner {
  constructor() {
    this.files = [];
  }

  // Find all TypeScript files in the project
  findAllTsFiles() {
    const folders = ['DSA', 'HLD', 'LLD'];
    const files = [];

    folders.forEach(folder => {
      const folderPath = path.join(__dirname, folder);
      if (fs.existsSync(folderPath)) {
        const problems = fs.readdirSync(folderPath).filter(item => 
          fs.statSync(path.join(folderPath, item)).isDirectory()
        );

        problems.forEach(problem => {
          const problemPath = path.join(folderPath, problem);
          const tsFiles = fs.readdirSync(problemPath).filter(file => file.endsWith('.ts'));
          
          tsFiles.forEach(file => {
            const relativePath = path.join(folder, problem, file);
            const fullPath = path.join(problemPath, file);
            const stats = fs.statSync(fullPath);
            
            files.push({
              name: file,
              folder: folder,
              problem: problem,
              relativePath: relativePath,
              fullPath: fullPath,
              size: this.formatFileSize(stats.size),
              modified: stats.mtime.toLocaleDateString(),
              displayName: `${folder}/${problem}/${file.replace('.ts', '')}`
            });
          });
        });
      }
    });

    return files.sort((a, b) => {
      if (a.folder !== b.folder) return a.folder.localeCompare(b.folder);
      if (a.problem !== b.problem) return a.problem.localeCompare(b.problem);
      return a.name.localeCompare(b.name);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async showFilesAndSelect() {
    console.clear();
    console.log('📚 TypeScript Files in Your Project\n');

    if (this.files.length === 0) {
      console.log('❌ No TypeScript files found in DSA, HLD, or LLD folders.');
      console.log('\nExample structure:');
      console.log('  DSA/Problem_1/solution.ts');
      console.log('  HLD/Problem_1/solution.ts');
      console.log('  LLD/Problem_1/solution.ts\n');
      console.log('💡 Create new problems with: npm run create DSA/Problem_1');
      return;
    }

    // Display files with numbers
    this.files.forEach((file, index) => {
      const number = String(index + 1).padStart(2, ' ');
      console.log(`${number}. ${file.displayName}`);
      console.log(`    📁 ${file.relativePath}`);
      console.log(`    📊 ${file.size} • Modified: ${file.modified}\n`);
    });

    console.log(`Found ${this.files.length} TypeScript files\n`);

    // Create readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      const askForSelection = () => {
        rl.question(`Enter file number (1-${this.files.length}) or 'q' to quit: `, (answer) => {
          if (answer.toLowerCase() === 'q') {
            rl.close();
            console.log('👋 Goodbye!');
            process.exit(0);
          }

          const fileIndex = parseInt(answer) - 1;
          if (isNaN(fileIndex) || fileIndex < 0 || fileIndex >= this.files.length) {
            console.log(`❌ Invalid selection. Please enter a number between 1 and ${this.files.length}.`);
            askForSelection();
            return;
          }

          rl.close();
          resolve(this.files[fileIndex]);
        });
      };

      askForSelection();
    });
  }

  async runInWatchMode(selectedFile) {
    console.clear();
    console.log('🚀 Running in watch mode:');
    console.log(`📄 ${selectedFile.relativePath}\n`);
    console.log('🔄 File will auto-reload when changed.');
    console.log('⚠️  Press Ctrl+C to stop watch mode.\n');
    console.log('='.repeat(60));

    // Run the file in watch mode using tsx
    const child = spawn('npx', ['tsx', '--watch', selectedFile.fullPath], {
      stdio: 'inherit',
      cwd: __dirname
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Stopping watch mode...');
      child.kill('SIGTERM');
      setTimeout(() => {
        console.log('👋 Goodbye!');
        process.exit(0);
      }, 500);
    });

    child.on('close', (code) => {
      console.log(`\n⚠️  Watch mode ended (exit code: ${code})`);
      process.exit(code);
    });

    child.on('error', (err) => {
      console.error('❌ Error running file:', err.message);
      if (err.code === 'ENOENT') {
        console.error('💡 tsx not found. Please run "npm install" first.');
      }
      process.exit(1);
    });
  }

  async start() {
    try {
      console.log('🔍 Scanning for TypeScript files...\n');
      this.files = this.findAllTsFiles();
      
      const selectedFile = await this.showFilesAndSelect();
      if (selectedFile) {
        await this.runInWatchMode(selectedFile);
      }
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  }
}

// Start the interactive runner
const runner = new SimpleInteractiveRunner();
runner.start();