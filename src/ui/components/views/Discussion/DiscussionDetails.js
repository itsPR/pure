/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PageLoading from '../Page/PageLoading';
import PageEmpty from '../Page/PageEmpty';
import DiscussionDetailsCard from './DiscussionDetailsCard';
import PeopleListContainer from '../../containers/PeopleListContainer';
import type { Thread } from '../../../../lib/schemaTypes';

const {
	ScrollView,
} = ReactNative;

type Props = {
	thread: ?Thread | { type: 'loading' };
	onNavigation: Function;
}

export default class DiscussionDetails extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.object,
		onNavigation: PropTypes.func.isRequired,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const {
			thread,
			onNavigation,
		} = this.props;

		if (thread) {
			if (thread.type === 'loading') {
				return <PageLoading />;
			}

			return (
				<ScrollView {...this.props}>
					<DiscussionDetailsCard thread={thread} onNavigation={onNavigation} />
					<PeopleListContainer thread={thread.id} onNavigation={onNavigation} />
				</ScrollView>
			);
		} else {
			return <PageEmpty label='Discussion not found' image='sad' />;
		}
	}
}
