import { Request, Response, NextFunction } from 'express'

export const parseQuoteBody = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.paymentStructure && typeof req.body.paymentStructure === 'string') {
            req.body.paymentStructure = JSON.parse(req.body.paymentStructure)
        }
        if (req.body.paymentDetails && typeof req.body.paymentDetails === 'string') {
            req.body.paymentDetails = JSON.parse(req.body.paymentDetails)
        }
        if (req.body.items && typeof req.body.items === 'string') {
            req.body.items = JSON.parse(req.body.items)
        }
        next()
    } catch (error) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            error: {
                code: 'BAD_REQUEST',
                message: 'Invalid JSON in request body',
            },
        })
    }
}
