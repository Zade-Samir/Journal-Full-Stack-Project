import React, { useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

export const TextArea = React.forwardRef(({ className, onInput, ...props }, ref) => {
  const innerRef = useRef(null);
  
  const handleRef = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const handleInput = (e) => {
    if (innerRef.current) {
      innerRef.current.style.height = 'auto';
      innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
    }
    if (onInput) onInput(e);
  };

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.style.height = 'auto';
      innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
    }
  }, [props.value]);

  return (
    <textarea
      ref={handleRef}
      onInput={handleInput}
      className={cn(
        "w-full bg-transparent border-0 resize-none text-text-primary leading-relaxed overflow-hidden block",
        "placeholder:text-text-tertiary focus:ring-0 focus:outline-none",
        "no-scrollbar",
        className
      )}
      {...props}
    />
  );
});

TextArea.displayName = 'TextArea';
