import { Outlet } from 'react-router-dom'
import CustomerNavbar from '../components/CustomerNavbar'

/*
WHY Outlet?
React Router v6 uses Outlet to render
child routes inside a layout component.
CustomerLayout renders the Navbar ONCE
and Outlet renders whichever child page
matches the current URL.
This means Navbar is never duplicated.
*/

const CustomerLayout = () => {
    return (
        <div>
            <CustomerNavbar />
            <Outlet />
        </div>
    )
}

export default CustomerLayout
