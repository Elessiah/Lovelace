import { NextRequest, NextResponse } from "next/server";
import { secureRequest } from "@/lib/secureRequest";
import { getDBInstance } from "@/lib/db";

type DynParams = {
    params: {
        id: string;
    }
}

export async function GET(req: NextRequest, {params} : DynParams): Promise<NextResponse> {
    return await secureRequest(req, async (request, user_id, params) : Promise<NextResponse> => {
        try {
            const data: {id: string} = await params as { id: string };
            const requested_id : number = Number(data.id);

            if (requested_id != user_id) {
                return NextResponse.json({success: false, message: "Vous n'avez pas les droits pour accéder à ce Dashboard"});
            }
            const db = await getDBInstance();

            const [rows]: any = await db.execute(`SELECT email, first_name, last_name, age, role, status, pp_path
                                                  FROM Users
                                                  WHERE user_id = ?`, [requested_id]);
            if (!rows || !rows.length) {
                return NextResponse.json({success: false, message: "Utilisateur non trouvé"}, {status: 404});
            }

            const user: UserDashboard = rows[0];
            user.age = Number(user.age);
            if (user.status !== "active")
                return NextResponse.json({
                    success: false,
                    message: "Compte non activé. Vérifiez votre mail !"
                }, {status: 403});

            return NextResponse.json({success: true, message: "", data: {...user}}, {status: 200});
        } catch (error: unknown) {
            console.error(error);
            const errorMsg: string = (error as {message: string})?.message || "";
            return NextResponse.json({success: false, message: errorMsg}, {status: 500})
        }
    }, params);

}