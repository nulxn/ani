<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="center">
	<h1>{page.status}</h1>
	<p>{page.error?.message}</p>
	<a href="/">Go back</a>
</div>

<style>
    .center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .center h1 {
        font-size: 2rem;
        margin: 0;
        padding: 0;
    }
</style>
