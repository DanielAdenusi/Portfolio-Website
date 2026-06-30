import PropTypes from 'prop-types';
import './Tag.css';

const Tag = ({ dot = false, children, className = '' }) => (
  <div className={`tag ${className}`}>
    {dot && <span className="tag__dot"></span>}
    <span className="tag__text">{children}</span>
  </div>
);

Tag.propTypes = {
  dot: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Tag;