// Task class with TypeScript types
export default class Task {
    constructor(title, description = '') {
        this.title = title;
        this.description = description;
        this.completed = false;
        this.createdAt = new Date();
    }
    // Method with return type annotation
    toggleComplete() {
        this.completed = !this.completed;
        return this;
    }
    // Static method with parameter and return type
    static fromObject(obj) {
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
