"use strict";
jest.autoMockOff();

let constants = require("../../../lib/constants"),
	Counter = require("../../../lib/counter"),
	{ bus, cache } = require("../../../core");

require("../note");
describe("create note for a text relation(item present in entities)", () => {
	bus.emit("setstate", {
		entities: {
			"hags732-dsf-sdr32-32eds": {
				id: "hags732-dsf-sdr32-32eds",
				body: "some text message",
				type: constants.TYPE_TEXT,
				tags: [constants.TAG_POST_STICKY],
				parents: [["sdf43-dsf43-f34-r-w", "scrollback"]],
				creator: "sbtestinguser",
				createTime: Date.now()
			},
			"testinguser_hags732-dsf-sdr32-32eds": {
				"user": "testinguser",
				item: "hags732-dsf-sdr32-32eds",
				role: constants.ROLE_MENTIONED,
				type: constants.TYPE_TEXTREL
			}
		}
	}, (e, c) => {
		console.log(c.entities["testinguser_1_hags732-dsf-sdr32-32eds"])
		expect(c.entities["testinguser_1_hags732-dsf-sdr32-32eds"]).toEqual({
			  user: 'testinguser',
			  event: 1,
			  eventTime: 1453364778967,
			  count: 1,
			  score: 50,
			  group: 'sdf43-dsf43-f34-r-w',
			  data: {
				 textId: 'hags732-dsf-sdr32-32eds',
				 from: 'sbtestinguser',
				 text: 'some text message',
				 thread: undefined,
				 createTime: 1453364778965,
				 room: 'scrollback' 
			  }
		});
	});
});

describe("create note for a text(item not in entities)", () => {
	require("../note");
	cache.put({
		entities: {
			"hags732-dsf-sdr32-32eds": 
			{
				id: "hags732-dsf-sdr32-32eds",
				body: "some text message",
				type: constants.TYPE_TEXT,
				tags: [constants.TAG_POST_STICKY],
				parents: [["sdf43-dsf43-f34-r-w", "scrollback"]],
				creator: "sbtestinguser",
				createTime: Date.now()
			}
		}
	});
	bus.emit("setstate", {
		entities: {
			"testinguser_hags732-dsf-sdr32-32eds": {
				"user": "testinguser",
				item: "hags732-dsf-sdr32-32eds",
				role: constants.ROLE_MENTIONED,
				type: constants.TYPE_TEXTREL
			}
		}
	}, (e, c) => {
		console.log(c.entities["testinguser_1_hags732-dsf-sdr32-32eds"]);
		expect(c.entities["testinguser_1_hags732-dsf-sdr32-32eds"]).toEqual({
			  user: 'testinguser',
			  event: 1,
			  eventTime: 1453364778967,
			  count: 1,
			  score: 50,
			  group: 'sdf43-dsf43-f34-r-w',
			  data: {
				 textId: 'hags732-dsf-sdr32-32eds',
				 from: 'sbtestinguser',
				 text: 'some text message',
				 thread: undefined,
				 createTime: 1453364778965,
				 room: 'scrollback' 
			  }
		});
	});
});