/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import NavigationRoot from './Navigation/NavigationRoot';
import NavigationScene from './Navigation/NavigationScene';
import NavigationView from './Navigation/NavigationView';
import UserSwitcherContainer from '../containers/UserSwitcherContainer';
import ModalHost from './Core/ModalHost';
import routeMapper from '../../routeMapper';
import { convertRouteToState, convertURLToState } from '../../../lib/Route';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flex: 1,
	},
	inner: {
		flex: 1,
	},
});

const PERSISTANCE_KEY = __DEV__ ? 'FLAT_PERSISTENCE_0' : null;

type Props = {
	initialURL: ?string
};

export default class Home extends Component<void, Props, void> {
	static propTypes = {
		initialURL: PropTypes.string,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleGoBack = () => {
		if (ModalHost.isOpen()) {
			ModalHost.requestClose();
			return true;
		}

		return false;
	};

	_renderScene = (props: any) => {
		return <NavigationScene {...props} routeMapper={routeMapper} />;
	};

	_renderNavigator = (props: any) => {
		return (
			<NavigationView
				{...props}
				renderScene={this._renderScene}
				onGoBack={this._handleGoBack}
			/>
		);
	};

	render() {
		const { initialURL } = this.props;
		const initialState = initialURL ? convertURLToState(initialURL) : convertRouteToState({ name: 'home' });

		return (
			<View style={styles.container}>
				<UserSwitcherContainer />
				<View style={styles.inner}>
					<NavigationRoot
						initialState={initialState}
						persistenceKey={initialURL ? null : PERSISTANCE_KEY}
						renderNavigator={this._renderNavigator}
					/>
				</View>
				<ModalHost />
			</View>
		);
	}
}
