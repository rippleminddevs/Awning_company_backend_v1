const mongoose = require('mongoose')

// MongoDB connection string from development.json
const MONGODB_URI =
  'mongodb+srv://admin:YBfFHwu4bw98l4zT@hoffnmazor.u8t7t.mongodb.net/awning_company?retryWrites=true&w=majority'

async function listBaseProducts() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    const Product = mongoose.model(
      'Product',
      new mongoose.Schema(
        {},
        {
          strict: false,
          strictPopulate: false,
          collection: 'products',
        }
      )
    )

    // Only get products where parentProduct is null or doesn't exist
    const products = await Product.find({
      $or: [{ parentProduct: null }, { parentProduct: { $exists: false } }],
    })
      .populate('type', 'name')
      .populate('createdBy', 'name email')
      .sort({ name: 1 })
      .lean()

    console.log('\n=== BASE PRODUCTS (No Parent) ===\n')
    console.log(`Total Base Products: ${products.length}\n`)

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   ID: ${product._id}`)
      console.log(`   Type: ${product.type?.name || 'N/A'}`)
      console.log(`   Installation: ${product.installation}`)
      console.log(`   Hood: ${product.hood}`)
      console.log(
        `   Width: ${product.width_ft?.min}'${product.width_in?.min}" - ${product.width_ft?.max}'${product.width_in?.max}"`
      )
      console.log(`   Height: ${product.height_ft?.min}' - ${product.height_ft?.max}'`)
      console.log(`   Colors: ${product.colors?.join(', ') || 'N/A'}`)
      console.log(`   Price Base: $${product.pricing?.basePrice || 'N/A'}`)
      console.log(`   Has Image: ${product.image ? 'Yes' : 'No'}`)
      console.log('')
    })

    await mongoose.disconnect()
    console.log('✅ Disconnected from MongoDB')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

listBaseProducts()
