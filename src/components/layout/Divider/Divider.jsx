import PropTypes from 'prop-types';
import './Divider.css';

export const Divider = ({ className = '' }) => (
  <hr className={`divider ${className}`} />
);

Divider.propTypes = {
  className: PropTypes.string,
};
