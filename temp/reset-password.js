const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const connectionString = 'mongodb+srv://admin:YBfFHwu4bw98l4zT@hoffnmazor.u8t7t.mongodb.net/awning_company?retryWrites=true&w=majority';

async function resetPassword() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    const email = 'superadmin1@yopmail.com';
    const newPassword = 'admin321';

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`Generated hash: ${hashedPassword.substring(0, 25)}...`);

    // Use findOneAndUpdate to bypass save hooks
    const result = await User.findOneAndUpdate(
      { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      {
        password: hashedPassword,
        role: 'superadmin',
        isAdmin: true,
        isVerified: true
      },
      { upsert: true, new: true, rawResult: true }
    );

    console.log(`User ${result.value.email} updated/created`);

    // Verify immediately
    const testUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    console.log(`DB hash: ${testUser.password.substring(0, 25)}...`);
    console.log(`Hashes match: ${testUser.password === hashedPassword}`);

    const isValid = await bcrypt.compare(newPassword, testUser.password);
    console.log(`Password verification: ${isValid ? '✅ PASS' : '❌ FAIL'}`);

    if (isValid) {
      console.log(`\n✅✅✅ CREDENTIALS: ${email} / ${newPassword}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

resetPassword();
