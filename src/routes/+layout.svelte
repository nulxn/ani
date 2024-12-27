<script lang="ts">
	let { children } = $props();
	import 'shaka-player/dist/controls.css';

	let searched = $state<
		{ href: string | null; title: string | undefined; img: string | undefined }[]
	>([]);
	function search(term: string) {
		fetch('https://ajax.gogocdn.net/site/loadAjaxSearch?keyword=' + term)
			.then((res) => res.json())
			.then((json) => {
				let html = json.content;
				let parser = new DOMParser();
				let doc = parser.parseFromString(html, 'text/html');

				let links = doc.querySelectorAll('.ss-title');
				links.forEach((link) => {
					let href = link.getAttribute('href');
					let title = link.textContent?.trim();
					let thumbDiv = link.querySelector('div');
					let imgStyle = thumbDiv?.getAttribute('style');
					let img = imgStyle?.split(': ')[1].replace('")', '').replace('url("', '');

					let data = {
						href: href?.replace('category/', 'watch?id=') ?? null,
						title,
						img
					};
					searched.push(data);
				});
			});
	}

	let term = $state('');
	let searching = $state(false);
	let justSearchedFor = $state('');
	$effect(() => {
		term;
		if (term === '' || justSearchedFor === term) return;

		if (!searching) {
			searching = true;
			setTimeout(() => {
				if (term !== '' && justSearchedFor !== term) {
					console.log('searched for', term);
					searched = [];
					search(term);
					justSearchedFor = term;
					searching = false;
				}
			}, 3000);
		}
	});
</script>

<svelte:head>
	<title>no ads!</title>
	<style>
		body,
		html {
			background-color: var(--bgColor-default);
			color: var(--fgColor-default);
			font-family: 'Inter', sans-serif;
			font-size: 16px;
			font-weight: var(--base-text-weight-normal);
			line-height: 1.5;
			margin: 0;
			padding: 0;
			width: 100%;
			height: 100%;
			transition: all 0.3s ease;
		}
	</style>
</svelte:head>

<header>
	<h1 class="title">
		<a href="/" style="text-decoration: none; color: var(--fgColor-default);">no adsime</a>
	</h1>
	<nav>
		<div class="searchbar">
			<input id="search" type="text" placeholder="Search" bind:value={term} />
			<div
				class="results"
				style={searched.length === 0 && !searching && term === '' ? 'display: none;' : ''}
			>
				{#if searching && searched.length === 0}
					<p>Searching ...</p>
				{:else if !searching && searched.length === 0 && term !== ''}
					<p>No Results!</p>
				{:else}
					{#each searched as result}
						<div class="result">
							<img src={result.img} alt={result.title} />
							<a href={result.href}>{result.title}</a>
						</div>
					{/each}
				{/if}
			</div>
		</div>
		<a href="/">Home</a>
		<a href="/trending">Trending</a>
		<a href="https://github.com/nulxn/ani">Github</a>
	</nav>
</header>

<div id="searched"></div>

<main>
	{@render children()}
</main>

<footer>
	<p>© 2024 nulxn</p>
</footer>

<style>
	:root {
		--borderWidth-default: 0.0625rem;
		--borderRadius-default: 0.375rem;
		--outline-focus-width: 0.125rem;

		--base-text-weight-normal: 400;
		--base-text-weight-bold: 500;

		--bgColor-default: #141416;
		--bgColor-muted: #242426;
		--bgColor-inset: #010409;
		--borderColor-default: #363638;
		--borderColor-emphasis: #4e4e50;

		--fgColor-default: #f2f2f7;
		--fgColor-muted: #aeaeb2;
		--fgColor-onEmphasis: #ffffff;

		--fgColor-accent: #0a84ff;
		--fgColor-accent-hover: #007aff;
		--fgColor-link: var(--fgColor-accent);
		--fgColor-danger: #ff453a;

		--shadow-resting-xsmall: 0px 1px 0px 0px #000000cc;
		--shadow-floating-medium: 0px 0px 0px 1px #3a3a3c, 0px 8px 16px -4px #00000066,
			0px 4px 32px -4px #00000066, 0px 24px 48px -12px #00000066, 0px 48px 96px -24px #00000066;
	}

	.title {
		font-size: 1.5rem;
		font-weight: var(--base-text-weight-bold);
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: var(--borderWidth-default) solid var(--borderColor-default);
	}

	nav {
		display: flex;
	}

	nav a {
		margin-right: 1rem;
		color: var(--fgColor-default);
	}

	nav a:hover {
		color: var(--fgColor-muted);
	}

	main {
		padding: 1rem;
	}

	footer {
		padding: 1rem;
		border-top: var(--borderWidth-default) solid var(--borderColor-default);
		text-align: center;
	}

	.searchbar {
		position: relative;
		padding-right: 1rem;
	}

	.searchbar input {
		padding: 0.5rem;
		border: var(--borderWidth-default) solid var(--borderColor-default);
		border-radius: var(--borderRadius-default);
		background-color: var(--bgColor-muted);
		color: var(--fgColor-default);
		transition: width 0.3s ease;
	}

	.searchbar input:focus {
		width: 300px;
		outline: none;
		border-color: var(--fgColor-accent);
	}

	.results {
		position: absolute;
		top: 100%;
		left: 0;
		width: 100%;
		max-height: 200px;
		background-color: var(--bgColor-muted);
		border: var(--borderWidth-default) solid var(--borderColor-default);
		overflow-y: auto;
	}

	.result {
		display: flex;
		align-items: center;
		padding: 0.5rem;
		border-bottom: var(--borderWidth-default) solid var(--borderColor-default);
	}

	.result img {
		width: 50px;
		height: 50px;
		object-fit: cover;
		margin-right: 0.5rem;
	}
</style>
