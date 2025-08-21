import { Resend } from "resend";
import dotenv from "dotenv";
import dotEnvConfig from "~/config/dot-env";
import type { IUser } from "~/types/users";
import type { TaskDocument } from "~/types/task";
import { generateAccessToken, generateRefreshToken } from "~/utils/jwt";
import User from "~/models/user";
import Task from "~/models/task";
import DailyReminderEmail from "~/utils/email/templates/DailyReminderEmail";

dotenv.config(dotEnvConfig);

const getUserInfo = async (user: IUser) => {
  return {
    _id: user._id,
    email: user.email,
    profile: user.profile,
    dailyEmailReminder: user.dailyEmailReminder,
  };
};

// Use for Signin/Signup with Google 0Auth2
const findOrCreateUser = async (userData: Partial<IUser>) => {
  try {
    const user = await User.findOne({ email: userData.email });
    let userInfo: any = {};
    let accessToken: string;
    let refreshToken: string;

    if (!user) {
      const user = new User({
        email: userData.email,
        password: null,
        googleId: userData.googleId,
        profile: userData.profile || {},
        isVerified: true,
      });

      await user.save();
      userInfo = await getUserInfo(user);

      accessToken = generateAccessToken({
        _id: userInfo._id,
        email: userInfo.email,
      });
      refreshToken = generateRefreshToken(userInfo);

      user.set({ refreshToken });
      await user.save();
    } else {
      userInfo = await getUserInfo(user);

      accessToken = generateAccessToken({
        _id: userInfo._id,
        email: userInfo.email,
      });
      refreshToken = generateRefreshToken(userInfo);

      user.set({ refreshToken, googleId: userData.googleId });
      await user.save();
    }

    return {
      user: userInfo,
      refreshToken,
      token: accessToken,
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};

const sendDailyEmailToUsers = async () => {
  const today = new Date();
  const users = await User.find({ dailyEmailReminder: true }).select(
    "_id email"
  );

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const tasks = await Task.find({
    user: { $in: users.map((user: any) => user._id) },
    completed: false,
    dueDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate([
    {
      path: "tags",
      select: "_id label color",
    },
    {
      path: "user",
      select: "_id email profile",
    },
  ]);

  const idToEmails = users.reduce((acc: any, user: any) => {
    acc[user._id] = user.email;
    return acc;
  }, {});

  const groupedTasks: { [key: string]: TaskDocument[] } = tasks.reduce(
    (acc: any, task: TaskDocument) => {
      const email = idToEmails[task.user._id.toString()];
      if (!acc[email]) {
        acc[email] = [];
      }
      acc[email].push(task);
      return acc;
    },
    {}
  );

  console.log("sendDailyEmailToUsers");
  console.log(users);
  console.log(JSON.stringify(groupedTasks, null, 2));

  const emails = Object.entries(groupedTasks).map(([email, tasks]) => {
    const username =
      tasks[0].user.profile.firstName + " " + tasks[0].user.profile.lastName;

    const subject = `${tasks.length} tâche${tasks.length > 0 ? "s" : ""} prévue${tasks.length > 0 ? "s" : ""} aujourd'hui`;

    return {
      from: `${process.env.PROJECT_NAME} <${process.env.NOREPLY}>`,
      to: [email],
      subject,
      react: DailyReminderEmail({ username, tasks }),
    };
  });

  const resend = new Resend(process.env.RESEND_APIKEY);

  await resend.batch.send(emails);
};

export { getUserInfo, findOrCreateUser, sendDailyEmailToUsers };
