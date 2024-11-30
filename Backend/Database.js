import mongoose from 'mongoose';
const URL="<URL>" // Paste your mongoDB connection url here
mongoose.connect(URL)
.then(() => console.log('Connected to Database'))
.catch((err) => console.log('Failed to connect to Database:', err));


 export default mongoose.connect;