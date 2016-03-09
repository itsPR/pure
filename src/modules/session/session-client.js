/* @flow */

import { bus } from '../../core-client';
import { subscribe } from '../../modules/store/store';
import PersistentStorage from '../../lib/PersistentStorage';

const sessionStorage = new PersistentStorage('session');

async function initializeSession() {
	let session;

	try {
		session = await sessionStorage.getItem('id');
	} catch (e) {
		// do nothing
	}

	const changes: { auth?: { session: string } } = {
		state: {
			session
		}
	};

	if (session) {
		changes.auth = {
			session
		};
	}

	bus.emit('change', changes);
}

bus.on('error', changes => {
	if (changes.state && changes.state.signin) {
		bus.emit('change', {
			state: {
				session: null
			}
		});
	}
});

bus.on('postchange', changes => {
	if (changes.state && 'session' in changes.state) {
		const { session } = changes.state;

		if (session) {
			if (session === '@@loading') {
				return;
			}

			sessionStorage.setItem('id', changes.state.session);
		} else {
			sessionStorage.removeItem('id');
		}
	}
});

bus.on('state:init', state => (state.session = '@@loading'));

subscribe({ type: 'state', path: 'connectionStatus', source: 'session' }, status => {
	if (status === 'online') {
		initializeSession();
	}
});
