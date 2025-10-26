import {NextRequest, NextResponse} from "next/server";
import {secureRequest} from "@/lib/secureRequest";
import {getDBInstance} from "@/lib/db";
import checkEditRightsModel from "@/lib/checkEditRightsModel";

type paramsContent = {
    id: string;
    column: string;
}

type DynParams = {
    params: paramsContent;
}

export async function POST(req: NextRequest, { params } : DynParams ) : Promise<NextResponse> {
    return secureRequest(req, async (req, user_id, data): Promise<NextResponse> => {
        const params: paramsContent = await data as paramsContent;
        const columnName: string = params.column;
        const model_id : number = Number(params.id);

        try {
            const db = await getDBInstance();

            if (!await checkEditRightsModel(db, model_id, user_id))
                return NextResponse.json({success: false, message: "Tableau de bord inaccessible ou inexistant"}, {status: 403})

            const value: string = (await req.json()).value;
            await db.execute(`UPDATE Ambassador_Info
                              SET ${columnName} = ?
                              WHERE ambassador_id = ?`, [value, model_id]);
            return NextResponse.json({success: true, message: ""}, {status: 200});
        } catch (error) {
            const errorMsg: string = (error as {message: string})?.message || "";
            return NextResponse.json({success: false, message: errorMsg}, {status: 500});
        }
    }, params);
}