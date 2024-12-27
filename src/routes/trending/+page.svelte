<script lang="ts">
	import { browser } from '$app/environment';

	let trending: {
		img: string;
		name: string;
		href: string | undefined;
		release: string | null | undefined;
	}[] = $state([]);
	if (browser) {
		fetch(`https://anitaku.bz/popular.html`)
			.then((res) => res.text())
			.then((html) => {
				let parser = new DOMParser();
				let doc = parser.parseFromString(html, 'text/html');

				let body = doc.querySelector('.main_body');
				let lis = body?.querySelectorAll('li');
				lis?.forEach((li) => {
					let img = li.querySelector('img')?.src ?? '';
					let name = li.querySelector('.name')?.querySelector('a')?.textContent ?? '';
					let href = li
						.querySelector('.name')
						?.querySelector('a')
						?.href.replace('/category/', '/watch?id=');
					let release = li.querySelector('.released')?.textContent;

					if(img.length === 0 || name.length === 0 || !href) return;

					trending.push({
						img,
						name,
						href,
						release
					});
				});
			});
	}
</script>

<div class="trending">
	{#each trending as { img, name, href, release }, i}
		<div class="trending-item" style="animation-delay: {i * 0.1}s">
			<a {href}>
				<img src={img} alt={name} />
				<div class="trending-item-info">
					<h3>{name}</h3>
					<p>{release}</p>
				</div>
			</a>
		</div>
	{/each}
</div>

<style>
	.trending {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.trending-item {
		position: relative;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.trending-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.trending-item-info {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0.5);
		padding: 0.5rem;
		color: white;
	}

	.trending-item-info h3 {
		margin: 0;
	}

	.trending-item-info p {
		margin: 0;
	}
</style>
