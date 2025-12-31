const mongoose = require('mongoose')

// MongoDB connection string from development.json
const MONGODB_URI =
  'mongodb+srv://admin:YBfFHwu4bw98l4zT@hoffnmazor.u8t7t.mongodb.net/awning_company?retryWrites=true&w=majority'

async function fixCategoryOrder() {
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

    // Get current categories
    const categories = await Category.find({}).sort({ createdAt: 1 }).lean()

    console.log('\n=== CURRENT ORDER (before) ===\n')
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - Created: ${cat.createdAt}`)
    })

    // Define the desired order from photo
    const desiredOrder = [
      'Retractable',
      'Fixed',
      'Drop Shades & Screens',
      'Fabric Recovers',
      'Infinity Canopies',
      'Alumawood Patio Covers',
      'Louvered Pergola',
    ]

    // Base date (start from a past date)
    const baseDate = new Date('2025-01-01T00:00:00.000Z')

    console.log('\n=== UPDATING ORDER ===\n')

    // Update each category's createdAt based on desired order
    for (let i = 0; i < desiredOrder.length; i++) {
      const categoryName = desiredOrder[i]
      const newDate = new Date(baseDate.getTime() + i * 60000) // Add 1 minute per category

      const category = await Category.findOne({ name: categoryName })

      if (category) {
        await Category.findByIdAndUpdate(category._id, {
          createdAt: newDate,
          updatedAt: newDate,
        })
        console.log(`✅ ${i + 1}. ${categoryName} -> ${newDate.toISOString()}`)
      } else {
        console.log(`❌ Category not found: ${categoryName}`)
      }
    }

    // Verify new order
    const updatedCategories = await Category.find({}).sort({ createdAt: 1 }).lean()

    console.log('\n=== NEW ORDER (after) ===\n')
    updatedCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} - Created: ${cat.createdAt}`)
    })

    console.log('\n✅ Order updated successfully!')

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixCategoryOrder()
