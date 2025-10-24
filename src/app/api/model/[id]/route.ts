import {NextRequest, NextResponse} from "next/server";
import { secureRequest } from "@/lib/secureRequest";
import {getDBInstance} from "@/lib/db";

type DynParams = {
    params: {
        id: string;
    }
}

export async function GET(req: NextRequest, {params}: DynParams): Promise<NextResponse> {
    try {
        const data: {id: string} = (await params) as { id: string };
        const ambassador_id: number = Number(data.id);

        const db = await getDBInstance();

        let [rows]: any = await db.execute(`SELECT
                                                    Ambassador_Info.ambassador_id, 
                                                    Ambassador_Info.user_id,
                                                    Users.first_name,
                                                    Users.last_name,
                                                    Users.age,
                                                    Ambassador_Info.biography,
                                                    Ambassador_Info.background,
                                                    Ambassador_Info.field_id,
                                                    Fields.domain_name,
                                                    Ambassador_Info.job,
                                                    Ambassador_Info.company,
                                                    Ambassador_Info.pitch
                                              FROM Ambassador_Info
                                              INNER JOIN Users ON Users.user_id = Ambassador_Info.user_id
                                              LEFT JOIN Fields ON Fields.field_id = Ambassador_Info.field_id
                                              WHERE Ambassador_Info.ambassador_id = ?`, [ambassador_id]);
        if (!rows || !rows.length) {
            return NextResponse.json({success: false, message: "Utilisateur non trouvé"}, {status: 404});
        }

        const ambassadorInfo: AmbassadorInfo | null = rows[0] || null;

        if (!ambassadorInfo) {
            return NextResponse.json({success: false, message: "Internal Error"}, {status: 500})
        }

        ambassadorInfo.age = Number(ambassadorInfo.age);

        [rows] = await db.execute(`SELECT * FROM Projects WHERE ambassador_id = ?`, [ambassadorInfo.ambassador_id]);

        ambassadorInfo.projects = rows[0] || [];
        return NextResponse.json({success: true, message: "", data: {...ambassadorInfo}}, {status: 200});
    } catch (error: unknown) {
        const errorMsg: string = (error as {message: string})?.message || "";
        return NextResponse.json({success: false, message: errorMsg}, {status: 500})
    }
}