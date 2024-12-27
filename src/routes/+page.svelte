<script lang="ts">
	import { _ } from '$lib/jburry';
	import { onMount } from 'svelte';

	onMount(() => {
		_('h1', document).click((e) => {
			if (e) {
				e.innerHTML = 'hello';
			}
		});
	});
</script>

<h1>main</h1>
<h1>main</h1>
<h1>main</h1>
<h1>main</h1>
<h1>main</h1>
