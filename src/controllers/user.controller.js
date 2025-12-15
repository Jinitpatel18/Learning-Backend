import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudnary.js';

const registerUser = asyncHandler(async (req, res) => {
    // get user data from frontend
    // validation of data - not empty
    // check if user already exists:username,email
    // files - avatar,coverImages
    // upload files to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refreshToken from response
    // check for user creation
    // return response

    const { fullName, userName, email, password } = req.body;

    if ([fullName, userName, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = User.findOne({
        $or: [{ email }, { userName }]
    })


    if(existedUser){
        throw new ApiError(409,"User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImages[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500,"Error while uploading avatar image");
    }

    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        userName: userName.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id)
    .select(" -password -refreshTokens ");

    if(!createdUser){
        throw new ApiError(500,"Unable to create user");
    }

    return res.status(201).json(new ApiResponse(200, "User registered Successfully"))

})

export { registerUser };