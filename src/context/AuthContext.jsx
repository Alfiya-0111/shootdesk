import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [studioData, setStudioData] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, studioName, ownerName) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: ownerName })

    // Save studio data to Firestore
    await setDoc(doc(db, 'studios', result.user.uid), {
      studioName,
      ownerName,
      email,
      phone: '',
      address: '',
      createdAt: Date.now(),
      plan: 'free',
    })

    return result
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    return signOut(auth)
  }

  async function fetchStudioData(uid) {
    const snap = await getDoc(doc(db, 'studios', uid))
    if (snap.exists()) {
      setStudioData(snap.data())
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchStudioData(user.uid)
      } else {
        setStudioData(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const value = {
    currentUser,
    studioData,
    setStudioData,
    signup,
    login,
    logout,
    fetchStudioData,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}