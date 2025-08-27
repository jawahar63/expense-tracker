import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { currency } from '../utils/format'


const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#6EACDA','#A78BFA','#F472B6']


export default function ExpenseChart({ expenses, categories }){
// compute totals per category
const data = useMemo(()=>{
const map = {}
for(const e of expenses){
const c = e.category || 'others'
map[c] = (map[c] || 0) + Number(e.amount || 0)
}
return Object.entries(map).map(([category, amount])=>({ category, amount }))
},[expenses])


const barData = useMemo(()=>{
// small aggregated list showing amounts by category
return data.map(d=>({ name: d.category, amount: d.amount }))
},[data])


return (
<div className="card">
<h3>Charts</h3>
<div style={{height:280,display:'flex',gap:12}}>
<div style={{flex:1}}>
<ResponsiveContainer width="100%" height="100%">
<PieChart>
<Pie data={data} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label />
{data.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
<Tooltip formatter={(value)=>currency(value)} />
</PieChart>
</ResponsiveContainer>
</div>
<div style={{flex:1}}>
<ResponsiveContainer width="100%" height="100%">
<BarChart data={barData} margin={{top:5,right:20,left:0,bottom:5}}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip formatter={(value)=>currency(value)} />
<Bar dataKey="amount">
{barData.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
</Bar>
</BarChart>
</ResponsiveContainer>
</div>
</div>
</div>
)
}