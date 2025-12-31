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

        // Handle nested paymentDetails form fields (e.g., paymentDetails[checkNumber])
        if (!req.body.paymentDetails) {
            const paymentDetails: any = {}
            let hasPaymentDetails = false

            Object.keys(req.body).forEach(key => {
                if (key.startsWith('paymentDetails[')) {
                    const fieldName = key.match(/paymentDetails\[(.*?)\]/)?.[1]
                    if (fieldName) {
                        paymentDetails[fieldName] = req.body[key]
                        hasPaymentDetails = true
                        // delete req.body[key] // Optional: Clean up flat keys if needed
                    }
                }
            })

            if (hasPaymentDetails) {
                req.body.paymentDetails = paymentDetails
            }
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
