const httpStatus = require('http-status');
const { User, Friend, Contact } = require('../models');
const ApiError = require('../utils/ApiError');
const { acceptConfig } = require('../config/friend');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};
/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

const getAnnouncementById = async (id) => {
  return Contact.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const updateAnnouncementById = async (userId, updateBody) => {
  const announcement = await getAnnouncementById(userId);
  if (!announcement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  // }
  Object.assign(announcement, updateBody);
  await announcement.save();
  return announcement;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const deleteAnnouncement = async (announcementId) => {
  const announcement = await getAnnouncementById(announcementId);
  if (!announcement) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Announcement not found');
  }
  await announcement.remove();
  return announcement;
};

const requestFriend = async (senderId, receiverId) => {
  const receiver = await getUserById(receiverId);
  if (!receiver) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const sentfriendshipDoc = await Friend.findOne({ sender: senderId, receiver: receiverId });
  const incomingfriendshipDoc = await Friend.findOne({ receiver: senderId, sender: receiverId });
  if (sentfriendshipDoc) {
    if (sentfriendshipDoc.accepted === acceptConfig.ACCEPTED) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are friends each other');
    } else throw new ApiError(httpStatus.FORBIDDEN, 'You already sent friendship request');
  }
  if (incomingfriendshipDoc) {
    if (incomingfriendshipDoc.accepted === acceptConfig.ACCEPTED) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You are friends each other');
    } else throw new ApiError(httpStatus.FORBIDDEN, 'You received friendship request');
  }
  return await Friend.create({
    sender: senderId,
    receiver: receiverId,
  });
};

const getFriends = async (userId) => {
  return await Friend.find({ $or: [{ sender: userId }, { receiver: userId }], accepted: acceptConfig.ACCEPTED })
    .populate('sender', 'name email')
    .populate('receiver', 'name email');
};

const incomingFriendRequests = async (userId) => {
  return await Friend.find({ receiver: userId, accepted: acceptConfig.NONE })
    .populate('sender', 'name email')
    .populate('receiver', 'name email');
};

const sentFriendRequests = async (userId) => {
  return await Friend.find({ sender: userId, accepted: acceptConfig.NONE })
    .populate('sender', 'name email')
    .populate('receiver', 'name email');
};

const acceptFriendRequest = async (userId, sender) => {
  const incomingFriendRequest = await Friend.findOne({ sender, receiver: userId });
  if (!incomingFriendRequest) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only accept incoming friend requests');
  }
  if (incomingFriendRequest.accepted == true) {
    throw new ApiError(httpStatus.FORBIDDEN, 'He is already your friend');
  }
  incomingFriendRequest.accepted = true;
  await incomingFriendRequest.save();
};

const postReport = async (userId, report) => {
  return await Contact.create({
    reporter: userId,
    ...report,
  });
};

const getReports = async (filter, options) => {
  const contactDocs = await Contact.paginate(filter, options);
  return contactDocs;
};

const setFocus = async (userId, focus) => {
  try {
    const userDoc = await getUserById(userId);
    userDoc.focus = focus;
    await userDoc.save();
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You can't change the focus property");
  }
};

const loginGameRoom = async (userId) => {
  const userDoc = await getUserById(userId);
  userDoc.inGameRoom = true;
  await userDoc.save();
};

const logoutGameRoom = async (userId) => {
  const userDoc = await getUserById(userId);
  userDoc.inGameRoom = false;
  await userDoc.save();
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  requestFriend,
  getFriends,
  incomingFriendRequests,
  sentFriendRequests,
  postReport,
  deleteAnnouncement,
  updateAnnouncementById,
  getReports,
  acceptFriendRequest,
  setFocus,
  loginGameRoom,
  logoutGameRoom,
};
