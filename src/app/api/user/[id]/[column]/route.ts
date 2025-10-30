import {NextRequest, NextResponse} from "next/server";
import {secureRequest} from "@/lib/secureRequest";
import {getDBInstance} from "@/lib/db";

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
        const requested_user_id : string = params.id;

        if (Number(requested_user_id) != user_id) {
            return NextResponse.json({success: false, message: "Vous ne pouvez pas accéder au dashboard de quelqu'un d'autre"}, {status: 403});
        }

        const value: string = (await req.json()).value;
        try {
            const db = await getDBInstance();
            await db.execute(`UPDATE Users
                              SET ${columnName} = ?
                              WHERE user_id = ?`, [value, requested_user_id]);
            return NextResponse.json({success: true, message: ""}, {status: 200});
        } catch (error) {
            const errorMsg: string = (error as {message: string})?.message || "";
            return NextResponse.json({success: false, message: errorMsg}, {status: 500});
        }
    }, params);
}