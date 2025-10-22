type UserLogin = {
    user_id: number,
    hash:  string,
    role: string,
    status: string,
}

type UserDashboard = {
    user_id: number,
    email: string,
    first_name: string,
    last_name: string,
    role: string,
    status: string,
    pp_path: string,
}

type redirectPackage = {
    success: boolean,
    message: string,
    token: string,
    redirect: string
}