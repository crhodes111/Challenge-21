const { AuthenticationError } = require("apollo-server-errors");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
          
              return userData;
            }
          
            throw new AuthenticationError('Not logged in');
          }
    },
    Mutation: {
      // addUser takes in JWT tokent and user model still fuzzy on this.
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
          
            return { token, user };
          },
          //login requires email password checks if email and password are correct.
          login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
          
            if (!user) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const correctPw = await user.isCorrectPassword(password);
          
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
          
            const token = signToken(user);
            return { token, user };
          },
          //Save book passes in the ID and book details, finds the user and pushes the book into the user saved books array.
          saveBook: async (parents, {_id, book}) => {
            const updatedUser = User.findByIdAndUpdate(_id,
                {
                    $push: {
                        savedBooks: book
                    }
                })
                return updatedUser
        },
        //Remove book does the same as save book but uses pull instead of push to remove from the array.
        removeBook: async (parent, { _id, bookId }) => {
            const updatedUser = await User.findByIdAndUpdate(
                _id,
                { $pull: { savedBooks: { _id: bookId } } }
            )
            return updatedUser
        }
    
  }
};
  
  module.exports = resolvers;