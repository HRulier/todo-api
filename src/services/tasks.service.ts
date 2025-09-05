import dotenv from "dotenv";
import dotEnvConfig from "~/config/dot-env";
import type { CreateTaskInput } from "~/types/task";
import Task from "~/models/task";

dotenv.config(dotEnvConfig);

const populateTask = [
  {
    path: "tags",
    select: "_id label color",
  },
];

type TaskProps = Omit<CreateTaskInput, "dueDate"> & { dueDate: string | Date };

// Create tasks and determine position if missing
const createTasks = async (tasks: TaskProps[], user: string) => {
  try {
    // Group tasks by dueDate
    const tasksByDueDate = new Map<string, TaskProps[]>();
    tasks.forEach((task: TaskProps) => {
      const dateKey =
        typeof task.dueDate === "string"
          ? task.dueDate
          : task.dueDate.toISOString();
      if (!tasksByDueDate.has(dateKey)) {
        tasksByDueDate.set(dateKey, []);
      }
      tasksByDueDate.get(dateKey)!.push(task);
    });

    const newTasks: (TaskProps & { user: string })[] = [];

    // Process tasks for each dueDate
    for (const [dateKey, groupTasks] of tasksByDueDate) {
      const dueDate = new Date(dateKey);

      const minPositionTask = await Task.findOne({
        user,
        dueDate,
      }).sort({ position: 1 });

      let startingPosition = minPositionTask
        ? minPositionTask.position - 1
        : 1024;

      groupTasks.forEach((task, index) => {
        newTasks.push({
          ...task,
          user,
          position: startingPosition - index,
        });
      });
    }

    const createdTasks = await Task.insertMany(newTasks);
    await Task.populate(createdTasks, populateTask);

    return createdTasks;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export { createTasks };
