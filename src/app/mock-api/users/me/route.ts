import { NextResponse} from "next/server";
import appConfig from "@/lib/appconfig";

export async function GET(){
    return NextResponse.json({
        status: "success",
        data: {
            username: "samuraicoderr",
            email: "williamusanga23@gmail.com",
            first_name: "Williams",
            last_name: "Samuel",
            avatar: appConfig.media.avatarExample,

        }
    });
}