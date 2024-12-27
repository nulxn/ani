<script lang="ts">
	import { _ } from '$lib/jburry';
	let { url } = $props();
	let notSet = $derived(url.value === '');
	let currentUrl = $state('');
	let modUrl = $derived(currentUrl + '/stream?path=' + url.value);
	import shaka from 'shaka-player';
	import { onMount } from 'svelte';

	onMount(() => {
		currentUrl = window.location.origin;
	});

	$effect(() => {
		url.value;
		console.log('effect', url.value);
		console.log(currentUrl);

		if (url.value === '') return;
		let video = document.getElementById('video') as HTMLVideoElement;
		if (!video) return;

		// https://www110.anzeat.pro/streamhls/156eaab7f95a98a9d12644f457a04f9c/ep.1.1728164109.m3u8
		let toFetch = $derived(url.value.split('/').slice(0, -1).join('/'));

		shaka.polyfill.installAll();
		if (shaka.Player.isBrowserSupported()) {
			let player = new shaka.Player(video);
			player.getNetworkingEngine()?.registerRequestFilter((type, request) => {
				if (!request.uris[0].includes('/stream?path=')) {
					request.uris[0] = request.uris[0].replace(
						currentUrl,
						currentUrl + '/stream?path=' + toFetch
					);
				}
			});

			player
				.load(modUrl)
				.then(() => {
					console.log('The video has now been loaded!');
				})
				.catch((error: any) => {
					console.error('Error code', error.code, 'object', error);
				});
		} else {
			console.error('Browser not supported!');
		}
	});
</script>

<div class="player">
	<!-- svelte-ignore a11y_media_has_caption -->
	{#if notSet}
		<p>Loading ...</p>
	{:else}
		<video id="video" controls> </video>
	{/if}
</div>
