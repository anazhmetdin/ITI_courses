const mongoose = require("mongoose");
const idValidator = require('mongoose-id-validator');

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/DoctorsPatients");

//2)Create Schema
doctorsSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'users',
        unique: true,
        required: true
    },
    patients: {
        type: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'patients'
        }],
        required: true
    },
    specialization: {type: String, enum: ['GENERAL','SURGEON','GYNECOLOGIST'], required: true}
})

doctorsSchema.plugin(idValidator);

//3)Connect Schema With Collection
module.exports = mongoose.model("doctors",doctorsSchema);