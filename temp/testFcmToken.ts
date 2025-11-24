import { DatabaseService } from '../src/services/databaseService'
import { UserService } from '../src/modules/user/userService'
import { UserModel } from '../src/modules/user/userModel'
import mongoose from 'mongoose'

const run = async () => {
    try {
        // Connect to DB
        await DatabaseService.getInstance()
        console.log('Connected to DB')

        const userService = new UserService()
        const userModel = UserModel.getInstance().getMongooseModel()

        // Create a dummy user
        const dummyUser = await userModel.create({
            name: 'Test User',
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            role: 'salesperson',
            isVerified: true
        })
        console.log('Created dummy user:', dummyUser._id)

        const userId = dummyUser._id.toString()
        const token1 = 'token_123'
        const token2 = 'token_456'

        // 1. Add Token 1
        console.log('Adding Token 1...')
        await userService.updateFCMTokens({ userId, addfcmToken: token1 })
        let user = await userModel.findById(userId)
        console.log('Tokens after adding 1:', user?.deviceTokens)
        if (!user?.deviceTokens?.includes(token1)) throw new Error('Token 1 not added')

        // 2. Add Token 2
        console.log('Adding Token 2...')
        await userService.updateFCMTokens({ userId, addfcmToken: token2 })
        user = await userModel.findById(userId)
        console.log('Tokens after adding 2:', user?.deviceTokens)
        if (!user?.deviceTokens?.includes(token2)) throw new Error('Token 2 not added')

        // 3. Add Token 1 again (should not duplicate)
        console.log('Adding Token 1 again...')
        await userService.updateFCMTokens({ userId, addfcmToken: token1 })
        user = await userModel.findById(userId)
        console.log('Tokens after adding 1 again:', user?.deviceTokens)
        if (user?.deviceTokens?.filter(t => t === token1).length !== 1) throw new Error('Token 1 duplicated')

        // 4. Remove Token 1
        console.log('Removing Token 1...')
        await userService.updateFCMTokens({ userId, removefcmToken: token1 })
        user = await userModel.findById(userId)
        console.log('Tokens after removing 1:', user?.deviceTokens)
        if (user?.deviceTokens?.includes(token1)) throw new Error('Token 1 not removed')

        // Cleanup
        await userModel.findByIdAndDelete(userId)
        console.log('Cleanup done')

    } catch (error) {
        console.error('Test failed:', error)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

run()
