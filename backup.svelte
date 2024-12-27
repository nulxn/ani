<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import videojs from 'video.js/dist/video.es.js';

	let vaidPage = true;
	if (!data.id) {
		vaidPage = false;
	}

	let episode = 1;
	if (data.episode) episode = data.episode;

	let error = $state('');
	if (vaidPage) {
		let pageUrl = `https://anitaku.bz/${data.id}-episode-${episode}`;
		fetch(pageUrl).then((res) => {
			if (res.status === 404) {
				error = 'Episode not found';
				return;
			} else {
				res.text().then((html) => {
					let parser = new DOMParser();
					let doc = parser.parseFromString(html, 'text/html');

					let iframe = doc.querySelector('iframe');
					fetch(
						`https://api.allorigins.win/get?url=${encodeURIComponent(iframe ? iframe.src : '')}`
					)
						.then((res) => res.json())
						.then((json) => {
							let newParser = new DOMParser();
							let newDoc = newParser.parseFromString(json.contents, 'text/html');

							let servers = newDoc.querySelectorAll('.linkserver');
							let videoPath = servers[4].getAttribute('data-video') || '';

							fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(videoPath)}`)
								.then((res) => res.json())
								.then((json) => {
									let newParser = new DOMParser();
									let newDoc = newParser.parseFromString(json.contents, 'text/html');

									let scripts = newDoc.querySelectorAll('script');
									let goodScript = scripts[scripts.length - 6].textContent;

									if (!goodScript) return;
									let firstNineLines = goodScript.split('\n').slice(0, 10).join('\n');

									let videoEl = document.createElement('video');
									let videoSrc = firstNineLines
										.split('\n')[4]
										.split(': ')[1]
										.replaceAll('"', '')
										.replaceAll(' ', '');

									const playerElement = document.getElementById('player') as HTMLVideoElement;
									if (playerElement) {
										playerElement.src = videoSrc;
									}
									var _player = videojs('player');
								});
						});
				});
			}
		});
	}
</script>

<h1>watch</h1>

<!-- svelte-ignore a11y_media_has_caption -->
<video class="video-js" controls preload="auto" id="player"></video>
<p>error: {error}</p>
