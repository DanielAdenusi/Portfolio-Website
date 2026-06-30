import PropTypes from 'prop-types';
import './Typography.css';

export const Typography = ({ 
  as: Component = 'p', 
  variant = 'body', 
  className = '', 
  children,
  isMuted = false,
  isUppercase = false,
  isBold = false,
  ...props 
}) => {
const baseClasses = {
    'display': 'typography-display typography-bold',
    'heading-1': 'typography-bold typography-6xl',
    'heading-2': 'typography-bold typography-4xl',
    'heading-3': 'typography-bold typography-2xl',
    'subheading': 'typography-font-sans typography-xs typography-uppercase typography-wide typography-bold',
    'body': 'typography-body typography-font-serif typography-body',
    'body-sans': 'typography-body-sans typography-font-sans typography-sm',
    'caption': 'typography-caption typography-font-sans typography-sm',
    'muted': 'typography-muted typography-font-sans typography-sm',
  };

  const classNames = [
    "typography",
    variant ? baseClasses[variant] : '',
    isMuted ? 'typography-muted' : '',
    isUppercase ? 'typography-uppercase' : '',
    isBold ? 'typography-bold' : '',
    className
  ].filter(Boolean).join(' ').trim();

  return (
    <Component className={classNames} {...props}>
      {children}
    </Component>
  );
};

Typography.propTypes = {
  as: PropTypes.elementType,
  variant: PropTypes.oneOf(['display', 'heading-1', 'heading-2', 'heading-3', 'subheading', 'body', 'body-sans', 'caption', 'muted']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  isMuted: PropTypes.bool,
  isUppercase: PropTypes.bool,
  isBold: PropTypes.bool,
};

export default Typography;
