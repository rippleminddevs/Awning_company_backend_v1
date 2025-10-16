import { App } from './app'

const bootstrap = async () => {
  try {
    const app = new App()
    app.start()
  } catch (error) {
    console.error('Failed to start application:', error)
    process.exit(1)
  }
}

bootstrap()
