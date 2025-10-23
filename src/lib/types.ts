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
    age: number,
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

type Project = {
    project_id: number,
    ambassador_id: number,
    project_title: string,
    project_description: string,
    project_photo_path: string,
}

type AmbassadorInfo = {
    ambassador_id: number,
    user_id: number,
    biography: string,
    background: string,
    field_id: number,
    job: string,
    company: string,
    pitch: string,
    projects: Project[],
}