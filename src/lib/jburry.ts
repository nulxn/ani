export const _ = (query: string, doc: Document) => {
	const elements = doc.querySelectorAll(query);
	let methods = {
		click: (callback: (e: Element | null) => void) => {
			if (elements.length >= 1) {
				elements.forEach((element) => {
					element.addEventListener('click', () => callback(element));
				});
			}
		},
		play: () => {
			elements.forEach((element) => {
				if (element instanceof HTMLVideoElement) {
					element.play();
				}
			});
		},
		pause: () => {
			elements.forEach((element) => {
				if (element instanceof HTMLVideoElement) {
					element.pause();
				}
			});
		},
		currentTime: (time: number) => {
			elements.forEach((element) => {
				if (element instanceof HTMLVideoElement) {
					element.currentTime = element.currentTime + time;
				}
			});
		},
        restart: () => {
            elements.forEach((element) => {
                if (element instanceof HTMLVideoElement) {
                    element.currentTime = 0;
                }
            });
        }
	};

	return methods;
};
