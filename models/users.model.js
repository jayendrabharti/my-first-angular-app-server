import mongoose from 'mongoose';
var Schema = mongoose.Schema;
var UsersSchema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        refreshToken: { type: String },
    },
    {
        timestamps: true,
    }
);

const Users = mongoose.model("Users", UsersSchema);
export default Users;