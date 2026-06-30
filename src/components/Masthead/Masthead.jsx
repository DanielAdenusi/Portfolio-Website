import PropTypes from 'prop-types';
import { Typography } from '../ui/Typography/Typography';
import { Container } from '../layout/Container/Container';
import './Masthead.css';

export const Masthead = ({ title, volume, date, location }) => (
  <header className="masthead">
    <Typography as="h1" variant="heading-1" className="masthead__title" isUppercase>
      {title}
    </Typography>
    <Container>
        <div className="masthead__meta typography-sans typography-uppercase typography-tracking-wide typography-bold">
        <span>{volume}</span>
        <span>{date}</span>
        <span>{location}</span>
      </div>
    </Container>
  </header>
);

Masthead.propTypes = {
  title: PropTypes.string.isRequired,
  volume: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
};
