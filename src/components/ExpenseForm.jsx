import React, { useState } from 'react'


export default function ExpenseForm({ categories = [], onAdd, onAddCategory }){
const [amount,setAmount] = useState('')
const [category,setCategory] = useState('')
const [note,setNote] = useState('')
const [date,setDate] = useState(new Date().toISOString().slice(0,10))
const [newCat,setNewCat] = useState('')


const submit = async (e)=>{
e.preventDefault()
if(!amount || !category) return alert('amount and category required')
await onAdd({amount,category,note,date: new Date(date)})
setAmount(''); setNote('')
}


return (
<div className="card">
<form onSubmit={submit} className="space-between">
<div style={{flex:1,display:'grid',gap:8}}>
<input className="input" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
<select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
<option value="">-- Select category --</option>
{categories.map(c=> <option key={c.id} value={c.name}>{c.name}</option>)}
</select>
<input className="input" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} />
<input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
</div>
<div style={{display:'flex',flexDirection:'column',gap:8,marginLeft:12}}>
<button className="btn" type="submit">Add</button>
<div style={{display:'grid',gap:6}}>
<input className="input" placeholder="New category" value={newCat} onChange={e=>setNewCat(e.target.value)} />
<button type="button" className="btn" onClick={()=>{ if(!newCat) return; onAddCategory(newCat); setNewCat('') }}>Add Category</button>
</div>
</div>
</form>
</div>
)
}