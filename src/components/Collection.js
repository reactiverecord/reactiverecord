import React, { Component } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps, areStatesEqual, areStatePropsEqual, ReactiveResource } from './connectFunctions';
import { pick } from '../utils';

export default class Collection extends Component {
  static defaultProps = {
    fetch: true,
  };
  constructor(props, context) {
    super(props, context);
    const connectOptions = {
      areStatesEqual: areStatesEqual(props),
      areStatePropsEqual,
    };
    this.Collection = connect(
      mapStateToProps('Collection'),
      null,
      null,
      connectOptions
    )(ReactiveResource);
  }

  componentDidMount() {
    this.props.for.ReactiveRecord.dispatch = this.props.for.ReactiveRecord.dispatch || this.props.dispatch;
    this.load();
  }

  componentDidUpdate(prevProps) {
    let prop = null;
    for (prop in pick.call(prevProps, 'for', 'where', 'fetch')) {
      if (JSON.stringify(prevProps[prop]) !== JSON.stringify(this.props[prop])) {
        this.load();
        break;
      }
    }
  }

  render() {
    const { Collection, props } = this;
    return <Collection {...props} />;
  }

  load = options => {
    if (this.props.fetch) {
      const value = this.props.for.all(this.props.where, options);
      if (this.props.then) {
        value.then(this.props.then);
      }
      if (this.props.catch) {
        value.catch(this.props.catch);
      }
    }
  };

  reload = (options = { invalidateCache: true }) => {
    this.load(options);
  };
}
