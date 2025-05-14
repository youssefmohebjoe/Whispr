import mongoose from 'mongoose'

const connectDB = async () => {
    return await mongoose.connect(process.env.DB_URI).then(res => {
        console.log('MongoDB Connected...')
    }).catch(err => console.error(
        'Error connecting to MongoDB:', err
    ))
}
export default connectDB