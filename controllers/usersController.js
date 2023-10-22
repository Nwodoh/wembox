const Follow = require('../models/follow/followModel');
const User = require('../models/user/userModel');
const factory = require('./handlerFactory');
const AppError = require('../utilities/AppError');
const catchAsync = require('../utilities/catchAsync');
const helper = require('../utilities/helpers');
const interestConfig = require('../config/interestConfig');

const populateFollowItems = [
  'name frontEndUsername profileImg accountType numberOfFollowers numberOfFollowing',
];

exports.getAllUsers = factory.findAll(User);

exports.follow = catchAsync(async (req, res, next) => {
  // 1. create a new follow document with the appropriate parameters
  const follower = req.user.id;
  const { following } = req.body;
  console.log(follower, following);
  if (!follower || !following) {
    return next(
      new AppError(
        'No user to follow was specified. Please specify a user and try again.',
        400
      )
    );
  }
  if (follower === following) {
    return next(
      new AppError(
        'Uh oh, you tried to follow your same account. Follow another user and try again.',
        400
      )
    );
  }

  const createFollow = await Follow.create({ follower, following });

  // 2. add an increment to the appropriate fields of both the follower and the following
  await User.findByIdAndUpdate(
    { _id: follower },
    { $inc: { numberOfFollowing: 1 } }
  );
  await User.findByIdAndUpdate(
    { _id: following },
    { $inc: { numberOfFollowers: 1 } }
  );

  res.status(200).json({ status: 'success', follow: createFollow });
});

exports.getFollowers = catchAsync(async (req, res, next) => {
  const findBy = { following: req.params.user_id || req.user.id };
  const populateBy = ['follower'];
  factory.findAll(Follow, {
    findBy,
    populateOptions: populateBy,
    populateData: populateFollowItems,
  })(req, res, next);
});

exports.getFollowings = catchAsync(async (req, res, next) => {
  const findBy = { follower: req.params.user_id || req.user.id };
  const populateBy = ['following'];
  factory.findAll(Follow, {
    findBy,
    populateOptions: populateBy,
    populateData: populateFollowItems,
  })(req, res, next);
});

exports.getAllFollows = factory.findAll(Follow, {
  populateOptions: ['following', 'follower'],
  populateData: [...populateFollowItems, ...populateFollowItems],
});

exports.unfollow = catchAsync(async (req, res, next) => {
  const { following } = req.body;
  const follower = req.user.id;

  if (follower === following)
    return next(new AppError('You are unable to unfollow your account.'));
  const deletedFollow = await Follow.findOneAndDelete({ follower, following });
  if (!deletedFollow)
    return next(new AppError('You do not yet follow this account.', 404));

  await User.findByIdAndUpdate(
    { _id: follower },
    { $inc: { numberOfFollowing: -1 } }
  );
  await User.findByIdAndUpdate(
    { _id: following },
    { $inc: { numberOfFollowers: -1 } }
  );
  res.status(200).json({
    status: 'success',
  });
});

// //
// // CREATE VOLUNTEERS
// setTimeout(async () => {
//   const countries = interestConfig.exampleCountries;
//   const contentType = () => {
//     const types = [
//       {
//         topic: 'comic artists',
//         interest: 'animation and comics',
//         engagements: Math.floor(Math.random() * 10),
//       },
//       {
//         topic: 'camping',
//         interest: 'outdoors',
//         engagements: Math.floor(Math.random() * 10),
//       },
//       {
//         topic: 'astronomy',
//         interest: 'science',
//         engagements: Math.floor(Math.random() * 10),
//       },
//       {
//         topic: 'movies',
//         interest: 'entertainment',
//         engagements: Math.floor(Math.random() * 10),
//       },
//       {
//         topic: 'software',
//         interest: 'technology',
//         engagements: Math.floor(Math.random() * 10),
//       },
//     ];
//     const selected = [];
//     types.forEach((content) =>
//       Math.round(Math.random()) ? selected.push(content) : ''
//     );
//     return selected;
//   };
//   const dummy = {
//     number: 10,
//     name: 'volunteer',
//     frontEndUsername: 'VolunteeR',
//     dateOfBirth: '2003-07-06',
//     password: '#1234567eR',
//     dummyEmailExtension: '@wm.com',
//   };

//   for (let i = 0; i < dummy.number; i++) {
//     const currentDummy = `${dummy.frontEndUsername}${i + 1}`;
//     const created = await User.create({
//       name: dummy.name,
//       frontEndUsername: currentDummy,
//       username: currentDummy,
//       email: currentDummy + dummy.dummyEmailExtension,
//       password: dummy.password,
//       passwordConfirm: dummy.password,
//       dateOfBirth: dummy.dateOfBirth,
//       contentType: contentType(),
//       IPGeoLocation:
//         countries[Math.round(Math.random() * (countries.length - 1))],
//     });
//   }
//   console.log(`CREATED ${dummy.number} Volunteers`);
// }, 10000);

// // CREATE FOLLOWS
// setTimeout(async () => {
//   const allUsers = await User.find();
//   const promises = allUsers.map(async (user, i) => {
//     const randNum = Math.floor(Math.random() * allUsers.length);
//     let following = allUsers[randNum]._id;
//     const follower = user._id;
//     following =
//       following !== follower
//         ? following
//         : allUsers[randNum + 1]?._id || allUsers[randNum - 1]?._id;
//     const createFollow = await Follow.create({ follower, following });
//     await User.findByIdAndUpdate(
//       { _id: follower },
//       { $inc: { numberOfFollowing: 1 } }
//     );
//     await User.findByIdAndUpdate(
//       { _id: following },
//       { $inc: { numberOfFollowers: 1 } }
//     );
//   });
//   await Promise.all(promises);
//   console.log(`FOLLOWED ${allUsers.length} Volunteers`);
// }, 20000);

// // DELETE ALL FOLLOWS
// setTimeout(async () => {
//   const deleted = await Follow.deleteMany();
//   console.log(`Deleted: ${deleted.deletedCount} Follows`);
// }, 10000);

// // DELETE ALL USERS
// setTimeout(async () => {
//   const deleted = await User.deleteMany();
//   console.log(`Deleted: ${deleted.deletedCount} Volunteers`);
// }, 10000);
