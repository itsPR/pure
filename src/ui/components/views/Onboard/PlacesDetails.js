/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import PlacesSelectorTip from '../Account/PlacesSelectorTip';
import PlacesSelectorContainer from '../../containers/PlaceSelectorContainer';
import LocationListener from '../../../modules/LocationListener';

type Props = {
	onChangeField: (type: string, value: { [key: string]: string }) => void;
	submitPlaceDetails: () => void;
}

const {
	InteractionManager,
} = ReactNative;

export default class PlacesDetails extends Component<void, Props, void> {
	static propTypes = {
		onChangeField: PropTypes.func.isRequired,
		submitPlaceDetails: PropTypes.func.isRequired,
	};

	componentDidMount() {
		InteractionManager.runAfterInteractions(() => LocationListener.requestEnableLocation({ priority: 'high_accuracy' }));
	}

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_handleSelectPlace: Function = place => {
		this.props.onChangeField('places', { home: place });

		setTimeout(() => this.props.submitPlaceDetails(), 100);
	};

	_renderBlankslate: Function = () => <PlacesSelectorTip type='home' />;

	render() {
		return (
			<PlacesSelectorContainer
				renderBlankslate={this._renderBlankslate}
				onSelectPlace={this._handleSelectPlace}
				searchHint='Search for your apartment'
			/>
		);
	}
}
