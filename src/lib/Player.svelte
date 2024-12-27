<script lang="ts">
	import { _ } from '$lib/jburry';
	let { url } = $props();
	let notSet = $derived(url.value === '');
	let currentUrl = $state('');
	let modUrl = $derived(currentUrl + '/stream?path=' + url.value);
	import { onMount } from 'svelte';
	//import shaka from 'shaka-player';
	let _doc = $state() as Document;

	onMount(() => {
		currentUrl = window.location.origin;
		_doc = document;
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
	<div class="control">
		<button onclick={() => _('#video', _doc).currentTime(10)}>Forward</button>
		<button onclick={() => _('#video', _doc).currentTime(-10)}>Backward</button>
	</div>
</div>

<style>
	.player {
		width: 40vw;
		margin: 0 auto;
		height: auto;
		padding: 2rem;
		background-color: var(--bgColor-muted);
		border-width: var(--borderWidth-default);
		border-radius: var(--borderRadius-default);
		border-color: var(--borderColor-default);
		border-style: solid;
	}

	#video {
		width: 100%;
		height: 90%;
		border-width: var(--borderWidth-default);
		border-radius: var(--borderRadius-default);
		border-color: var(--borderColor-emphasis);
		border-style: solid;
	}

	.control {
		display: flex;
		justify-content: space-around;
	}

	.control button {
		padding: 0.5rem 1rem;
		background-color: var(--bgColor-default);
		color: var(--fgColor-default);
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
	}
</style>
