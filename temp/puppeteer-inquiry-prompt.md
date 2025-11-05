# Puppeteer/PDF Generation Setup Inquiry

Please provide a comprehensive markdown document with the following information about your working Puppeteer setup for PDF generation:

## 1. Project Configuration
- **Node.js Version**: What version are you using locally and in production?
- **Puppeteer Version**: Exact version from package.json
- **@puppeteer/browsers Version**: If using it

## 2. File Setups
Please share the exact contents of:
- **package.json** (scripts and dependencies sections only)
- **render.yaml** (or your deployment config file)
- **.puppeteerrc.js** (complete file)
- **Dockerfile** (if using Docker)
- Any environment variables used for Puppeteer

## 3. PDF Generation Flow
- How do you initialize Puppeteer in your code?
- What's the full workflow from request to PDF generation?
- Any specific options you pass to `puppeteer.launch()`?
- How do you handle browser instances (launch, page, close)?

## 4. Deployment Scenarios

### Local Development
- How do you run it locally?
- Do you install Chrome manually or let Puppeteer handle it?
- What command do you use to start the server?

### Live/Production (Render/VPS/etc.)
- Build process (exact commands)
- How does Chrome get installed?
- Cache directory configuration
- Environment variables set in production
- Any permissions or user setup required?

## 5. Troubleshooting You've Done
- What errors did you encounter initially?
- What fixed them?
- Any special configurations or workarounds?

## 6. Working Example
Can you share:
- A minimal code snippet showing how you launch Puppeteer and generate a PDF
- Directory structure showing where Chrome gets installed
- Log output from a successful deployment

## 7. Current Status
- Is this currently working in production?
- Any known issues or edge cases?

Please organize this as a markdown file with clear sections and code examples. Include exact file paths and commands.

The goal is to replicate your exact working setup in another project that has the same Puppeteer/PDF generation requirements.
