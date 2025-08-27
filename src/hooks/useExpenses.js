import { useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'


export default function useExpenses(uid){
const [expenses,setExpenses] = useState([])
const [categories,setCategories] = useState([])


useEffect(()=>{
if(!uid) return;
const q = query(collection(db, `users/${uid}/expenses`), orderBy('createdAt','desc'))
const unsub = onSnapshot(q, snap=>{
const arr = []
snap.forEach(d=>arr.push({id:d.id,...d.data()}))
setExpenses(arr)
})


// categories: a simple collection to store user categories
const qcat = collection(db, `users/${uid}/categories`)
const unsubCat = onSnapshot(qcat, snap=>{
const cats = []
snap.forEach(d=>cats.push({id:d.id,...d.data()}))
setCategories(cats)
})


return ()=>{unsub();unsubCat();}
},[uid])


const addExpense = async (uid,payload)=>{
// payload: {amount,category,note,date}
await addDoc(collection(db, `users/${uid}/expenses`),{
amount: Number(payload.amount),
category: payload.category,
note: payload.note||'',
when: payload.date||new Date(),
createdAt: new Date()
})
// ensure category exists
const catRef = doc(db, `users/${uid}/categories`, payload.category)
await setDoc(catRef, { name: payload.category }, { merge: true })
}


const addCategory = async (uid, name)=>{
const ref = doc(db, `users/${uid}/categories`, name)
await setDoc(ref, { name }, { merge: true })
}


return {expenses,categories,addExpense,addCategory}
}