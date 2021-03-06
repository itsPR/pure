/* @flow */

export default class GCMPreferences {
	static getRegistrationToken: () => Promise<string>;
	static saveSession: (session: string) => void;
	static setPreference: (key: string, value: string) => void;
	static getPreference: (key: string) => Promise<string>;
}
