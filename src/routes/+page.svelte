<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { PageProps } from "./$types";
	let { data }: PageProps = $props();

	let permission = $state<NotificationPermission>("default");
	let notifications = $state<string[]>([]);
	let rpButtonText = $state<string>("Request Permission");

	const title = "Test Notification";
	const body = "This is a test notification";

	function urlBase64ToUint8Array(base64String?: string) {
		if (!base64String) throw new Error("VAPID public key is required");
		var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		var base64 = (base64String + padding)
			.replace(/\-/g, "+")
			.replace(/_/g, "/");
		var rawData = window.atob(base64);
		var outputArray = new Uint8Array(rawData.length);
		for (var i = 0; i < rawData.length; ++i)
			outputArray[i] = rawData.charCodeAt(i);
		return outputArray;
	}

	$effect(() => {
		if (typeof window !== "undefined" && "Notification" in window) {
			permission = Notification.permission;
			switch (permission) {
				case "granted":
					rpButtonText = "Permission Granted";
					break;
				case "denied":
					rpButtonText = "Permission Denied";
					break;
				default:
					rpButtonText = "Request Permission";
			}
		} else {
			rpButtonText = "Notifications Not Supported";
		}
	});

	async function requestPermission() {
		if ("Notification" in window) {
			permission = await Notification.requestPermission();
		}
	}

	function sendNotification() {
		if (permission !== "granted") {
			alert("Notification permission not granted");
			return;
		}

		if (!("Notification" in window)) {
			alert("Notifications not supported");
			return;
		}

		new Notification(title, {
			body,
		});

		notifications = [
			...notifications,
			`${new Date().toLocaleTimeString()}: ${title}`,
		];
	}

	function clearHistory() {
		notifications = [];
	}

	const enhanceHandlePushNotification: SubmitFunction = async ({
		formData,
		cancel,
	}) => {
		// A. Basic capability detection
		if (!("serviceWorker" in navigator))
			throw new Error("Current browser does not support Service Worker");
		if (!("PushManager" in window))
			throw new Error("Current browser does not support Push API");
		if (!("Notification" in window))
			throw new Error(
				"Current browser does not support Notification API",
			);
		// B. Register Service Worker (ensure /sw.js is accessible)
		const registration = await navigator.serviceWorker.register("/sw.js");
		console.log("Service Worker registered successfully");
		// C. Request notification permission
		if (permission !== "granted") {
			const result = await Notification.requestPermission();
			if (result !== "granted") {
				cancel();
				throw new Error("User denied notification permission");
			}
		}
		// D. Reuse existing subscription if available, otherwise create new one
		let subscription = await registration.pushManager.getSubscription();
		if (!subscription) {
			subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true, // Required by Web Push
				applicationServerKey: urlBase64ToUint8Array(data.publicKey), // VAPID public key
			});
			console.log("New subscription created successfully");
		} else {
			console.log("Reusing existing subscription");
		}
		// E. Add Subscription Info to FormData for Server Processing
		formData.append("subscription", JSON.stringify(subscription));

		return async ({ result, update }) => {
			if (result.type === "success") {
				notifications = [
					...notifications,
					`${new Date().toLocaleTimeString()}: Backend Push Notification Successfully`,
				];
				update();
			} else {
				console.error(
					"Failed to send subscription info to server: " +
						result.status?.toString() || "Unknown error",
				);
				if (result.status == 410 || result.status == 404) {
					subscription = await registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: urlBase64ToUint8Array(
							data.publicKey,
						),
					});
				}
				alert("Failed to send subscription info to server");
				cancel();
			}
		};
	};
</script>

<main class="flex flex-col items-center min-w-3/5 gap-6">
	<h1 class="text-3xl font-bold">Notification Test</h1>
	<div class="flex flex-row justify-around w-full">
		<button
			class="test-button"
			onclick={requestPermission}
			disabled={permission === "granted" || permission === "denied"}
			>{rpButtonText}</button
		>
		<button
			class="test-button"
			onclick={sendNotification}
			disabled={permission !== "granted"}>Local Notification</button
		>
		<form method="POST" use:enhance={enhanceHandlePushNotification}>
			<button
				class="test-button"
				disabled={permission !== "granted" ||
					!("PushManager" in window) ||
					!("serviceWorker" in navigator)}
				>Push Remote Notification</button
			>
		</form>
	</div>
	<div class="flex flex-row gap-4">
		<h3 class="font-bold">Feature Detection:</h3>
		<span
			>Notification:<span class="font-semibold"
				>{typeof window !== "undefined" && "Notification" in window
					? "Supported"
					: "Not Supported"}</span
			></span
		>
		<span
			>ServiceWorker:<span class="font-semibold"
				>{typeof window !== "undefined" && "serviceWorker" in navigator
					? "Supported"
					: "Not Supported"}</span
			></span
		>
		<span
			>PushManager:<span class="font-semibold"
				>{typeof window !== "undefined" && "PushManager" in window
					? "Supported"
					: "Not Supported"}</span
			></span
		>
	</div>
	<div>
		<h2>History</h2>
		{#if notifications.length === 0}
			<p>No notifications sent yet</p>
		{:else}
			<button onclick={clearHistory}>Clear</button>
			<ul>
				{#each notifications as notif}
					<li>{notif}</li>
				{/each}
			</ul>
		{/if}
	</div>
</main>

<style>
	@reference "tailwindcss";
	:global(body) {
		@apply flex items-center justify-center w-screen h-screen;
	}
</style>
