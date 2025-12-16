import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudnary.js';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateRefreshToken()
        const refreshToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token.")
    }
}

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

    const existedUser = await User.findOne({
        $or: [{ email }, { userName }]
    })


    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImages?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Error while uploading avatar image");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        userName: userName.toLowerCase(),
        email,
        password
    })
    // console.log(req.body);
    //     [Object: null prototype] {
    //   fullName: 'jinit patel',
    //   userName: 'jdpatel123',
    //   password: 'jinit123',
    //   email: 'foruse628@gmail.com'
    // }


    const createdUser = await User.findById(user._id)
        .select(" -password -refreshTokens ");

    if (!createdUser) {
        throw new ApiError(500, "Unable to create user");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));

})

const loginUser = asyncHandler(async (req, res) => {
    // get email, password, username from req.body
    // validate - not empty
    // find the user with email or username
    //password check
    // accessToken and refreshToken generate
    //send cookies

    const { email, password, userName } = req.body;

    if (!userName || !email) {
        throw new ApiError(400, "username or email is required.")
    }

    const user = await User.findOne({ $or: [{ email }, { userName }] })
    if (!user) {
        throw new ApiError(400, "User does not existed.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "password is incorrect.")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken },"user logged in successfully."))

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined
        }
    },{
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {},"User logged Out."))
})

export {
    registerUser,
    loginUser,
    logoutUser
};