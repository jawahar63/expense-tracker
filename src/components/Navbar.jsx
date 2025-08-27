import React from 'react'
import useAuthState from '../hooks/useAuthState'


export default function Navbar(){
const {user,login,logout,loading} = useAuthState()
return (
<header className="header container">
<div>
<h2 style={{margin:0}}>ExpenseTracker</h2>
<div className="small">Category-wise charts • PWA</div>
</div>
<div style={{marginLeft:'auto'}} className="flex-gap">
{user? <>
<div className="small">{user.displayName}</div>
<button className="btn" onClick={logout}>Logout</button>
</> : <button className="btn" onClick={login}>{loading? '...' : 'Login with Google'}</button>}
</div>
</header>
)
}