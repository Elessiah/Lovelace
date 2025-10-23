import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";

export async function secureRequest(req: NextRequest,
                                    handler: (req: NextRequest,
                                              user_id: number,
                                              data: unknown) => Promise<NextResponse>,
                                    data: unknown = null): Promise<NextResponse> {
    const token = req.cookies.get("token")?.value;
    if (!token) {
         return NextResponse.json({success: false, message: "Non connecté"}, {status: 401});
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return handler(req, decoded.user_id, data);
}

module.exports = {secureRequest};