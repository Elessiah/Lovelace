import {getDBInstance} from "@/lib/db";

type Props = {
    user_id?: number | null;
    model_id?: number | null;
}

export default async function getAmbassadorInfo({user_id = null, model_id = null} : Props): Promise<AmbassadorInfo | ErrorReturn> {
    try {
        let target: string;
        const targetValue: number | null = user_id || model_id;

        if (targetValue === null)
            return ({message: "Missing parameters ! Need 'user_id' or 'model_id' !", status: 500});

        if (user_id != null)
            target = "Ambassador_Info.user_id = ?";
        else
            target = "Ambassador_Info.ambassador_id = ?";
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
                                              WHERE ${target}`, [targetValue]);
        if (!rows || !rows.length) {
            return ({message: "Ambassadrice non trouvé", status: 404});
        }

        const ambassadorInfo: AmbassadorInfo | null = rows[0] || null;

        if (!ambassadorInfo) {
            return ({message: "Internal Error", status: 500})
        }

        ambassadorInfo.age = Number(ambassadorInfo.age);

        [rows] = await db.execute(`SELECT * FROM Projects WHERE ambassador_id = ?`, [ambassadorInfo.ambassador_id]);

        ambassadorInfo.projects = rows[0] || [];
        return (ambassadorInfo);
    } catch (error: unknown) {
        const errorMsg: string = (error as {message: string})?.message || "";
        return ({message: errorMsg, status: 500})
    }
}