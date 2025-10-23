import {NextRequest, NextResponse} from "next/server";
import { secureRequest } from "@/lib/secureRequest";
import {getDBInstance} from "@/lib/db";

export async function GET(req: NextRequest): Promise<NextResponse> {
    return await secureRequest(req, async (request, user_id) : Promise<NextResponse> => {
        try {
            const db = await getDBInstance();

            let [rows]: any = await db.execute(`SELECT *
                                                  FROM Ambassador_Info
                                                  WHERE user_id = ?`, [user_id]);
            if (!rows || !rows.length) {
                return NextResponse.json({success: false, message: "Utilisateur non trouvé"}, {status: 404});
            }

            const ambassadorInfo: AmbassadorInfo | null = rows[0] || null;

            if (!ambassadorInfo) {
                return NextResponse.json({success: false, message: "Internal Error"}, {status: 500})
            }

            [rows] = await db.execute(`SELECT * FROM Projects WHERE ambassador_id = ?`, [ambassadorInfo.ambassador_id]);

            ambassadorInfo.projects = rows[0] || [];
            return NextResponse.json({success: true, message: "", data: {...ambassadorInfo}}, {status: 200});
        } catch (error: unknown) {
            const errorMsg: string = (error as {message: string})?.message || "";
            return NextResponse.json({success: false, message: errorMsg}, {status: 500})
        }
    });

}