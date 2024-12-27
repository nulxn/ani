<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>no ads!</title>
	<style>
		:root {
			--bg: white;
		}

		body {
			background-color: var(--bg);
		}
	</style>
</svelte:head>

<main>
	{@render children()}
</main>

<style>
</style>
