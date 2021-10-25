import { Users, Attendances } from "../db/dbConnector.js";

export const mutationResolvers = {
  createUser: (root, { input }) => {
    const newUser = new Users({
      name: input.name,
      authID: input.authID,
      attendanceCount: input.attendanceCount,
      phone: input.phone,
      address: input.address,
      salary: input.salary,
      isAdmin: input.isAdmin,
    });

    return new Promise((resolve, reject) => {
      newUser.save((err) => {
        if (err) reject(err);
        else resolve(newUser);
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
};
