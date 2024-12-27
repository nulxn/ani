<script>
	import { browser } from '$app/environment';

	let headerHeight = $state(0);
	let footerHeight = $state(0);
	let windowHeight = $state(0);
	let mainHeight = $derived(windowHeight - headerHeight - footerHeight - 60);
	function calcHeight() {
		if (browser) {
			windowHeight = window.innerHeight;
			headerHeight = document.querySelector('header')?.clientHeight ?? 0;
			footerHeight = document.querySelector('footer')?.clientHeight ?? 0;
		}
	}

	calcHeight();

	if (browser) {
		window.addEventListener('resize', calcHeight);
	}
</script>

<div class="page" style="height: {mainHeight}px;"><h1>home</h1></div>
