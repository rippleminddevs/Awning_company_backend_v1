import { Router } from 'express'
import path from 'path';

class WebRoutes {
    public router: Router

    constructor() {
        this.router = Router()
        this.configureRoutes()
    }

    private configureRoutes(): void {
        this.router.get('/.well-known/assetlinks.json', (req: any, res: any) => {
            res.sendFile(path.join(__dirname, '../.well-known/assetlinks.json'));
        });
        this.router.get('/.well-known/apple-app-site-association', (req, res) => {
            // res.setHeader('Content-Type', 'application/json');
            res.sendFile(path.join(__dirname, '../.well-known/apple-app-site-association'));
        });
    }
}

export default new WebRoutes().router
