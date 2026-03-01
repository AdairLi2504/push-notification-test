import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import webpush from "web-push";
import { env } from "$env/dynamic/private";

webpush.setVapidDetails(
	"mailto:adairli0309@icloud.com",
	env.publicKey || "",
	env.privateKey || ""
)


export const load: PageServerLoad = async ({ platform }) => {
	const publicKey = platform?.env.publicKey;
	return { publicKey }
}

export const actions: Actions = {
	default: async ({ request, platform }) => {
		if (!platform?.env.publicKey) return fail(500, { message: "Public VAPID Key Not Found" });
		if (!platform?.env.privateKey) return fail(500, { message: "Private VAPID Key Not Found" });
		const formData = await request.formData();
		if (!formData.has("subscription") || !formData.get("subscription")) return fail(400, { message: "Missing subscription data" });
		const subscription = JSON.parse(formData.get("subscription") as string);
		if (!subscription || !subscription.endpoint
			|| !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth)
			return fail(400, { message: "Invalid subscription data" });
		const data = {
			title: "Test Notification",
			body: "This is a push notification sent from the backend!",
		};
		const pushRes = await webpush.sendNotification(subscription,JSON.stringify(data))
		if (pushRes.statusCode <= 300 && pushRes.statusCode >= 200) return { success: true };
		else if (pushRes.statusCode === 410) return fail(410, { message: "SubscriptionInvalid" });
		else if (pushRes.statusCode === 404) return fail(404, { message: "SubscriptionNotFound" });
		else if (pushRes.statusCode === 401) return fail(401, { message: "VAPIDunauthorized" });
		else if (pushRes.statusCode === 403) return fail(403, { message: "VAPIDforbidden" });
		else return fail(pushRes.statusCode, { message: pushRes });
	}
}