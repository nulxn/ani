import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { uri, headers } = await request.json();
	let req = await fetch(uri, { headers: headers });
	let res = await req.text();
	return json(res, { status: req.status });
}
