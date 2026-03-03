# Push Notification Test

[push-notification-test.pp.ua](https://push-notification-test.pp.ua)

This a website that tests whether the browser can receive remote notifications. It includes a checker for if the browser supports PushManager, serviceWorker, and Notification, and also can try to send a real push notification.

### What's the (Web) Push Notification

Web Push Notification is a technology that allows websites to send real-time messages to users even when the browser is closed. It is implemented through push services provided by browser vendors (such as FCM and APNs) and Service Workers. Users must grant permission to receive notifications, after which the website can deliver messages to the user's device via the push service, displaying alerts even if the page is not open. This mechanism is widely used in scenarios such as news subscriptions, social interactions, and marketing campaigns, effectively enhancing user engagement and message reachability.

About Frontend: [Push API (MDN)](developer.mozilla.org/en-US/docs/Web/API/Push_API)  
About Backend (nodejs): [web-push (NPM)](www.npmjs.com/package/web-push)

### Why does the Push Notification not Work?

First of all, make sure that the browser support all of Notification, PushManager and serviceWorker. Futhermore, it should also support VAPID for crypto. Some old browers use their private but depreacated service to handle push notification. No way to check if the browser supports that except by sending a real push notification. Details can be checked below.

<table>
<thead>
<tr>
<th><strong>Browser</strong></th>
<th width="130px"><strong>Push without Payload</strong></th>
<th width="130px"><strong>Push with Payload</strong></th>
<th width="130px"><strong>VAPID</strong></th>
<th><strong>Notes</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>Chrome</td>

<!-- Push without payloads support-->
<td>✓ v42+</td>

<!-- Push with payload support -->
<td>✓ v50+</td>

<!-- VAPID Support -->
<td>✓ v52+</td>

<td>In v51 and less, the `gcm_sender_id` is needed to get a push subscription.</td>
</tr>

<tr>
<td>Edge</td>

<!-- Push without payloads support-->
<td>✓ v17+ (April 2018)</td>

<!-- Push with payload support -->
<td>✓ v17+ (April 2018)</td>

<!-- VAPID Support -->
<td>✓ v17+ (April 2018)</td>

<td></td>
</tr>

<tr>
<td>Firefox</td>

<!-- Push without payloads support-->
<td>✓ v44+</td>

<!-- Push with payload support -->
<td>✓ v44+</td>

<!-- VAPID Support -->
<td>✓ v46+</td>

<td></td>
</tr>

<tr>
<td>Opera</td>

<!-- Push without payloads support-->
<td>✓ v39+ <strong>*</strong></td>

<!-- Push with payload support -->
<td>✓ v39+ <strong>*</strong></td>

<!-- VAPID Support -->
<td>✗</td>

<td>
  <strong>*</strong> Opera supports push on Android but not on desktop.
  <br />
  <br />
  The `gcm_sender_id` is needed to get a push subscription.
</td>
</tr>

<tr>
<td>Safari</td>

<!-- Push without payloads support-->
<td>✓ v16+ </td>

<!-- Push with payload support -->
<td>✓ v16+</td>

<!-- VAPID Support -->
<td>✓ v16+</td>

<td>Safari 16 in macOS 13 or later</td>
</tr>

<tr>
<td>Samsung Internet Browser</td>

<!-- Push without payloads support-->
<td>✓ v4.0.10-53+</td>

<!-- Push with payload support -->
<td>✓ v5.0.30-40+</td>

<!-- VAPID Support -->
<td>✗</td>

<td>The `gcm_sender_id` is needed to get a push subscription.</td>
</tr>
</tbody>
</table>

Source:[web-push (NPM)](https://www.npmjs.com/package/web-push#user-content-browser-support)

After that, make sure that you give the notifiaction permission to this website. Click local notification to see if it can notify successfully. If you're not receiving them, it could be because Focus\Silent Mode is on, or because your system isn't allowing notifications from the browser. The exact problem and its solution vary depending on the system. Please notice that only when the local notification can be sent, the push notificaiton is vaild.

Privacy mode may also block push notification to avoid leak data to push notifiaction server.

Besides, for some Blink (Chrome-Like) browsers, especailly ungoogled-chromium, the fcm compent has been removed so it has no abilities to connect to push notifications server. In this circumstance, although feature detection will show that all of those features are supported, the push notification still cannot work.
Because it even cannot get a endpoint. There will be nothing updated on the history list.

The above are just the most common reasons. The actual situation may be more complex.


## Known Problem

It may not work in older browsers because Vite compiles to ES2020 by default.
