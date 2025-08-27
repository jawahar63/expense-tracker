import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'


export default function useAuthState(){
const [user,setUser] = useState(null)
const [loading,setLoading] = useState(true)
useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)}),[])


const login = ()=> signInWithPopup(auth, googleProvider)
const logout = ()=> signOut(auth)
return {user,loading,login,logout}
}