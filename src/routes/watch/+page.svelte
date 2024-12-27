<script lang="ts">
	import type { PageData } from './$types';
	import CryptoJS from 'crypto-js';
	import Player from '$lib/Player.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let videoPath = $state({ value: '' });

	let vaidPage = true;
	if (!data.id) {
		vaidPage = false;
	}

	let episode = 1;
	if (data.episode) episode = data.episode;

	let epLimit = $state({ min: 0, max: 1 });

	let relatedEpisodes = $state<
		{
			num: string | null | undefined;
			href: string | null | undefined;
			mode: string | null | undefined;
		}[]
	>([]);

	let error = $state('');
	if (vaidPage && browser) {
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
					if (!iframe) {
						error = 'IFrame not found';
						return;
					}

					let id = (doc.querySelector('input#movie_id') as HTMLInputElement)?.value;
					let alias = (doc.querySelector('input#alias_anime') as HTMLInputElement)?.value;
					let default_ep = (doc.querySelector('input#default_ep') as HTMLInputElement)?.value;
					let _e = doc.querySelector('#episode_page a');
					let ep_start = _e?.getAttribute('ep_start');
					let ep_end = _e?.getAttribute('ep_end');

					epLimit = { min: parseInt(ep_start || '1'), max: parseInt(ep_end || '1') };

					fetch(
						`https://ajax.gogocdn.net/ajax/load-list-episode?ep_start=${ep_start}&ep_end=${ep_end}&id=${id}&default_ep=${default_ep}&alias=${alias}`
					)
						.then((res) => res.text())
						.then((json) => {
							let html = json;
							let parser = new DOMParser();
							let doc = parser.parseFromString(html, 'text/html');

							let ul = doc.querySelector('#episode_related');
							let lis = ul?.querySelectorAll('li');
							lis?.forEach((li) => {
								let a = li.querySelector('a');

								let num = a?.querySelector('.name')?.textContent;
								let href = a?.getAttribute('href');
								let mode = a?.querySelector('.cate')?.textContent;

								relatedEpisodes.push({
									num,
									href: href?.replace(' /', '/watch?id=').replace('-episode-', '&episode='),
									mode
								});
							});
						});

					console.log(iframe.src);
					fetch(`/api/`, {
						method: 'POST',
						body: JSON.stringify({
							uri: iframe.src,
							headers: {
								'x-requested-with': 'XMLHttpRequest'
							}
						})
					})
						.then((res) => res.json())
						.then((json) => {
							//console.log(json);
							let html = json;
							let parser = new DOMParser();
							let doc = parser.parseFromString(html, 'text/html');

							let script = doc.querySelector("script[data-name='episode']");
							if (!script) {
								error = 'Script not found';
								return;
							}

							let key = script.getAttribute('data-value');
							if (!key) {
								error = 'Key not found';
								return;
							}

							let bodyClass = doc
								.querySelector("body[class^='container-']")
								?.getAttribute('class')
								?.split('-')
								.pop();
							let divClass = doc
								.querySelector("div[class*='container-']")
								?.getAttribute('class')
								?.split('-')
								.pop();

							if (!bodyClass || !divClass) {
								error = 'Classes not found';
								return;
							}

							let values = CryptoJS.AES.decrypt(key, CryptoJS.enc.Utf8.parse(bodyClass), {
								iv: CryptoJS.enc.Utf8.parse(divClass)
							});

							let data = CryptoJS.enc.Utf8.stringify(values);
							let storageKey = data.substr(0, data.indexOf('&'));

							console.log({
								key,
								values,
								data,
								storageKey
							});

							fetch('/api/', {
								method: 'POST',
								body: JSON.stringify({
									uri:
										'https://s3embtaku.pro/encrypt-ajax.php?id=' +
										CryptoJS.AES.encrypt(
											storageKey,
											CryptoJS.enc.Utf8.parse(
												doc
													.querySelector("body[class^='container-']")
													?.className.split('-')
													.pop() || ''
											),
											{
												iv: CryptoJS.enc.Utf8.parse(
													doc
														.querySelector("div[class*='container-']")
														?.className.split('-')
														.pop() || ''
												)
											}
										).toString() +
										data.substr(data.indexOf('&')) +
										'&alias=' +
										storageKey,
									headers: {
										'x-requested-with': 'XMLHttpRequest'
									}
								})
							})
								.then((response) => response.json())
								.then((b) => {
									let e = JSON.parse(b);
									var data = JSON.parse(
										CryptoJS.enc.Utf8.stringify(
											CryptoJS.AES.decrypt(
												e.data,
												CryptoJS.enc.Utf8.parse(
													doc
														.querySelector("div[class*='videocontent-']")
														?.className.split('-')
														.pop() || ''
												),
												{
													iv: CryptoJS.enc.Utf8.parse(
														doc
															.querySelector("div[class*='container-']")
															?.className.split('-')
															.pop() || ''
													)
												}
											)
										)
									);

									videoPath.value = data.source[0].file;
								});
						});
				});
			}
		});
	}
</script>

<h1>watch</h1>
<Player url={videoPath} />
{#if error.length > 0}
	<span class="error">Error!: {error}</span>
{/if}

<div class="episodes-container">
	<h2 class="top">Showing {epLimit.min}-{epLimit.max}</h2>
	<div class="episodes">
		{#each relatedEpisodes as item}
			<div class="episode-item">
				<a
					href={item.href || '#'}
					role="button"
					onclick={() => goto(item.href || '#')}
					onkeydown={(e) => e.key === 'Enter' && goto(item.href || '#')}
					>{item.num} <span>| {item.mode}</span></a
				>
			</div>
		{/each}
	</div>
</div>

<style>
	.error {
		color: var(--fgColor-danger);
	}

	.episodes-container {
		text-align: center;
		width: 40vw;
		margin: 0 auto;
		height: auto;
		justify-content: center;
	}

	.episodes {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		height: auto;
		justify-content: center;
		margin: 0 auto;
		flex-direction: row;
	}

	.episode-item {
		margin: 0.5rem;
	}

	.episode-item a {
		color: var(--fgColor-default);
		text-decoration: none;
	}

	.episode-item a:hover {
		color: var(--fgColor-accent-hover);
	}

	.episode-item span {
		color: var(--fgColor-muted);
	}
</style>
