import type { User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "./config"

// Check if a user is an admin
export const checkIsAdmin = async (user: User): Promise<boolean> => {
  try {
    const userDocRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userDocRef)

    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.role === "admin"
    }

    return false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// This function would be used in a Cloud Function to set admin claims
// Note: In a real app, this would be implemented in a Firebase Cloud Function
export const setAdminRole = async (userId: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId)

    await userDocRef.update({
      role: "admin",
    })

    // In a real implementation, you would also set custom claims via Firebase Admin SDK
    // This requires a backend/Cloud Function as it cannot be done from the client
  } catch (error) {
    console.error("Error setting admin role:", error)
    throw error
  }
}
