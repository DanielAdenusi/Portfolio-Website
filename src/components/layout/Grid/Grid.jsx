import PropTypes from 'prop-types';
import './Grid.css';

export const Grid = ({ cols = 12, className = '', children }) => (
  <div className={`grid ${className}`} style={{ '--grid-cols': cols }}>
    {children}
  </div>
);

Grid.propTypes = {
  cols: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node,
};