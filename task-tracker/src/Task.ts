
   // Define interfaces for Task data
  export interface TaskData {
    title: string;
    completed?: boolean;
    createdAt?: Date | string;
    description?: string;
   }
   // Task class with TypeScript types
   export default class Task {
    title: string;
    completed: boolean;
    createdAt: Date;
    description: string;
   
    constructor(title: string, description: string = '') {
    this.title = title;
    this.description = description;
    this.completed = false;
    this.createdAt = new Date();
    }
   
    // Method with return type annotation
    toggleComplete(): Task {
    this.completed = !this.completed;
    return this;
    }
   
    // Static method with parameter and return type
    static fromObject(obj: TaskData): Task {
    const task = new Task(obj.title, obj.description || '');
   
    if (obj.completed !== undefined) {
    task.completed = obj.completed;
    }
   
    if (obj.createdAt) {
    task.createdAt = new Date(obj.createdAt);
    }
   
    return task;
    }
}