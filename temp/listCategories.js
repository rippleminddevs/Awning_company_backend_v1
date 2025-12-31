const mongoose = require('mongoose')

// MongoDB connection string from development.json
const MONGODB_URI =
  'mongodb+srv://admin:YBfFHwu4bw98l4zT@hoffnmazor.u8t7t.mongodb.net/awning_company?retryWrites=true&w=majority'

async function listCategories() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Category = mongoose.model(
      'Category',
      new mongoose.Schema(
        {},
        {
          strict: false,
          strictPopulate: false,
          collection: 'categories',
        }
      )
    )

    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean()

    console.log('\n=== ALL CATEGORIES ===\n')
    console.log(`Total Categories: ${categories.length}\n`)

    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`)
      console.log(`   ID: ${category._id}`)
      console.log(`   Slug: ${category.slug || 'N/A'}`)
      console.log(`   Description: ${category.description || 'N/A'}`)
      console.log(`   Active: ${category.isActive !== false ? 'Yes' : 'No'}`)
      console.log(`   Order: ${category.order || 'N/A'}`)
      console.log('')
    })

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

listCategories()
