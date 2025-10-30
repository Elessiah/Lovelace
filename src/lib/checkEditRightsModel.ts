import {Pool} from "mysql2/promise";

export default async function checkEditRightsModel(db: Pool, model_id: number, user_id: number): Promise<boolean> {
    const [rows] = await db.execute(`SELECT user_id FROM Ambassador_Info WHERE ambassador_id = ?`, [model_id]);

    if (!rows || !(rows as unknown[]).length) {
        return false;
    }
    const target_id: number = Number((rows as {user_id : string}[])[0].user_id)

    if (Number(target_id) != user_id) {
        return false;
    }
    return true;
}