export const currency = (n)=> {
if (n == null) return '₹0'
return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}


export const dateStr = (d)=> new Date(d).toLocaleDateString()