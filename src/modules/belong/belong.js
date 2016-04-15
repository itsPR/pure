/* @flow */

import { bus, cache, config } from '../../core-server';
import winston from 'winston';
import { room as Room, roomrel as RoomRel } from '../../models/models';
import * as place from './place';
import * as constants from '../../lib/Constants';
import uuid from 'node-uuid';
import * as pg from '../../lib/pg';
import type { User } from './../../lib/schemaTypes';

// postgres mock, because jest is acting up.

// const pg = {
// 	read: (conn, sql, cb) => {
// 		setImmediate(() => cb(null, [
// 			{
// 				id: '5055f5b6-466e-46bc-a55d-fe020ee9ac42',
// 				name: 'Bangalore',
// 				identities: [ 'place:ChIJbU60yXAWrjsR4E9-UejD3_g' ]
// 			}
// 		]));
// 	}
// };

// */

function typeStringToNumber(type) {
	switch (type) {
	case 'home':
		return constants.ROLE_HOME;
	case 'work':
		return constants.ROLE_WORK;
	case 'hometown':
		return constants.ROLE_HOMETOWN;
	}
	return 0;
}

function addRooms(change, addable) {
	for (const stub of addable) {
		if (stub.id) { /* already in db */ continue; }

		stub.id = uuid.v4();

		change[stub.id] = new Room({
			id: stub.id,
			name: stub.name,
			tags: [ stub.type ],
			identities: [ stub.identity ]
		});
	}
}

function addRels(change, user:any, resources, addable) {
	for (const stub of addable) {
		if (stub.exists) continue;
		const rel = new RoomRel({
			user: user.id,
			item: stub.id,
			roles: [ ...stub.rels, constants.ROLE_FOLLOWER ],
			resources
		});

		change[rel.id] = rel;
	}
}

function removeRels(change, removable) {
	for (const rel of removable) {
		console.log("REL: ", rel);
		change[rel.id] = new RoomRel({ id: rel.id, roles: [], item: rel.item, user: rel.user });
	}
}

function sendInvitations (resources, user, deletedRels, relRooms, ...stubsets) {
	const stubs = {}, changedRels = {},
		all = [], addable = [], removable = [],
		change = {};

	console.log("sendInvitiations fired");
	console.log("User", user);
	console.log("DeletedRels:", deletedRels);
	console.log("relRooms:", relRooms);
	console.log("stubsets:", stubsets);

	deletedRels = deletedRels.map(typeStringToNumber);

	console.log("DeletedRels:", deletedRels);
	for (const stubset of stubsets) {
		changedRels[stubset.rel] = true;

		for (const stub of stubset.stubs) {
			stub.rels = [ stubset.rel ];
			if (!stubs[stub.identity]) {
				stubs[stub.identity] = stub;
			} else {
				stubs[stub.identity].rels.push(stubset.rel);
			}
		}
	}

	for (const relRoom of relRooms) {
		const identity = relRoom.room.identities.filter(
			ident => ident.substr(0, 6) === 'place:'
		)[0];

		if (stubs[identity]) {
			stubs[identity].exists = true;
		} else {
			const type = relRoom.roomrel.roles.filter(role =>
				role >= constants.ROLE_HOME &&
				role <= constants.ROLE_HOMETOWN
			)[0];

			console.log('TYPE: ', type, typeStringToNumber(type));
			if (changedRels[type] || deletedRels.indexOf(type) >= 0) {
				console.log("Add to removable", relRoom);
				removable.push(relRoom.roomrel);
			} else {
				all.push({ identity, type, name: relRoom.room.name });
			}
		}
	}

	for (const identity in stubs) {
		const stub = stubs[identity];

		all.push(stub);
		if (!stub.exists) { addable.push(stub); }
	}

	pg.read(config.connStr, {
		$: 'SELECT * FROM "rooms" WHERE identities && &{idents}',
		idents: addable.map(a => a.identity)
	}, (err, rooms) => {
		if (err) { winston.error(err); return; }
		for (let room of rooms) {
			room = new Room(room);

			const stub = stubs[room.identities.filter(
				ident => ident.substr(0, 6) === 'place:'
			)[0]];

			if (stub) stub.id = room.id;
		}

		addRooms(change, addable);
		addRels(change, user, resources, addable);
		removeRels(change, removable);

		bus.emit('change', { entities: change, source: 'belong' });
	});
}

bus.on('change', change => {

	/* While the work of this module is asynchronous, it will allow
	the change to continue immediately and emit a new change when the
	work is complete. */

	winston.info('Belong: change: ', change);
	if (change.entities) {
		for (const id in change.entities) {
			const user:User = change.entities[id],
				deletedRels = [],
				promises = [];

			if (
				user.type !== constants.TYPE_USER ||
				!user.params || !user.params.places
			) { continue; }

			console.log("User event");
			if (user.params && user.params.places) {
				const { home, work, hometown } = user.params.places;

				if (home && home.id) {
					promises.push(place.getStubset(home.id, constants.ROLE_HOME));
				}

				if (work && work.id) {
					promises.push(place.getStubset(work.id, constants.ROLE_WORK));
				}

				if (hometown && hometown.id) {
					promises.push(place.getStubset(hometown.id, constants.ROLE_HOMETOWN));
				}

				for (const rel in user.params.places) {
					if (user.params.places[rel] === null) {
						deletedRels.push(rel);
					}
				}
			} else {
				return;
			}

			console.log("Places exists");
			/* Fetch the current rooms of this user. */
			const currentRels = new Promise((resolve, reject) => {
				cache.query({
					type: 'roomrel',
					link: { room: 'item' },
					filter: { user: id, roles_cts: [ constants.ROLE_FOLLOWER ] },
					order: 'createTime'
				}, [ -Infinity, Infinity ], (err, results) => {
					if (err) { reject(err); return; }
					console.log("Current rooms counts:". results);
					resolve(results);
				});
			});

			const resource = change && change.auth && change.auth.resource;

			Promise.all([ currentRels, ...promises ])
			.then((res) => sendInvitations({
				[resource]: constants.PRESENCE_FOREGROUND
			}, user, deletedRels, ...res))
			.catch(err => winston.error(err));
		}
	}
});
