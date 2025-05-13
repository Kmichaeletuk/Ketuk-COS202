import chalk from 'chalk';
import inquirer from 'inquirer';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Task, { TaskData } from './Task.js';
// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data.json');
// Task list with type annotation
let tasks: Task[] = [];
// Load tasks from file
const loadTasks = async (): Promise<void> => {
 try {
 // Check if file exists
 await fs.access(DATA_FILE);

 // Read and parse the file
 const data = await fs.readFile(DATA_FILE, 'utf8');

 // Convert plain objects to Task instances with type annotations
 const taskData: TaskData[] = JSON.parse(data);
 tasks = taskData.map(obj => Task.fromObject(obj));

 console.log(chalk.green('Tasks loaded successfully!'));
 } catch (error: any) { // Type annotation for error
 // If file doesn't exist, create empty tasks array
 if (error.code === 'ENOENT') {
 tasks = [];
 } else {
 console.error(chalk.red('Error loading tasks:'), error);
 }
 }
};
// Save tasks to file
const saveTasks = async (): Promise<void> => {
 try {
 // Create directory if it doesn't exist
 const dir = path.dirname(DATA_FILE);

 await fs.mkdir(dir, { recursive: true }).catch(() => {});

 // Write tasks to file
 await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
 console.log(chalk.green('Tasks saved successfully!'));
 } catch (error) {
 console.error(chalk.red('Error saving tasks:'), error);
 }
};
// View tasks
const viewTasks = (): void => {
 console.log(chalk.blue('\n=== Your Tasks ==='));

 if (tasks.length === 0) {
 console.log(chalk.yellow('No tasks found.'));
 return;
 }

 // Display tasks using template literals
 tasks.forEach((task, index) => {
 const status = task.completed ? chalk.green('✓') : chalk.yellow('○');
 const title = task.completed ? chalk.dim(task.title) :
chalk.white(task.title);

 // Format date using Intl API
 const date = new Intl.DateTimeFormat('en-US', {
 dateStyle: 'medium',
 timeStyle: 'short'
 }).format(task.createdAt);

 // Template literal for formatted output
 console.log(`${index + 1}. ${status} ${title} ${chalk.dim(`(created:
${date})`)}`);

 // Show description if available
 if (task.description) {
 console.log(` ${chalk.dim(task.description)}`);
 }
 });

 console.log(''); // Empty line for spacing
};
// Interface for inquirer prompt results
interface AddTaskAnswers {
 title: string;
 description: string;
}
// Add a task
const addTask = async (): Promise<void> => {
 // Destructuring the result object with type annotation
 const answers: AddTaskAnswers = await inquirer.prompt([

 {
 type: 'input',
 name: 'title',
 message: 'Enter task title:',
 validate: (input: string) => input.trim() ? true : 'Title is required'
 },
 {
 type: 'input',
 name: 'description',
 message: 'Enter task description (optional):'
 }
 ]);

 // Create a new task using the class
 const task = new Task(answers.title.trim(), answers.description.trim());

 // Add to tasks array using spread operator
 tasks = [...tasks, task];

 // Save tasks
 await saveTasks();

 console.log(chalk.green(`Task "${answers.title}" added successfully!`));
};
// Interface for task selection prompt results
interface TaskSelectAnswers {
 taskIndex: number;
}
// Complete a task
const completeTask = async (): Promise<void> => {
 if (tasks.length === 0) {
 console.log(chalk.yellow('No tasks to complete!'));
 return;
 }

 // Show tasks for selection
 viewTasks();

 const { taskIndex }: TaskSelectAnswers = await inquirer.prompt([
 {
 type: 'number',
 name: 'taskIndex',
 message: 'Enter task number to toggle completion:',
 validate: (input) => {
    const index = Number(input) - 1;
    return (index >= 0 && index < tasks.length)
      ? true
      : 'Please enter a valid task number';
  }
  
  }
]);


 // Convert to 0-based index
 const index = taskIndex - 1;

 // Toggle completion status using class method
 tasks[index].toggleComplete();

 // Save tasks
 await saveTasks();

 const status = tasks[index].completed ? 'completed' : 'incomplete';
 console.log(chalk.green(`Task marked as ${status}!`));
};
// Interface for delete confirmation prompt
interface DeleteConfirmAnswers {
 confirm: boolean;
}
// Delete a task
const deleteTask = async (): Promise<void> => {
 if (tasks.length === 0) {
 console.log(chalk.yellow('No tasks to delete!'));
 return;
 }

 // Show tasks for selection
 viewTasks();

 const { taskIndex }: TaskSelectAnswers = await inquirer.prompt([
    {
        type: 'number',
        name: 'taskIndex',
        message: 'Enter task number to delete:',
        validate: (input) => {
          const index = Number(input) - 1;
          return (index >= 0 && index < tasks.length)
            ? true
            : 'Please enter a valid task number';
        }
      }
    ]);      

 const index = taskIndex - 1;
 const taskTitle = tasks[index].title;

 // Confirm deletion
 const { confirm }: DeleteConfirmAnswers = await inquirer.prompt([
 {
 type: 'confirm',
 name: 'confirm',
 message: `Are you sure you want to delete task "${taskTitle}"?`,
 default: false
 }
 ]);


 if (!confirm) {
 console.log(chalk.yellow('Deletion cancelled.'));
 return;
 }

 // Remove task from array using filter
 tasks = tasks.filter((_, i) => i !== index);

 // Save tasks
 await saveTasks();

 console.log(chalk.green(`Task "${taskTitle}" deleted successfully!`));
};
// Interface for main menu selection
interface MainMenuAnswers {
 action: 'view' | 'add' | 'complete' | 'delete' | 'exit';
}
// Show the main menu
const showMainMenu = async (): Promise<void> => {
 while (true) {
 const { action }: MainMenuAnswers = await inquirer.prompt([
 {
 type: 'list',
 name: 'action',
 message: 'What would you like to do?',
 choices: [
 { name: 'View Tasks', value: 'view' },
 { name: 'Add Task', value: 'add' },
 { name: 'Complete Task', value: 'complete' },
 { name: 'Delete Task', value: 'delete' },
 { name: 'Exit', value: 'exit' }
 ]
 }
 ]);

 if (action === 'exit') {
 console.log(chalk.blue('Goodbye!'));
 break;
 }

 // Using object property shorthand and computed property names
 const actions: Record<string, () => Promise<void> | void> = {
 view: viewTasks,
 add: addTask,
 complete: completeTask,
 delete: deleteTask
 };

 await actions[action]();
 }
};

// Start the application using arrow function
const main = async (): Promise<void> => {
 console.log(chalk.blue(`
============================
 Task Tracker
 TypeScript Version
============================
 `));

 // Load existing tasks
 await loadTasks();

 // Show main menu
 await showMainMenu();
};
// Start the application
main().catch(error => {
 console.error(chalk.red('An error occurred:'), error);
});