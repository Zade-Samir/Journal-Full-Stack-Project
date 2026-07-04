import React, { useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

export const InputField = React.forwardRef(({ className, onInput, ...props }, ref) => {
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
      rows={1}
      className={cn(
        "w-full bg-card-bg border-0 rounded-xl px-4 py-3 text-text-primary resize-none overflow-hidden block leading-relaxed",
        "placeholder:text-text-tertiary focus:ring-2 focus:ring-brand/20 focus:outline-none transition-shadow",
        "no-scrollbar",
        className
      )}
      {...props}
    />
  );
});

InputField.displayName = 'InputField';
