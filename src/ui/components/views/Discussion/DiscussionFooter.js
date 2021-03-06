/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from '../Core/AppText';
import Time from '../Core/Time';
import AvatarRound from '../Avatar/AvatarRound';
import NavigationActions from '../../../navigation-rfc/Navigation/NavigationActions';
import type { Thread } from '../../../../lib/schemaTypes';
import Colors from '../../../Colors';

const {
	StyleSheet,
	TouchableOpacity,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	author: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	info: {
		flex: 1,
		paddingHorizontal: 8,
	},

	name: {
		color: Colors.info,
		fontSize: 12,
		lineHeight: 16,
	},

	meta: {
		flexDirection: 'row',
		alignItems: 'center',
	},

	label: {
		fontSize: 10,
		lineHeight: 15,
		color: Colors.grey,
	},

	dot: {
		fontSize: 2,
		lineHeight: 3,
		marginHorizontal: 4,
	},
});

type Props = {
	thread: Thread;
	onNavigation: Function;
	style?: any;
}

export default class DiscussionFooter extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.shape({
			updateTime: PropTypes.number.isRequired,
			creator: PropTypes.string.isRequired,
			counts: PropTypes.shape({
				children: PropTypes.number,
			}),
		}).isRequired,
		onNavigation: PropTypes.func.isRequired,
		style: View.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_goToProfile: Function = () => {
		const { thread } = this.props;

		this.props.onNavigation(new NavigationActions.Push({
			name: 'profile',
			props: {
				user: thread.creator,
			},
		}));
	};

	render() {
		const {
			thread,
		} = this.props;

		const responses = thread.counts && thread.counts.children ? thread.counts.children : 0;

		let reseponsesLabel;

		switch (responses) {
		case 0:
			reseponsesLabel = 'No responses';
			break;
		case 1:
			reseponsesLabel = '1 response';
			break;
		default:
			reseponsesLabel = `${responses} responses`;
		}

		return (
			<View {...this.props} style={[ styles.author, this.props.style ]}>
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={this._goToProfile}
					style={styles.avatar}
				>
					<AvatarRound
						size={26}
						user={thread.creator}
					/>
				</TouchableOpacity>
				<View style={styles.info}>
					<AppText style={styles.name}>{thread.creator}</AppText>
					<View style={styles.meta}>
						<Time
							style={styles.label}
							type='long'
							time={thread.createTime}
						/>
						<AppText style={styles.dot}>●</AppText>
						<AppText style={styles.label}>{reseponsesLabel}</AppText>
					</View>
				</View>
			</View>
		);
	}
}
