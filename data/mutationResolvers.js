import { Users, Attendances, Advances } from "../db/dbConnector.js";

export const mutationResolvers = {
  createUser: (root, { input }) => {
    const newUser = new Users(input);

    return new Promise((resolve, reject) => {
      newUser.save((err) => {
        if (err) reject(err);
        else resolve(newUser);
      });
    });
  },

  updateUser: (root, { input, id }) => {
    return new Promise((resolve, reject) => {
      Users.findByIdAndUpdate(
        id,
        { ...input },
        {
          runValidators: true,
          new: true,
        },
        (err, user) => {
          if (err) reject(err);
          else resolve(user);
        }
      );
    });
  },

  deleteUser: async (root, { id }) => {
    await Advances.findOneAndDelete({ userID: id });

    return new Promise((resolve, reject) => {
      Users.findByIdAndDelete(id, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  },

  addAttendance: async (root, { input }) => {
    const newAttendance = new Attendances({
      date: input.date,
      timeIn: input.timeIn,
      timeOut: input.timeOut,
    });

    const user = await Users.findById(input.userID);
    user.attendanceCount.push(newAttendance);

    return new Promise((resolve, reject) => {
      user.save((err) => {
        if (err) reject(err);
        resolve(newAttendance);
      });
    });
  },

  createAdvance: (root, { input }) => {
    const newAdvance = new Advances({
      amount: input.amount,
      userID: input.userID,
      userName: input.userName,
    });

    return new Promise((resolve, reject) => {
      newAdvance.save((err) => {
        if (err) reject(err);
        else resolve(newAdvance);
      });
    });
  },
};
