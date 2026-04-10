const FrontendLinks = {
    home: "/",
    mainWebsite: "https://lendsqr.com/",
    // auth
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    // dashboard
    dashboard: "/dashboard",
    users: "/dashboard/users",
    userDetails: (id: string)=>`/dashboard/users/${id}`,
    loans: "/dashboard/loans",
    loanDetails: (id: string) =>`/dashboard/loans/${id}`,
    borrowers: "/dashboard/borrowers",
    borrowerDetails: (id: string) =>`/dashboard/borrowers/${id}`
}



export default FrontendLinks;