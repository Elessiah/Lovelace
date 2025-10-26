import {NextRequest, NextResponse} from "next/server";
import getAmbassadorInfo from "@/lib/getAmbassadorInfo";

type DynParams = {
    params: {
        id: string;
    }
}

export async function GET(req: NextRequest, {params}: DynParams): Promise<NextResponse> {
    const data: {id: string} = (await params) as { id: string };
    const ambassador_id: number = Number(data.id);
    const AmbassadorInfo: AmbassadorInfo | ErrorReturn = await getAmbassadorInfo({model_id: ambassador_id});
    if (AmbassadorInfo.hasOwnProperty("message")) {
        return NextResponse.json({success: false, message: (AmbassadorInfo as ErrorReturn).message}, {status: (AmbassadorInfo as ErrorReturn).status});
    }
    return NextResponse.json({success: true, message: "", data: AmbassadorInfo}, {status: 200});
}