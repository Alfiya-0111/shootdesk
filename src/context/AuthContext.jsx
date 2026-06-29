import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
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

    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14) // 14 days free trial

    await setDoc(doc(db, 'studios', result.user.uid), {
      studioName,
      ownerName,
      email,
      phone: '',
      address: '',
      createdAt: Date.now(),
      plan: 'trial', // trial, free, pro, studio
      trialStart: Date.now(),
      trialEnd: trialEnd.getTime(),
      subscriptionStatus: 'active', // active, expired, cancelled
      orderCount: 0,
      referralCode: generateReferralCode(result.user.uid),
      referredBy: null,
    })

    return result
  }

  function generateReferralCode(uid) {
    return 'SD' + uid.substring(0, 6).toUpperCase()
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

  // Check if trial expired
  function isTrialExpired() {
    if (!studioData) return false
    if (studioData.plan !== 'trial') return false
    return Date.now() > studioData.trialEnd
  }

  // Check if user can add more orders
  function canAddOrder() {
    if (!studioData) return false
    if (studioData.plan === 'pro' || studioData.plan === 'studio') return true
    if (studioData.plan === 'trial' && !isTrialExpired()) return true
    // Free plan: 50 orders limit
    return (studioData.orderCount || 0) < 50
  }

  async function incrementOrderCount() {
    if (!currentUser) return
    const ref = doc(db, 'studios', currentUser.uid)
    await updateDoc(ref, {
      orderCount: (studioData?.orderCount || 0) + 1
    })
    setStudioData(prev => ({ ...prev, orderCount: (prev?.orderCount || 0) + 1 }))
  }

  async function upgradePlan(planType) {
    if (!currentUser) return
    const ref = doc(db, 'studios', currentUser.uid)
    await updateDoc(ref, {
      plan: planType,
      subscriptionStatus: 'active',
      upgradedAt: Date.now(),
    })
    setStudioData(prev => ({ ...prev, plan: planType, subscriptionStatus: 'active' }))
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
    isTrialExpired,
    canAddOrder,
    incrementOrderCount,
    upgradePlan,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}