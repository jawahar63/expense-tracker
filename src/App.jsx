import React from 'react'
import Navbar from './components/Navbar'
import useAuthState from './hooks/useAuthState'
import useExpenses from './hooks/useExpenses'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseChart from './components/ExpenseChart'


export default function App(){
const {user,loading} = useAuthState()
const { expenses, categories, addExpense, addCategory } = useExpenses(user?.uid)


if(loading) return <div className="container">Loading...</div>


return (
<div style={{minHeight:'100vh',background:'#f8fafc'}}>
<Navbar />
<main className="container" style={{display:'grid',gridTemplateColumns:'1fr',gap:16}}>
{!user && (
<div className="card">Please login to continue</div>
)}


{user && (
<>
<div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:16}}>
<ExpenseForm categories={categories} onAdd={(p)=>addExpense(user.uid,p)} onAddCategory={(n)=>addCategory(user.uid,n)} />
<div style={{display:'grid',gap:12}}>
<ExpenseChart expenses={expenses} categories={categories} />
<div className="card">
<h3>Summary</h3>
<div className="small">Total: {expenses.reduce((s,e)=>s + Number(e.amount||0),0)}</div>
</div>
</div>
</div>


<ExpenseList expenses={expenses} />
</>
)}


</main>
</div>
)
}