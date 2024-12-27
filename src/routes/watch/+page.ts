import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
	return {
		id: url.searchParams.get('id') || null,
		episode: Number(url.searchParams.get('episode')) || null
	};
};
