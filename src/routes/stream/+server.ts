import { json } from '@sveltejs/kit';

export async function GET({ request }) {
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	let path = searchParams.get('path');
	if (!path) return json({ error: 'No path provided' }, { status: 400 });
	path.replaceAll('//', '/');

	try {
		const res = await fetch(path);

		const fileName = path.split('/').pop() || 'stream';
		const isM3U8 = fileName.endsWith('.m3u8');
		const contentType = isM3U8 ? 'application/vnd.apple.mpegurl' : 'video/mp2t';

		const body = isM3U8 ? await res.text() : await res.arrayBuffer();

		return new Response(body, {
			status: res.status,
			headers: {
				'Content-Type': contentType,
				'Content-Disposition': `inline; filename="${fileName}"`,
				'Cache-Control': 'no-cache'
			}
		});
	} catch (error: any) {
		return json({ error: 'Failed to fetch the file', details: error.message }, { status: 500 });
	}
}
