import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
    title: String,
    price: Number,
    quantity: { type: Number, default: 0 },
    discount: Number,
    category: String,
    total: Number,
    location:{type:String,default:"Waiting for updates"},
    shipping: { type: Boolean, default: false }, // when true it move the item to Shippment track page
    recu: { type: Boolean, default: false }  ,
    demand: { type: Number, default: 0 }, // popularity which increase by 1 with every buyer

});

export default mongoose.model('Stock', stockSchema);
