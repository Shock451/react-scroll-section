import React from 'react';
import debounce from 'debounce';
import PropTypes from 'prop-types';
import { Provider } from './scrollContext';

export default class ScrollingProvider extends React.Component {
  static propTypes = {
    /** ms. to wait until the calculation of the current section */
    debounceDelay: PropTypes.number,
    /** scrolling style */
    scrollBehavior: PropTypes.oneOf(['auto', 'smooth']),
    /** Vertical offset regarding the Section */
    offset: PropTypes.number,
    /** React component */
    children: PropTypes.node,
  };

  static defaultProps = {
    debounceDelay: 50,
    scrollBehavior: 'smooth',
    children: null,
    offset: 0,
  };

  state = {
    selected: '',
  };

  refList = {};

  componentDidMount() {
    document.addEventListener('scroll', this.debounceScroll, true);
    this.handleScroll();
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.debounceScroll, true);
  }

  handleScroll = () => {
    const selected = Object.entries(this.refList).reduce(
      (acc, [key, value]) => {
        const { top } = value.current.getBoundingClientRect();
        const differenceFromTop = Math.abs(top);

        return differenceFromTop < acc.differenceFromTop
          ? {
              differenceFromTop,
              key,
            }
          : acc;
      },
      {
        differenceFromTop: 9999,
        key: '',
      },
    );

    if (this.state.selected !== selected.key)
      this.setState({ selected: selected.key });
  };

  debounceScroll = debounce(this.handleScroll, this.props.debounceDelay || 50);

  registerRef = (id) => {
    const newRef = React.createRef();
    this.refList = { ...this.refList, [id]: newRef };
    return newRef;
  };

  scrollTo = (section) => {
    const { scrollBehavior: behavior, offset } = this.props;
    const sectionRef = this.refList[section];
    if (!sectionRef) return console.warn('Section ID not recognized!'); // eslint-disable-line

    const top = sectionRef.current.offsetTop + offset;

    return this.setState({ selected: section }, () =>
      window.scrollTo({
        top,
        behavior,
      }),
    );
  };

  render() {
    const { selected } = this.state;
    const { children } = this.props;

    const value = {
      registerRef: this.registerRef,
      scrollTo: this.scrollTo,
      refList: this.refList,
      selected,
    };

    return <Provider value={value}>{children}</Provider>;
  }
}
