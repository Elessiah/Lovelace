import {NextRequest, NextResponse} from "next/server";
import {secureRequest} from "@/lib/secureRequest";
import {getDBInstance} from "@/lib/db";
import { checkEditRightsModel } from "@/lib/checkEditRightsModel";

type ContentParams = {
  id: string;
  project_id: string;
  column: string;
}

type DynParams = {
    params: ContentParams;
}

export async function POST(req: NextRequest, {params}: DynParams) : Promise<NextResponse> {
    return secureRequest(req, async (req, user_id, data): Promise<NextResponse> => {
        const params: ContentParams = await data as ContentParams;
        const columnName: string = params.column;
        const model_id : number = Number(params.id);
        const project_id: number = Number(params.project_id);

        try {
            const db = await getDBInstance();

            if (!await checkEditRightsModel(db, model_id, user_id))
                return NextResponse.json({success: false, message: "Tableau de bord inaccessible ou inexistant"}, {status: 403})

            const value: string = (await req.json()).value;
            await db.execute(`UPDATE Projects
                              SET ${columnName} = ?
                              WHERE project_id = ?`, [value, project_id]);
            return NextResponse.json({success: true, message: ""}, {status: 200});
        } catch (error) {
            const errorMsg: string = (error as {message: string})?.message || "";
            return NextResponse.json({success: false, message: errorMsg}, {status: 500});
        }
    }, params);
}