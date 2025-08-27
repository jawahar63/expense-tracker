import React from 'react'
import { currency, dateStr } from '../utils/format'


export default function ExpenseList({ expenses }){
return (
<div className="card expense-list">
<h3>Expenses</h3>
{expenses.length === 0 && <div className="small">No expenses yet</div>}
<div>
{expenses.map(e=> (
<div key={e.id} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9'}}>
<div>
<div style={{fontWeight:600}}>{e.category}</div>
<div className="small">{e.note}</div>
</div>
<div style={{textAlign:'right'}}>
<div style={{fontWeight:700}}>{currency(e.amount)}</div>
<div className="small">{dateStr(e.when || e.createdAt)}</div>
</div>
</div>
))}
</div>
</div>
)
}