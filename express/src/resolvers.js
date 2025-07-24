const Sentry = require('@sentry/node');
const {
  findUserById,
  findClubById,
  findClassById,
  updateUserCheckIn,
  getAllUsers,
  getAllClubs,
  getAllClasses
} = require('./database');

// Helper function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const resolvers = {
  Query: {
    users: () => getAllUsers(),
    clubs: () => getAllClubs(),
    classes: () => getAllClasses(),
    user: (_, { userId }) => findUserById(userId),
    club: (_, { clubId }) => findClubById(clubId),
    class: (_, { classId }) => findClassById(classId),
  },

  Mutation: {
    checkInClub: async (_, { input }, { transaction }) => {
      const span = transaction?.startChild({
        op: 'checkInClub',
        description: 'Club check-in transaction'
      });

      try {
        // Custom span: db.query.user
        const userSpan = span?.startChild({
          op: 'db.query.user',
          description: 'Fetch user data'
        });
        
        const user = findUserById(input.userId);
        userSpan?.finish();

        if (!user) {
          span?.setTag('check_in.outcome', 'failed');
          span?.setTag('check_in.failure_reason', 'user_not_found');
          span?.finish();
          return {
            success: false,
            message: 'User not found'
          };
        }

        span?.setTag('membership.type', user.membershipType);

        // Custom span: logic.verify_subscription
        const subscriptionSpan = span?.startChild({
          op: 'logic.verify_subscription',
          description: 'Verify subscription status'
        });

        if (user.subscriptionStatus !== 'ACTIVE') {
          subscriptionSpan?.finish();
          span?.setTag('check_in.outcome', 'failed');
          span?.setTag('check_in.failure_reason', 'inactive_subscription');
          span?.finish();
          return {
            success: false,
            message: 'Subscription is not active'
          };
        }
        subscriptionSpan?.finish();

        // Check membership type
        if (user.membershipType === 'ALL_ACCESS') {
          // Update user check-in status
          updateUserCheckIn(input.userId, input.clubId);
          span?.setTag('check_in.outcome', 'success');
          span?.finish();
          return {
            success: true,
            message: 'Successfully checked into club'
          };
        } else if (user.membershipType === 'SINGLE_CLUB') {
          // Custom span: db.query.verify_location (with 150ms delay)
          const locationSpan = span?.startChild({
            op: 'db.query.verify_location',
            description: 'Verify home club location with delay'
          });

          // Introduce 150ms delay as specified
          await delay(150);

          if (user.homeClubId !== input.clubId) {
            locationSpan?.finish();
            span?.setTag('check_in.outcome', 'failed');
            span?.setTag('check_in.failure_reason', 'wrong_club');
            span?.finish();
            return {
              success: false,
              message: 'You can only check into your home club'
            };
          }

          locationSpan?.finish();
          
          // Update user check-in status
          updateUserCheckIn(input.userId, input.clubId);
          span?.setTag('check_in.outcome', 'success');
          span?.finish();
          return {
            success: true,
            message: 'Successfully checked into club'
          };
        } else {
          span?.setTag('check_in.outcome', 'failed');
          span?.setTag('check_in.failure_reason', 'invalid_membership');
          span?.finish();
          return {
            success: false,
            message: 'Invalid membership type for club check-in'
          };
        }
      } catch (error) {
        Sentry.captureException(error);
        span?.setTag('check_in.outcome', 'error');
        span?.finish();
        return {
          success: false,
          message: 'Internal server error'
        };
      }
    },

    checkInClass: async (_, { input }, { transaction }) => {
      const span = transaction?.startChild({
        op: 'checkInClass',
        description: 'Class check-in transaction'
      });

      try {
        // Custom span: db.query.user_and_class
        const dataSpan = span?.startChild({
          op: 'db.query.user_and_class',
          description: 'Fetch user and class data'
        });

        const user = findUserById(input.userId);
        const classData = findClassById(input.classId);

        dataSpan?.finish();

        if (!user) {
          span?.setTag('check_in.outcome', 'failed');
          span?.setTag('check_in.failure_reason', 'user_not_found');
          span?.finish();
          return {
            success: false,
            message: 'User not found'
          };
        }

        if (!classData) {
          span?.setTag('check_in.outcome', 'failed');
          span?.setTag('check_in.failure_reason', 'class_not_found');
          span?.finish();
          return {
            success: false,
            message: 'Class not found'
          };
        }

        span?.setTag('membership.type', user.membershipType);

        // Custom span: logic.verify_subscription
        const subscriptionSpan = span?.startChild({
          op: 'logic.verify_subscription',
          description: 'Verify subscription status'
        });

        if (user.subscriptionStatus !== 'ACTIVE') {
          subscriptionSpan?.finish();
          span?.setTag('check_in.outcome', 'failed');
          span?.setTag('check_in.failure_reason', 'inactive_subscription');
          span?.finish();
          return {
            success: false,
            message: 'Subscription is not active'
          };
        }
        subscriptionSpan?.finish();

        // Custom span: logic.verify_access_path
        const accessSpan = span?.startChild({
          op: 'logic.verify_access_path',
          description: 'Verify class access path'
        });

        let hasAccess = false;
        let accessPath = '';

        // Path 1: Club Access - Check if user is checked into the same club
        if (user.checkedInClubId === classData.clubId) {
          hasAccess = true;
          accessPath = 'club_access';
        } else {
          // Path 2: Membership Access - Check membership type
          if (user.membershipType === 'CLASS_ACCESS' || user.membershipType === 'ALL_ACCESS') {
            hasAccess = true;
            accessPath = 'membership_access';
          }
        }

        accessSpan?.finish();
        span?.setTag('check_in.access_path', accessPath);

        if (!hasAccess) {
          span?.setTag('check_in.outcome', 'failed');
          span?.setTag('check_in.failure_reason', 'no_access');
          span?.finish();
          return {
            success: false,
            message: 'You do not have access to this class'
          };
        }

        span?.setTag('check_in.outcome', 'success');
        span?.finish();
        return {
          success: true,
          message: 'Successfully checked into class'
        };
      } catch (error) {
        Sentry.captureException(error);
        span?.setTag('check_in.outcome', 'error');
        span?.finish();
        return {
          success: false,
          message: 'Internal server error'
        };
      }
    }
  }
};

module.exports = { resolvers }; 