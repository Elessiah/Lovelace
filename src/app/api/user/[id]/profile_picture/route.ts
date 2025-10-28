import {NextRequest, NextResponse} from "next/server";
import {secureRequest} from "@/lib/secureRequest";
import {getDBInstance} from "@/lib/db";
import fs from "fs";

type paramsContent = {
    id: string;
}

type DynParams = {
    params: paramsContent;
}

export async function POST(req: NextRequest, { params } : DynParams ) : Promise<NextResponse> {
    return secureRequest(req, async (req, user_id, data): Promise<NextResponse> => {
        const params: paramsContent = await data as paramsContent;
        const requested_user_id : string = params.id;

        if (Number(requested_user_id) != user_id) {
            return NextResponse.json({success: false, message: "Vous ne pouvez pas accéder au dashboard de quelqu'un d'autre"}, {status: 403});
        }

        try {
            const { picture } = await req.json();
            if  (picture) {
                const matches = picture.match(/^data:(.+);base64,(.+)$/);
                if (!matches) {
                    return NextResponse.json({ success: false, message: "Format invalide"}, {status: 400});
                }

                const mimeType = matches[1];
                const buffer = Buffer.from(matches[2], "base64");
                const extension = mimeType.split("/")[1];
                let filePath = `IMG_DATA/PP_${user_id}.${extension}`;

                fs.writeFileSync(`public/${filePath}`, buffer);

                filePath = '/' + filePath;
                console.log(filePath + "\n");
                const db = await getDBInstance();
                await db.execute(`UPDATE Users
                              SET pp_path = ?
                              WHERE user_id = ?`, [filePath, requested_user_id]);

                return NextResponse.json({success: true, message: "", newPath: filePath}, {status: 200});
            }
            return NextResponse.json({success: false, message: "Missing `picture` !"}, {status: 400});
        } catch (error) {
            const errorMsg: string = (error as {message: string})?.message || "";
            return NextResponse.json({success: false, message: errorMsg}, {status: 500});
        }
    }, params);
}