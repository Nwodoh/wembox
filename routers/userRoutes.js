const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

router.route('/data-exists').get(authController.dataExists);
router.route('/captcha').post(authController.captcha);
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/forgot_password').post(authController.forgotPassword);
router.route('/reset_password/:token').post(authController.resetPassword);

router.use(authController.protect);
router.route('/logout').get(authController.logout); // the logout route is protected
router.route('/follow').post(usersController.follow);
router.route('/my_followers').get(usersController.getUserFollowers);
router.route('/my_followings').get(usersController.getUserFollowings);
router.route('/user_followers/:user_id?').get(usersController.getUserFollowers);
router
  .route('/user_followings/:user_id?')
  .get(usersController.getUserFollowings);
router.route('/unfollow').delete(usersController.unfollow);

// // Protect all routes AFTER this middleware
// router.use(authController.protect);

// // USERS ROUTE
// router.route('/me').get(usersController.getMe, usersController.getOneUser);

// router
//   .route('/update-me')
//   .patch(
//     usersController.uploadUserPhoto,
//     usersController.resizeUserPhoto,
//     usersController.updateMe
//   );

// router.route('/delete-me').delete(usersController.deleteMe);

// router.route('/update-password').patch(authController.updatePassWord);

// // Restrict to admin all routes AFTER this middleware
// router.use(authController.restrictTo('admin'));

// router
//   .route('/')
//   .get(usersController.getAllUsers)
//   .post(usersController.createNewUser);

// router
//   .route('/:id')
//   .get(usersController.getOneUser)
//   .patch(usersController.updateUser)
//   .delete(usersController.deleteUser);

module.exports = router;
