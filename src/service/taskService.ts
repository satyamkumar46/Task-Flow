import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Task {
  id?: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  completed: boolean;
  date: string; // YYYY-MM-DD format
  time: string; // e.g. "10:00 AM"
  setReminder: boolean;
  completedText?: string;
  userId?: string;
}

/**
 * Adds a new task for a specific user to Firestore.
 * @param task The task data to add (excluding the system-generated ID).
 * @param userId The ID of the user owning the task.
 * @returns The generated Firestore document ID.
 */
export const addTask = async (task: Omit<Task, 'id'>, userId: string): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...task,
      userId,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding task: ", error);
    throw error;
  }
};

/**
 * Fetches all tasks for a specific user from Firestore.
 * @param userId The ID of the user.
 * @returns An array of tasks.
 */
export const getTasks = async (userId: string): Promise<Task[]> => {
  try {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      } as Task);
    });
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks: ", error);
    throw error;
  }
};

/**
 * Updates a task in Firestore.
 * @param taskId The document ID of the task.
 * @param updates The fields to update.
 */
export const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>): Promise<void> => {
  try {
    const taskDocRef = doc(db, 'tasks', taskId);
    await updateDoc(taskDocRef, updates);
  } catch (error) {
    console.error("Error updating task: ", error);
    throw error;
  }
};

/**
 * Deletes a task from Firestore.
 * @param taskId The document ID of the task.
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskDocRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskDocRef);
  } catch (error) {
    console.error("Error deleting task: ", error);
    throw error;
  }
};