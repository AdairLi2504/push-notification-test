<script lang="ts">
	let permission = $state<NotificationPermission>('default');
	let notifications = $state<string[]>([]);
	let rpButtonText = $state<string>('Request Permission');

	const title = 'Test Notification';
	const body = 'This is a test notification';

	$effect(() => {
		if (typeof window !== 'undefined' && 'Notification' in window) {
			permission = Notification.permission;
			switch (permission) {
				case 'granted':
					rpButtonText = 'Permission Granted';
					break;
				case 'denied':
					rpButtonText = 'Permission Denied';
					break;
				default:
					rpButtonText = 'Request Permission';
			}
		}
	});

	async function requestPermission() {
		if ('Notification' in window) {
			permission = await Notification.requestPermission();
		}
	}

	function sendNotification() {
		if (permission !== 'granted') {
			alert('Notification permission not granted');
			return;
		}

		if (!('Notification' in window)) {
			alert('Notifications not supported');
			return;
		}

		new Notification(title, {
			body,
		});

		notifications = [...notifications, `${new Date().toLocaleTimeString()}: ${title}`];
	}

	function clearHistory() {
		notifications = [];
	}
</script>

<h1>Notification Test</h1>

<button class="test-button" onclick={requestPermission} disabled={permission === 'granted'}>{rpButtonText}</button>


<button class="test-button" onclick={sendNotification} disabled={permission !== 'granted'}>Send Notification</button>

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
